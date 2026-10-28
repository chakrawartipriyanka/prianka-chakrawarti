import React, { useState } from 'react';
import { X, GitCompare, Check, ArrowRight } from 'lucide-react';
import { computeLineDiff } from '../utils/diff';
import { Assignment } from '../types/assignment';

interface DiffViewerModalProps {
  assignment: Assignment;
  currentCode: string;
  onClose: () => void;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  assignment,
  currentCode,
  onClose
}) => {
  const [diffMode, setDiffMode] = useState<'buggy-vs-current' | 'current-vs-solution'>('buggy-vs-current');

  const originalText = diffMode === 'buggy-vs-current' ? assignment.buggyCode : currentCode;
  const modifiedText = diffMode === 'buggy-vs-current' ? currentCode : assignment.solutionCode;

  const diffLines = computeLineDiff(originalText, modifiedText);

  const additions = diffLines.filter(l => l.type === 'added').length;
  const deletions = diffLines.filter(l => l.type === 'removed').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GitCompare className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-100 text-sm">Code Diff Inspector</span>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-emerald-400">+{additions}</span>
              <span className="text-rose-400">-{deletions}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Diff Mode Toggle Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDiffMode('buggy-vs-current')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                diffMode === 'buggy-vs-current'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Initial Buggy Code ➔ Your Changes
            </button>
            <button
              onClick={() => setDiffMode('current-vs-solution')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
                diffMode === 'current-vs-solution'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Your Code ➔ Reference Solution
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-emerald-500/40 border border-emerald-500 rounded-sm"></span> Added</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 bg-rose-500/40 border border-rose-500 rounded-sm"></span> Removed</span>
          </div>
        </div>

        {/* Diff Content */}
        <div className="flex-1 bg-[#0d1117] overflow-y-auto p-3 font-mono text-xs leading-[1.6]">
          {diffLines.map((line, idx) => {
            const isAdded = line.type === 'added';
            const isRemoved = line.type === 'removed';

            return (
              <div
                key={idx}
                className={`flex items-start px-2 py-0.5 rounded transition ${
                  isAdded
                    ? 'bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500'
                    : isRemoved
                    ? 'bg-rose-950/50 text-rose-300 border-l-2 border-rose-500 line-through opacity-80'
                    : 'text-slate-400 hover:bg-slate-800/30'
                }`}
              >
                <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-2">
                  {line.originalLineNumber || ''}
                </span>
                <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-2">
                  {line.newLineNumber || ''}
                </span>
                <span className="w-5 shrink-0 text-center select-none font-bold">
                  {isAdded ? '+' : isRemoved ? '-' : ' '}
                </span>
                <pre className="font-mono text-[12px] whitespace-pre overflow-x-auto flex-1">
                  {line.content}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
