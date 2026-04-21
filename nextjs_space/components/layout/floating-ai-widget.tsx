'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };

const PAGE_CONTEXT: Record<string, string> = {
  '/dashboard': 'Executive Dashboard',
  '/finanzen': 'Finanzen & Controlling',
  '/hr': 'Team & Leistung',
  '/sales': 'Sales & Faktura',
  '/abwesenheiten': 'Abwesenheiten',
  '/zeiterfassung': 'Zeiterfassung',
  '/stammdaten': 'Stammdaten',
  '/base': 'System & Daten',
  '/import': 'Daten-Import',
};

const SUGGESTIONS: Record<string, string[]> = {
  '/dashboard': ['Wie steht es um unsere Liquidität?', 'Welche Projekte sind kritisch?', 'Zusammenfassung der Geschäftslage'],
  '/finanzen': ['Wie hat sich der Deckungsbeitrag entwickelt?', 'Welche Kostenstellen sind auffällig?'],
  '/hr': ['Wie ist die aktuelle Auslastung?', 'Welche Mitarbeiter sind auf der Bench?'],
  '/sales': ['Welcher Kunde bringt den meisten Umsatz?', 'Wie sind unsere offenen Posten?'],
};

export function FloatingAIWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const currentPage = Object.entries(PAGE_CONTEXT).find(([path]) => pathname.startsWith(path))?.[1] || '';
  const suggestions = Object.entries(SUGGESTIONS).find(([path]) => pathname.startsWith(path))?.[1] || [
    'Gib mir eine Zusammenfassung der Geschäftslage',
    'Welche KPIs sollte ich im Auge behalten?',
  ];

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
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
          agent: 'general',
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
            } catch { /* skip */ }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuche es erneut.' }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (pathname === '/login' || pathname === '/agent') return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center bg-gradient-to-br from-teal-500 to-violet-600 text-white group"
          aria-label="KI-Assistent öffnen"
        >
          <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-teal-500/10 to-violet-500/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Kapazito KI</p>
                {currentPage && <p className="text-[10px] text-muted-foreground mt-0.5">Kontext: {currentPage}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button onClick={() => setMessages([])} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors text-[10px] font-medium">
                  Neu
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-teal-500" />
                </div>
                <p className="text-sm font-medium mb-1">Wie kann ich helfen?</p>
                <p className="text-xs text-muted-foreground mb-4">Frag mich etwas zu deinen Geschäftsdaten</p>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg border border-border/50 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted/50 rounded-bl-sm'
                )}>
                  <div className="whitespace-pre-wrap break-words">{m.content || (loading && i === messages.length - 1 ? '...' : '')}</div>
                </div>
              </div>
            ))}
            {loading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
              <div className="flex justify-start">
                <div className="bg-muted/50 px-3 py-2 rounded-xl rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Frage stellen..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
