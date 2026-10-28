import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Award, 
  ArrowRight, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SPOT_THE_BUG_QUESTIONS } from '../data/assignments';
import confetti from 'canvas-confetti';

interface SpotTheBugQuizModalProps {
  onClose: () => void;
  onAddScore: (points: number) => void;
}

export const SpotTheBugQuizModal: React.FC<SpotTheBugQuizModalProps> = ({
  onClose,
  onAddScore
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const question = SPOT_THE_BUG_QUESTIONS[currentIndex];

  const handleSelectLine = (index: number) => {
    if (isAnswered) return;
    setSelectedLine(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctLineIndex;
    if (isCorrect) {
      const bonus = 50 + streak * 10;
      setScore(prev => prev + bonus);
      setStreak(prev => prev + 1);
      onAddScore(bonus);
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < SPOT_THE_BUG_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedLine(null);
      setIsAnswered(false);
    } else {
      // Completed all questions
      setIsAnswered(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedLine(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
  };

  const isCompleted = isAnswered && currentIndex === SPOT_THE_BUG_QUESTIONS.length - 1 && selectedLine !== null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-100 text-sm">Spot The Bug: Rapid Fire</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Question {currentIndex + 1} of {SPOT_THE_BUG_QUESTIONS.length}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>Streak: {streak}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>{score} pts</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Question Prompt */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-sky-400">
              <span>{question.category}</span>
              <span>Click on the defective line</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              {question.questionText}
            </h3>
          </div>

          {/* Interactive Code Snippet */}
          <div className="rounded-lg border border-slate-800 bg-[#0d1117] overflow-hidden">
            <div className="px-3 py-1.5 bg-[#161b22] border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>snippet.js</span>
              <span className="text-[10px] text-slate-500">Click a line to submit answer</span>
            </div>

            <div className="p-2 font-mono text-xs space-y-0.5">
              {question.snippet.map((line, idx) => {
                const lineNum = idx + 1;
                const isSelected = selectedLine === idx;
                const isCorrect = idx === question.correctLineIndex;

                let rowStyle = 'hover:bg-slate-800/60 cursor-pointer text-slate-300';
                if (isAnswered) {
                  if (isCorrect) {
                    rowStyle = 'bg-emerald-950/70 border-l-4 border-emerald-500 text-emerald-200 font-medium';
                  } else if (isSelected && !isCorrect) {
                    rowStyle = 'bg-rose-950/70 border-l-4 border-rose-500 text-rose-200 line-through';
                  } else {
                    rowStyle = 'opacity-50 text-slate-500';
                  }
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectLine(idx)}
                    className={`flex items-start px-2 py-1 rounded transition select-none ${rowStyle}`}
                  >
                    <span className="w-8 shrink-0 text-slate-600 text-right pr-2 select-none">
                      {lineNum}
                    </span>
                    <pre className="font-mono text-[12px] whitespace-pre overflow-x-auto flex-1">
                      {line}
                    </pre>
                    {isAnswered && isCorrect && (
                      <span className="text-emerald-400 text-[10px] font-mono pl-2">Bug Here</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Answer Feedback Card */}
          {isAnswered && (
            <div className={`p-3.5 rounded-lg border ${
              selectedLine === question.correctLineIndex
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
                : 'bg-rose-950/50 border-rose-800/80 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                {selectedLine === question.correctLineIndex ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Correct Spotting! (+{50 + (streak - 1) * 10} pts)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-rose-400" />
                    <span className="text-rose-400">Incorrect Line. Line {question.correctLineIndex + 1} contains the bug.</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="h-12 bg-slate-950 px-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restart Quiz</span>
          </button>

          {isAnswered && (
            currentIndex < SPOT_THE_BUG_QUESTIONS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer"
              >
                Complete Quiz
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
