import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  GitCompare, 
  Binary, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  FileCode,
  RotateCcw
} from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  onRunTests: () => void;
  isRunning: boolean;
  onOpenDiff: () => void;
  onOpenTracer: () => void;
  onResetCode: () => void;
  hasTraceSupport: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRunTests,
  isRunning,
  onOpenDiff,
  onOpenTracer,
  onResetCode,
  hasTraceSupport
}) => {
  const [copied, setCopied] = useState(false);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');

  // Sync scrolling between line numbers and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Keyboard shortcuts: Tab key support and Cmd/Ctrl + Enter to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunTests();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '  ';

      const nextCode = code.substring(0, start) + spaces + code.substring(end);
      onChange(nextCode);

      // Restore cursor position after state update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const toggleBreakpoint = (lineNum: number) => {
    const next = new Set(breakpoints);
    if (next.has(lineNum)) {
      next.delete(lineNum);
    } else {
      next.add(lineNum);
    }
    setBreakpoints(next);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCode = () => {
    // Basic automatic re-indentation
    const rawLines = code.split('\n');
    let indentLevel = 0;
    const formatted = rawLines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease indent for closing braces
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentedLine = '  '.repeat(indentLevel) + trimmed;

      // Increase indent for opening braces
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        indentLevel++;
      }

      return indentedLine;
    }).join('\n');

    onChange(formatted);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-slate-800 select-none">
      {/* Editor Header Bar */}
      <div className="h-10 bg-[#161b22] border-b border-slate-800 px-3 flex items-center justify-between text-xs">
        {/* Tab & File Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0d1117] border-t border-amber-500/80 rounded-t text-slate-200 font-mono text-[11px]">
            <FileCode className="h-3.5 w-3.5 text-amber-400" />
            <span>solution.js</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">JavaScript (ES2024)</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {hasTraceSupport && (
            <button
              onClick={onOpenTracer}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-sky-800/40 text-[11px] transition cursor-pointer"
              title="Step-by-step Execution Visualizer"
            >
              <Binary className="h-3.5 w-3.5 text-sky-400" />
              <span>Trace Visualizer</span>
            </button>
          )}

          <button
            onClick={onOpenDiff}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-[11px] transition cursor-pointer"
            title="Compare diff with initial buggy code"
          >
            <GitCompare className="h-3.5 w-3.5 text-amber-400" />
            <span>Diff View</span>
          </button>

          <button
            onClick={formatCode}
            className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition cursor-pointer"
            title="Auto-indent code"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={copyCode}
            className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] transition cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Primary Run Test Action */}
          <button
            onClick={onRunTests}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              isRunning 
                ? 'bg-amber-600/50 text-amber-200 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            <Play className={`h-3 w-3 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
            <kbd className="hidden sm:inline text-[9px] opacity-75 font-mono ml-0.5">⌘↵</kbd>
          </button>
        </div>
      </div>

      {/* Editor Body: Gutter + Code Textarea */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Line Numbers & Breakpoint Gutter */}
        <div 
          ref={lineNumbersRef}
          className="w-12 shrink-0 bg-[#0d1117] border-r border-slate-800/80 py-3 text-right pr-2 text-slate-600 font-mono text-[13px] leading-[1.6] select-none overflow-hidden"
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const hasBreakpoint = breakpoints.has(lineNum);
            return (
              <div 
                key={lineNum} 
                onClick={() => toggleBreakpoint(lineNum)}
                className="group flex items-center justify-end gap-1.5 h-[21.6px] cursor-pointer hover:text-slate-400"
              >
                {hasBreakpoint ? (
                  <span className="h-2 w-2 rounded-full bg-rose-500 shadow-sm" title={`Breakpoint line ${lineNum}`} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500/0 group-hover:bg-rose-500/40 transition" />
                )}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Text Area Code Editor */}
        <div className="relative flex-1 h-full">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full bg-transparent text-slate-200 font-mono text-[13.5px] leading-[1.6] p-3 outline-none resize-none code-editor-font selection:bg-sky-900/60 selection:text-white"
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#161b22] border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>{lines.length} lines</span>
          <span>{code.length} characters</span>
          {breakpoints.size > 0 && (
            <span className="text-rose-400">{breakpoints.size} breakpoint(s)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
};
