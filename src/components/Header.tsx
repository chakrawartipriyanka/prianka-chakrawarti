import React from 'react';
import { 
  Bug, 
  CheckCircle2, 
  Award, 
  Clock, 
  HelpCircle, 
  PlusCircle, 
  Zap, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Assignment, StudentProgress } from '../types/assignment';

interface HeaderProps {
  currentAssignment: Assignment;
  allAssignments: Assignment[];
  progress: StudentProgress;
  solvedCount: number;
  totalPoints: number;
  timerSeconds: number;
  onOpenQuiz: () => void;
  onOpenBuilder: () => void;
  onOpenHints: () => void;
  onResetCode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAssignment,
  allAssignments,
  progress,
  solvedCount,
  totalPoints,
  timerSeconds,
  onOpenQuiz,
  onOpenBuilder,
  onOpenHints,
  onResetCode
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const difficultyColors = {
    Easy: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    Medium: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    Hard: 'text-rose-400 bg-rose-950/60 border-rose-800/60'
  };

  return (
    <header className="h-14 bg-slate-950/90 backdrop-blur border-b border-slate-800/80 px-4 flex items-center justify-between z-20 sticky top-0 select-none">
      {/* Brand & Active Challenge Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bug className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-slate-100">BugForge</span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                Debug Lab
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block h-4 w-px bg-slate-800 mx-1" />

        {/* Current Assignment Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <span className="text-slate-400">Assignment:</span>
          <span className="font-medium text-slate-200 max-w-[280px] truncate" title={currentAssignment.title}>
            {currentAssignment.title}
          </span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${difficultyColors[currentAssignment.difficulty]}`}>
            {currentAssignment.difficulty}
          </span>
          {progress.solved && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3 w-3" />
              Passed
            </span>
          )}
        </div>
      </div>

      {/* Middle: Live Timer & Score Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatTime(timerSeconds)}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
          <Award className="h-3.5 w-3.5 text-amber-400" />
          <span>{totalPoints} pts</span>
          <span className="text-slate-500">({solvedCount}/{allAssignments.length} solved)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHints}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-900/40 hover:border-amber-700/60 transition cursor-pointer"
          title="Open Graduated Hints & Solution"
        >
          <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Hints</span>
          {Object.values(progress.hintsRevealed).filter(Boolean).length > 0 && (
            <span className="h-4 w-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-mono">
              {Object.values(progress.hintsRevealed).filter(Boolean).length}
            </span>
          )}
        </button>

        <button
          onClick={onOpenQuiz}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-900/40 hover:border-sky-700/60 transition cursor-pointer"
          title="Spot The Bug Speed Quiz"
        >
          <Zap className="h-3.5 w-3.5 text-sky-400" />
          <span className="hidden md:inline">Spot The Bug</span>
        </button>

        <button
          onClick={onOpenBuilder}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
          title="Create or import an assignment"
        >
          <PlusCircle className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">New Challenge</span>
        </button>

        <button
          onClick={onResetCode}
          className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
          title="Reset to initial buggy code"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
