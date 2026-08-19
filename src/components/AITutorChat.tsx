import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment, ChatMessage, Subject } from '../types';
import Markdown from 'react-markdown';
import {
  Bot,
  Send,
  Sparkles,
  Paperclip,
  X,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Code2,
  Cpu,
  Layers,
  Terminal,
  ArrowUpRight,
} from 'lucide-react';

export const AITutorChat: React.FC = () => {
  const { subjects, assignments, aiTutorContext, setAiTutorContext } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: `👋 **CSE AI Study Tutor Active.**\n\nI am configured for **BTech 1st Semester CSE** curriculum: C Programming, Mathematics-I, Physics, Basic Electronics, and Engineering Drawing.\n\nAsk any concept, lab logic, derivation, or problem hints!`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}_user`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
      assignmentContext: aiTutorContext
        ? {
            id: aiTutorContext.id,
            title: aiTutorContext.title,
            subjectName: aiTutorContext.subjectName,
            subjectCode: aiTutorContext.subjectCode,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      let subjectContextStr = '';
      if (selectedSubjectId !== 'all') {
        const found = subjects.find((s) => s.id === selectedSubjectId || s.code === selectedSubjectId);
        if (found) {
          subjectContextStr = `${found.name} (${found.code}): ${found.description || ''}`;
        }
      }

      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          assignmentContext: aiTutorContext
            ? {
                title: aiTutorContext.title,
                description: aiTutorContext.description,
                instructions: aiTutorContext.instructions,
                subjectName: aiTutorContext.subjectName,
                subjectCode: aiTutorContext.subjectCode,
                teacher: aiTutorContext.teacher,
              }
            : undefined,
          subjectContext: subjectContextStr || undefined,
          history: messages.slice(-8),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'AI Tutor failed to respond');
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `${Date.now()}_model`,
        role: 'model',
        text: data.reply || 'Here is the step-by-step reasoning.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errMsg: ChatMessage = {
        id: `${Date.now()}_error`,
        role: 'model',
        text: `⚠️ **Could not connect to AI Tutor:** ${
          error?.message || 'Server error. Please check your internet connection or Gemini API key.'
        }`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: 'C Pointers & Memory',
      prompt: 'Explain pointer arithmetic and memory allocation in C with clean code examples.',
    },
    {
      label: 'Matrix Rank & Echelon',
      prompt: 'How do I calculate the rank of a 3x3 matrix using row-echelon form? Show step-by-step.',
    },
    {
      label: 'Brewster’s Angle Law',
      prompt: 'Explain Brewster’s law of polarization in Physics with formula derivation and diagram description.',
    },
    {
      label: 'BJT Transistor Biasing',
      prompt: 'Explain the working of Common Emitter BJT amplifier with circuit equations.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] font-sans">
      {/* Top AI Header */}
      <div className="p-3.5 border-b-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#121212] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono text-xs font-bold">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                CSE AI ACADEMIC ENGINE
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs font-mono text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Subject Filter selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-500">SUBJECT:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="font-mono text-xs py-1 px-2 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="all">ALL 9 CSE SUBJECTS</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Assignment Grounding Banner */}
      {aiTutorContext && (
        <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/40 flex items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="px-1.5 py-0.5 rounded-xs bg-blue-600 text-white font-bold text-[10px]">
              GROUNDED
            </span>
            <span className="font-bold text-blue-900 dark:text-blue-300 truncate">
              {aiTutorContext.subjectCode}: {aiTutorContext.title}
            </span>
          </div>
          <button
            onClick={() => setAiTutorContext(null)}
            className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white shrink-0 font-bold"
          >
            [CLEAR CONTEXT]
          </button>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 font-mono text-[10px] uppercase font-bold text-slate-400">
                <span>{isUser ? 'STUDENT' : 'CSE AI TUTOR'}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`relative max-w-[88%] sm:max-w-[80%] rounded-md p-4 text-xs sm:text-sm border-2 ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white brutal-shadow-sm'
                    : 'bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 border-slate-900 dark:border-slate-800 brutal-shadow'
                }`}
              >
                {msg.assignmentContext && (
                  <div className="mb-2 pb-2 border-b border-white/20 dark:border-slate-700 font-mono text-[10px] text-blue-300 dark:text-blue-400">
                    Grounded Assignment: {msg.assignmentContext.subjectCode} — {msg.assignmentContext.title}
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
                  <Markdown>{msg.text}</Markdown>
                </div>

                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-slate-500 hover:text-slate-900 dark:hover:text-white pt-2 border-t border-slate-200 dark:border-slate-800"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY ANSWER</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-4 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#121212] font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-fit brutal-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span>ANALYZING CSE CURRICULUM...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-[#0E0E0E] border-t border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase shrink-0">
            PROMPTS:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              className="shrink-0 px-2.5 py-1 rounded-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-slate-800 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              {qp.label} →
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Footer */}
      <div className="p-4 border-t-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#0A0A0A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask question, code debugging, or math derivation..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2.5 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-xs font-bold uppercase tracking-wider hover:bg-blue-600 dark:hover:bg-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed brutal-shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
