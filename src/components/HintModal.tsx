import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  Code
} from 'lucide-react';
import { Assignment, StudentProgress } from '../types/assignment';

interface HintModalProps {
  assignment: Assignment;
  progress: StudentProgress;
  onUnlockHint: (tier: 'tier1' | 'tier2' | 'tier3') => void;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  assignment,
  progress,
  onUnlockHint,
  onClose
}) => {
  const [confirmTier, setConfirmTier] = useState<'tier1' | 'tier2' | 'tier3' | null>(null);
  const [showSolutionCode, setShowSolutionCode] = useState(progress.solved);

  const penalties = {
    tier1: 10,
    tier2: 20,
    tier3: 40
  };

  const handleConfirmUnlock = (tier: 'tier1' | 'tier2' | 'tier3') => {
    onUnlockHint(tier);
    setConfirmTier(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-100 text-sm">Graduated Hints & Bug Diagnostics</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{assignment.title}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Penalty Confirmation Warning Box */}
          {confirmTier && (
            <div className="p-3.5 rounded-lg bg-amber-950/60 border border-amber-700/80 text-amber-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-300">
                    Unlock Hint {confirmTier.replace('tier', '')}?
                  </h4>
                  <p className="text-[11px] text-amber-300/80">
                    Unlocking this hint will deduct {penalties[confirmTier]} points from your assignment score. Are you sure you want to proceed?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setConfirmTier(null)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer text-[11px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmUnlock(confirmTier)}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition cursor-pointer text-[11px]"
                >
                  Yes, Reveal Hint (-{penalties[confirmTier]} pts)
                </button>
              </div>
            </div>
          )}

          {/* HINT 1 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 font-mono text-[11px] uppercase tracking-wider">
                  Hint 1: Symptom & Observation
                </span>
                <span className="text-[10px] text-amber-400 font-mono">(-10 pts)</span>
              </div>

              {progress.hintsRevealed.tier1 ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Unlock className="h-3 w-3" /> Unlocked
                </span>
              ) : (
                <button
                  onClick={() => setConfirmTier('tier1')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
                >
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>Reveal Hint 1</span>
                </button>
              )}
            </div>

            {progress.hintsRevealed.tier1 ? (
              <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/60 text-xs">
                {assignment.hints.tier1}
              </p>
            ) : (
              <p className="text-slate-500 italic text-[11px]">
                Focuses on the exact symptoms and test inputs that trigger unexpected behavior.
              </p>
            )}
          </div>

          {/* HINT 2 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 font-mono text-[11px] uppercase tracking-wider">
                  Hint 2: Root Cause Clue
                </span>
                <span className="text-[10px] text-amber-400 font-mono">(-20 pts)</span>
              </div>

              {progress.hintsRevealed.tier2 ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Unlock className="h-3 w-3" /> Unlocked
                </span>
              ) : (
                <button
                  onClick={() => setConfirmTier('tier2')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
                >
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>Reveal Hint 2</span>
                </button>
              )}
            </div>

            {progress.hintsRevealed.tier2 ? (
              <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/60 text-xs">
                {assignment.hints.tier2}
              </p>
            ) : (
              <p className="text-slate-500 italic text-[11px]">
                Explains the underlying logic error and what mental model mistake caused it.
              </p>
            )}
          </div>

          {/* HINT 3 */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 font-mono text-[11px] uppercase tracking-wider">
                  Hint 3: Code Fix Strategy & Syntax
                </span>
                <span className="text-[10px] text-amber-400 font-mono">(-40 pts)</span>
              </div>

              {progress.hintsRevealed.tier3 ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Unlock className="h-3 w-3" /> Unlocked
                </span>
              ) : (
                <button
                  onClick={() => setConfirmTier('tier3')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
                >
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>Reveal Hint 3</span>
                </button>
              )}
            </div>

            {progress.hintsRevealed.tier3 ? (
              <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/60 text-xs">
                {assignment.hints.tier3}
              </p>
            ) : (
              <p className="text-slate-500 italic text-[11px]">
                Direct suggestions on which statements to replace and exact fix pattern.
              </p>
            )}
          </div>

          {/* ROOT CAUSE DEEP DIVE & REFERENCE SOLUTION */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sky-400" />
                <h4 className="font-semibold text-slate-200">
                  Senior Engineer Retrospective: Why This Bug Matters
                </h4>
              </div>

              {progress.solved ? (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  Unlocked via Passing Tests
                </span>
              ) : (
                <button
                  onClick={() => setShowSolutionCode(!showSolutionCode)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  {showSolutionCode ? 'Hide Solution' : 'Peek Solution (Give Up)'}
                </button>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              {assignment.rootCauseAnalysis}
            </p>

            <div className="p-3 rounded bg-sky-950/20 border border-sky-900/40 text-xs text-sky-300 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                  Production Best Practice
                </span>
                <p className="text-sky-200/90 text-xs">
                  {assignment.bestPracticeAdvice}
                </p>
              </div>
            </div>

            {/* Solution Code View */}
            {(showSolutionCode || progress.solved) && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Verified Solution Implementation</span>
                </div>
                <pre className="p-3 bg-black/60 rounded border border-slate-800 text-emerald-300 font-mono text-[12px] leading-relaxed overflow-x-auto">
                  {assignment.solutionCode}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
