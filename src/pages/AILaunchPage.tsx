import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';
import {
  buildAssignmentPrompt,
  buildCustomCSEPrompt,
  launchInChatGPT,
  launchInGemini,
  launchInClaude,
  launchInPerplexity,
  copyTextToClipboard,
} from '../utils/aiLaunch';
import {
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Code2,
  Cpu,
  Calculator,
  FileText,
  Send,
  Zap,
  Layers,
  Search,
  ArrowUpRight,
} from 'lucide-react';

export const AILaunchPage: React.FC = () => {
  const { subjects, assignments, showToast } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.name || 'Programming & Problem Solving');
  const [topic, setTopic] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<'custom' | 'debug' | 'math' | 'notes'>('custom');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // If student picks an assignment from dropdown
  const activeAssignment = assignments.find((a) => a.id === selectedAssignmentId);

  // Compute live prompt preview
  const currentPrompt = React.useMemo(() => {
    if (activeAssignment) {
      return buildAssignmentPrompt(activeAssignment);
    }
    if (question.trim()) {
      return buildCustomCSEPrompt(selectedSubject, topic, question, selectedTemplate);
    }
    return `I am a 1st Year BTech CSE student studying ${selectedSubject}.\n\nPlease assist me with understanding the fundamental concepts, code implementation, and university exam questions for this subject.`;
  }, [activeAssignment, selectedSubject, topic, question, selectedTemplate]);

  const handleCopy = async () => {
    const success = await copyTextToClipboard(currentPrompt);
    if (success) {
      setCopied(true);
      showToast('Prompt Copied! 📋', 'Paste into Gemini (Ctrl+V) or any AI assistant.', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLaunchChatGPT = () => {
    launchInChatGPT(currentPrompt, (msg, type) => showToast(msg, undefined, type));
  };

  const handleLaunchGemini = () => {
    launchInGemini(currentPrompt, (msg, type) => showToast(msg, undefined, type));
  };

  const handleLaunchClaude = () => {
    launchInClaude(currentPrompt, (msg, type) => showToast(msg, undefined, type));
  };

  const handleLaunchPerplexity = () => {
    launchInPerplexity(currentPrompt, (msg, type) => showToast(msg, undefined, type));
  };

  const templates = [
    {
      id: 'custom',
      label: 'General Doubt / Concept',
      icon: Sparkles,
      placeholder: 'E.g., Explain Time Complexity of QuickSort with recurrence tree diagram...',
    },
    {
      id: 'debug',
      label: 'Code Debugger & Fixer',
      icon: Code2,
      placeholder: 'Paste your C/C++/Python code snippet and the compiler error or segmentation fault here...',
    },
    {
      id: 'math',
      label: 'Math Proof / Logic Derivation',
      icon: Calculator,
      placeholder: 'E.g., Prove that (P ∧ (P → Q)) → Q is a tautology using truth table and inference rules...',
    },
    {
      id: 'notes',
      label: 'Exam Revision Notes',
      icon: FileText,
      placeholder: 'E.g., Generate quick 2-page revision cheat sheet for Unit 3: Pointers and Dynamic Memory Allocation...',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Top Header Banner */}
      <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 brutal-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              DIRECT AI INTEGRATION // 1-CLICK PROMPT LAUNCHER
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white mt-1 tracking-tight font-display">
              AI Study & Assignment Launcher
            </h1>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Write your doubt or select any class assignment. We automatically craft a tailored academic prompt, copy it to your clipboard, and launch directly into Google Gemini or ChatGPT!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleLaunchGemini}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xs font-mono text-xs font-black uppercase bg-blue-600 hover:bg-blue-700 text-white brutal-shadow-sm transition-all hover:translate-y-px"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>OPEN GEMINI</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleLaunchChatGPT}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xs font-mono text-xs font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white brutal-shadow-sm transition-all hover:translate-y-px"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>OPEN CHATGPT</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Template Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Option A: Quick-Select Class Assignment */}
          <div className="p-5 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Select Class Assignment (Optional)
              </label>
              {selectedAssignmentId && (
                <button
                  onClick={() => setSelectedAssignmentId('')}
                  className="font-mono text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="w-full p-2.5 rounded-xs font-mono text-xs bg-slate-50 dark:bg-[#181818] border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="">-- Choose an assignment to auto-generate prompt --</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.subjectCode}] {a.title} (Due: {a.dueDate})
                </option>
              ))}
            </select>
          </div>

          {/* Option B: Custom Question / Code Debugger */}
          {!activeAssignment && (
            <div className="p-5 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow-sm space-y-4">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Or Build Custom Academic Prompt
              </div>

              {/* Template Selector Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {templates.map((tmpl) => {
                  const Icon = tmpl.icon;
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xs font-mono text-[11px] font-bold border transition-all text-center ${
                        isSelected
                          ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 brutal-shadow-xs'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="leading-tight">{tmpl.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Subject Dropdown & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Subject / Course
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 rounded-xs font-mono text-xs bg-slate-50 dark:bg-[#181818] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                    <option value="General Computer Science">General Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Specific Topic / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Pointers, Binary Search Tree..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-2 rounded-xs font-mono text-xs bg-slate-50 dark:bg-[#181818] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Question Textarea */}
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Question, Doubt, or Code Snippet
                </label>
                <textarea
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    templates.find((t) => t.id === selectedTemplate)?.placeholder ||
                    'Type your doubt or paste code...'
                  }
                  className="w-full p-3 rounded-xs font-mono text-xs bg-slate-50 dark:bg-[#181818] border-2 border-slate-900 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden resize-y"
                />
              </div>
            </div>
          )}

          {/* Quick Launch Action Deck */}
          <div className="p-5 rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow-sm space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Launch into Your Favorite AI Service
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Gemini Button */}
              <button
                onClick={handleLaunchGemini}
                className="flex items-center justify-between p-3 rounded-xs border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-200 transition-all font-mono text-xs font-bold group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xs bg-blue-600 text-white flex items-center justify-center font-black">
                    G
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Google Gemini</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                      gemini.google.com
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* ChatGPT Button */}
              <button
                onClick={handleLaunchChatGPT}
                className="flex items-center justify-between p-3 rounded-xs border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 transition-all font-mono text-xs font-bold group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xs bg-emerald-600 text-white flex items-center justify-center font-black">
                    GPT
                  </div>
                  <div className="text-left">
                    <div className="font-bold">ChatGPT (OpenAI)</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                      chatgpt.com (Pre-filled)
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* Claude Button */}
              <button
                onClick={handleLaunchClaude}
                className="flex items-center justify-between p-3 rounded-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all font-mono text-xs font-bold group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xs bg-amber-700 text-white flex items-center justify-center font-black">
                    C
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Anthropic Claude</div>
                    <div className="text-[10px] text-slate-500 font-normal">claude.ai</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* Perplexity Button */}
              <button
                onClick={handleLaunchPerplexity}
                className="flex items-center justify-between p-3 rounded-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all font-mono text-xs font-bold group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xs bg-cyan-700 text-white flex items-center justify-center font-black">
                    P
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Perplexity AI</div>
                    <div className="text-[10px] text-slate-500 font-normal">perplexity.ai</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Formatted Academic Prompt Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 brutal-shadow h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Live Academic Prompt Preview
                </div>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase rounded-xs transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="mt-3 p-3.5 rounded-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-300 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900">
                {currentPrompt}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                <Zap className="w-3.5 h-3.5" />
                HOW IT WORKS:
              </div>
              <p>
                Clicking any launch button copies this exact prompt to your clipboard and opens Gemini or ChatGPT in a new tab. In Gemini, simply press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-xs border border-slate-300 dark:border-slate-700">Ctrl+V</kbd> to paste!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Grid for All Current Pending Assignments */}
      <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 brutal-shadow space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              CLASS ASSIGNMENTS // 1-CLICK LAUNCHERS
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 dark:text-white mt-0.5 font-display">
              Quick Launch for Pending Assignments
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-500 font-bold">
            {assignments.filter((a) => a.published).length} ACTIVE ASSIGNMENTS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {assignments
            .filter((a) => a.published)
            .map((assign) => {
              const prompt = buildAssignmentPrompt(assign);
              return (
                <div
                  key={assign.id}
                  className="p-4 rounded-xs border-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#181818] flex flex-col justify-between space-y-3 brutal-shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                        {assign.subjectCode}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">
                        Due: {assign.dueDate}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                      {assign.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() =>
                        launchInGemini(prompt, (msg, type) => showToast(msg, undefined, type))
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xs font-mono text-[10px] font-bold uppercase bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      title="Launch in Google Gemini"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>GEMINI</span>
                    </button>

                    <button
                      onClick={() =>
                        launchInChatGPT(prompt, (msg, type) => showToast(msg, undefined, type))
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xs font-mono text-[10px] font-bold uppercase bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      title="Launch in OpenAI ChatGPT"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>CHATGPT</span>
                    </button>

                    <button
                      onClick={async () => {
                        await copyTextToClipboard(prompt);
                        showToast('Assignment Prompt Copied! 📋', undefined, 'success');
                      }}
                      className="p-1.5 rounded-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy Prompt"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
