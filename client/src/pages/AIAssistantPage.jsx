import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  Info,
  Compass,
  ArrowRight
} from 'lucide-react';
import api from '../services/api.js';

const SUGGESTED_QUESTIONS = [
  'Why is my financial health score low?',
  'Where am I spending the most?',
  'How much should I save every month?',
  'Can I afford this expense?',
  'How can I improve my financial health?',
  'What are my biggest financial risks?',
  'What happens if I increase my monthly investment?',
  'How much can I save in 6 months?',
  'Explain my current financial situation.',
  'Which goal should I prioritize?'
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || loading) return;

    setError(null);
    setLastQuery(textToSend);

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputText('');
    setLoading(true);

    try {
      // Build lightweight conversation history for contextual memory
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.ai.askAssistant(textToSend, historyPayload);

      if (res?.data) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: res.data.answer,
          calculatedFacts: res.data.calculatedFacts || [],
          suggestions: res.data.suggestions || [],
          disclaimer: res.data.disclaimer,
          source: res.data.source,
          fallbackNotice: res.data.fallbackNotice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Unexpected empty response received from assistant.');
      }
    } catch (err) {
      console.error('[AI Assistant Error]:', err);
      setError(err.message || 'Failed to communicate with AI Assistant. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setLastQuery(null);
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E0E8E2]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#14251C] tracking-tight">
                AI Financial Assistant
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#64736A] mt-1">
            Ask natural-language questions about your cash flow, health score, spending, and goals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold rounded-xl border border-[#E0E8E2] hover:border-[#FECACA] transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Chat
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-[11px] font-bold text-[#087F5B]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Guarded</span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 overflow-y-auto bg-white border border-[#E0E8E2] rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        {/* Empty State / Welcome Screen */}
        {messages.length === 0 && !loading && (
          <div className="py-6 sm:py-8 max-w-2xl mx-auto space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B] mx-auto shadow-sm">
              <Compass className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#14251C]">
                How can I assist your financial journey today?
              </h2>
              <p className="text-xs text-[#64736A] leading-relaxed max-w-md mx-auto">
                I synthesize your real MoneyPilot income, expenses, savings rate, and health score to give objective, data-backed guidance.
              </p>
            </div>

            {/* Core Principle Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAFCFA] border border-[#E0E8E2] text-xs text-[#64736A]">
              <span className="w-2 h-2 rounded-full bg-[#087F5B]"></span>
              <span>Principle: <strong className="text-[#14251C]">AI can suggest. The system checks. You decide.</strong></span>
            </div>

            {/* Starter Suggested Questions */}
            <div className="pt-2 text-left space-y-2.5">
              <span className="text-[11px] font-bold text-[#64736A] uppercase tracking-wider block">
                Suggested Financial Questions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(question)}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E0E8E2] bg-[#FAFCFA] hover:bg-[#ECFDF5] hover:border-[#A7F3D0] text-xs text-[#17251D] hover:text-[#087F5B] text-left font-medium transition-all group shadow-2xs"
                  >
                    <span>{question}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#859188] group-hover:text-[#087F5B] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* User Message Bubble */}
            {msg.role === 'user' ? (
              <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                <div className="bg-[#087F5B] text-white rounded-2xl rounded-tr-xs px-4 py-3 text-sm shadow-sm leading-relaxed">
                  {msg.content}
                </div>
                <span className="text-[10px] text-[#859188] block text-right pr-1">
                  {msg.timestamp}
                </span>
              </div>
            ) : (
              /* Assistant Message Card */
              <div className="max-w-[95%] sm:max-w-[85%] space-y-3 bg-[#FAFCFA] border border-[#E0E8E2] rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-sm">
                {/* Header / Source Indicator */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E0E8E2]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B]">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#14251C]">MoneyPilot Assistant</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E0E8E2] text-[#64736A]">
                      {msg.source === 'gemini_ai' ? 'AI Grounded' : 'Calculated by Engine'}
                    </span>
                    <span className="text-[10px] text-[#859188]">{msg.timestamp}</span>
                  </div>
                </div>

                {/* Fallback Notice if applicable */}
                {msg.fallbackNotice && (
                  <div className="text-[11px] bg-amber-50 border border-amber-200/80 rounded-lg p-2 text-amber-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{msg.fallbackNotice}</span>
                  </div>
                )}

                {/* Primary Answer Content */}
                <div className="text-xs sm:text-sm text-[#17251D] leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Verified Calculated Facts Section */}
                {msg.calculatedFacts && msg.calculatedFacts.length > 0 && (
                  <div className="bg-white border border-[#E0E8E2] rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#087F5B]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Calculated by MoneyPilot (Authoritative Figures):</span>
                    </div>
                    <ul className="space-y-1 pl-4 list-disc text-xs text-[#17251D]">
                      {msg.calculatedFacts.map((fact, idx) => (
                        <li key={idx} className="leading-snug">{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Suggestions Section */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="bg-[#ECFDF5] border border-[#A7F3D0]/70 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#14251C]">
                      <Lightbulb className="w-3.5 h-3.5 text-[#087F5B]" />
                      <span>AI Suggestions & Considerations:</span>
                    </div>
                    <ul className="space-y-1 pl-4 list-disc text-xs text-[#066649]">
                      {msg.suggestions.map((sug, idx) => (
                        <li key={idx} className="leading-snug">{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="pt-2 border-t border-[#E0E8E2] text-[10px] text-[#859188] flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  <span>{msg.disclaimer || 'Informational educational guidance based on MoneyPilot records.'}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading / Typing Indicator */}
        {loading && (
          <div className="flex items-start max-w-[85%] space-y-2">
            <div className="bg-[#FAFCFA] border border-[#E0E8E2] rounded-2xl rounded-tl-xs p-4 flex items-center gap-3 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#14251C]">Analyzing verified metrics & calculating guidance...</p>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner with Retry */}
        {error && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#DC2626]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
            {lastQuery && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#FECACA] hover:bg-[#FEE2E2] rounded-lg font-bold self-start sm:self-center transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Question
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border border-[#E0E8E2] rounded-2xl p-2.5 sm:p-3 shadow-sm space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your financial metrics, spending, savings, or health score..."
            maxLength={500}
            disabled={loading}
            className="flex-1 bg-[#FAFCFA] border border-[#E0E8E2] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#17251D] placeholder:text-[#859188] focus:outline-none focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B] transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-4 sm:px-5 py-2.5 bg-[#087F5B] hover:bg-[#066649] disabled:bg-[#D1DED5] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        <div className="flex items-center justify-between px-1 text-[11px] text-[#859188]">
          <span>Shift + Enter for new lines • Press Enter to send</span>
          <span>{inputText.length} / 500 characters</span>
        </div>
      </div>
    </div>
  );
}
