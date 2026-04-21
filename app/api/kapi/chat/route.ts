// POST /api/kapi/chat — der Kapi-Agent.
//
// Input:  { sessionId, messages: [{role,content}...], agent?: 'kapi'|'finanz'|... }
// Output: SSE-Stream (text-delta), plus actions[] Sammlung bei requiresApproval.
//
// Implementierung mit Vercel AI SDK: streamText + tools (multi-step).

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { streamText } from 'ai';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { withErrorHandling, parseJson } from '@/lib/api';
import { getLanguageModel } from '@/lib/llm/provider';
import { buildSystemPrompt } from '@/lib/llm/prompts';
import { buildKapiTools } from '@/lib/agent/tools';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/errors';

const chatBody = z.object({
  sessionId: z.string().default(() => crypto.randomUUID()),
  agent: z.enum(['kapi', 'finanz', 'hr', 'sales', 'general']).default('kapi'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).min(1),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'agent:use');
  const body = await parseJson(req, chatBody);

  // Sink fuer Tool-Calls (WRITE-Tools -> AgentAction PENDING).
  const actionSink: Array<{ toolName: string; input: any; output?: any; requiresApproval: boolean }> = [];
  const ctx = { tenantId: session.tenantId, userId: session.id, actionSink };
  const tools = buildKapiTools(ctx);

  // Letzte User-Message persistieren.
  const lastUser = body.messages.filter((m) => m.role === 'user').pop();
  if (lastUser) {
    await prisma.chatMessage.create({
      data: {
        tenantId: session.tenantId,
        userId: session.id,
        sessionId: body.sessionId,
        role: 'user',
        content: lastUser.content,
        agent: body.agent,
      },
    });
  }

  const systemPrompt = buildSystemPrompt(body.agent, session.tenantName);

  let assistantText = '';
  const result = await streamText({
    model: getLanguageModel(),
    system: systemPrompt,
    messages: body.messages,
    tools,
    maxSteps: 6,
    onStepFinish: (step) => {
      if (step.text) assistantText += step.text;
    },
    onFinish: async ({ text, usage }) => {
      await prisma.chatMessage.create({
        data: {
          tenantId: session.tenantId,
          userId: session.id,
          sessionId: body.sessionId,
          role: 'assistant',
          content: text,
          agent: body.agent,
          tokensIn: usage.promptTokens,
          tokensOut: usage.completionTokens,
        },
      });

      // AgentActions fuer die Approval-Queue persistieren.
      for (const a of actionSink.filter((x) => x.requiresApproval)) {
        await prisma.agentAction.create({
          data: {
            tenantId: session.tenantId,
            userId: session.id,
            agent: body.agent,
            toolName: a.toolName,
            input: a.input,
            output: a.output,
            status: 'PENDING',
          },
        });
      }
      logger.info({ tenantId: session.tenantId, sessionId: body.sessionId, pending: actionSink.filter((x) => x.requiresApproval).length }, 'Kapi-Turn abgeschlossen');
    },
  });

  return result.toDataStreamResponse();
});
