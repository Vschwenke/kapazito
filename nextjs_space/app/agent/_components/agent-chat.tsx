'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BarChart3, Users, TrendingUp, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };
type AgentType = 'general' | 'finanz' | 'hr' | 'sales';

const AGENTS: { id: AgentType; label: string; desc: string; icon: any; color: string }[] = [
  { id: 'general', label: 'PulseBI Assistent', desc: 'Allgemeine Gesch\u00e4ftsberatung', icon: Bot, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'finanz', label: 'Finanz-Analyst', desc: 'BWA, Cashflow, Deckungsbeitrag', icon: BarChart3, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'hr', label: 'HR-Berater', desc: 'Auslastung, Team, Gehalt', icon: Users, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'sales', label: 'Sales-Stratege', desc: 'Kunden, Stundens\u00e4tze, Pipeline', icon: TrendingUp, color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<AgentType>('general');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          agent,
        }),
      });

      if (!response.ok) throw new Error('Anfrage fehlgeschlagen');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let partialRead = '';
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split('\n');
        partialRead = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              assistantContent += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            } catch (e) { /* skip */ }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentAgent = AGENTS.find(a => a.id === agent) || AGENTS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Agent selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {AGENTS.map(a => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => { setAgent(a.id); setMessages([]); }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap',
                agent === a.id ? a.color + ' shadow-sm' : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', currentAgent.color.split(' ').slice(0, 1).join(' '))}>
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{currentAgent.label}</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-6">{currentAgent.desc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {agent === 'finanz' && [
                'Wie ist unsere aktuelle Umsatzrendite?',
                'Analysiere unseren Cashflow und gib Empfehlungen',
                'Welche Kosten k\u00f6nnen wir optimieren?',
                'Erstelle eine Deckungsbeitrags-Bewertung',
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground transition-colors">{q}</button>
              ))}
              {agent === 'hr' && [
                'Wie ist die aktuelle Auslastung des Teams?',
                'Analysiere unsere Fluktuationsrate',
                'Welche Mitarbeiter sind unterbesch\u00e4ftigt?',
                'Gib Empfehlungen zur Gehaltsstruktur',
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground transition-colors">{q}</button>
              ))}
              {agent === 'sales' && [
                'Welche Kunden bringen am meisten Umsatz?',
                'Wie k\u00f6nnen wir unsere Stundens\u00e4tze optimieren?',
                'Analysiere das Wachstumspotenzial',
                'Welche Cross-Selling-M\u00f6glichkeiten gibt es?',
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground transition-colors">{q}</button>
              ))}
              {agent === 'general' && [
                'Gib mir einen \u00dcberblick \u00fcber die Gesch\u00e4ftslage',
                'Was sind die wichtigsten KPIs f\u00fcr IT-Dienstleister?',
                'Wie verbessere ich die Profitabilit\u00e4t?',
                'Welche Benchmarks sollte ich anstreben?',
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="text-left p-3 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground transition-colors">{q}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-card border border-border shadow-sm rounded-bl-md'
            )}>
              <div className="whitespace-pre-wrap">{msg.content || (loading && i === messages.length - 1 ? '' : '')}</div>
              {loading && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                <div className="flex items-center gap-1 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="mt-4 flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Fragen Sie den ${currentAgent.label}...`}
            rows={1}
            className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-card text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
