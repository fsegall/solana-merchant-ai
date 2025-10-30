import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { EDGE_FUNCTIONS_BASE, ENABLE_ASSISTED_CHARGE } from '@/config';
import { supabaseHelpers } from '@/lib/supabase-helpers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize greeting message once
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t('chat.greeting'),
          timestamp: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update greeting when language changes (avoid loops)
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      const newGreeting = t('chat.greeting');
      if (messages[0].content !== newGreeting) {
        setMessages([
          {
            role: 'assistant',
            content: newGreeting,
            timestamp: new Date(),
          },
        ]);
      }
    }
    // Depend only on lang to avoid re-running when translation function identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;

      if (!token) throw new Error('no auth token');

      const response = await fetch(`${EDGE_FUNCTIONS_BASE}/chat-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.slice(-5).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: input }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || t('chat.sendError'),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Assisted charge intent (flagged)
      if (ENABLE_ASSISTED_CHARGE && data?.intent === 'create_charge' && typeof data?.amountBRL === 'number') {
        try {
          const ref = `REF${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          await supabaseHelpers.createInvoiceWithPayment(Number(data.amountBRL), ref, []);
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Charge created: R$ ${Number(data.amountBRL).toFixed(2)} — Ref: ${ref}. Open POS to view the QR.`,
              timestamp: new Date(),
            },
          ]);
        } catch (e) {
          console.error('Assisted charge error:', e);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: `❌ ${t('chat.error')}`,
        description: t('chat.errorDescription'),
        variant: 'destructive',
      });
      
      const errorMessage: Message = {
        role: 'assistant',
        content: t('chat.errorRetry'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50"
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96"
          >
            <Card className="shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-lg">{t('chat.title')}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t('chat.placeholder')}
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('chat.hint')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

