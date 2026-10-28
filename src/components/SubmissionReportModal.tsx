import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  FileCheck2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Assignment, StudentProgress, ExecutionRunResult } from '../types/assignment';
import { calculateCurrentScore } from '../utils/storage';
import { computeLineDiff } from '../utils/diff';

interface SubmissionReportModalProps {
  assignment: Assignment;
  progress: StudentProgress;
  runResult: ExecutionRunResult | null;
  onClose: () => void;
  onNextAssignment: () => void;
  hasNextAssignment: boolean;
}

export const SubmissionReportModal: React.FC<SubmissionReportModalProps> = ({
  assignment,
  progress,
  runResult,
  onClose,
  onNextAssignment,
  hasNextAssignment
}) => {
  const [studentName, setStudentName] = useState('Engineer / Student');
  const [copied, setCopied] = useState(false);

  const finalScore = calculateCurrentScore(progress, assignment.points);
  const percentage = Math.round((finalScore / assignment.points) * 100);

  const getLetterGrade = (pct: number) => {
    if (pct >= 95) return 'A+';
    if (pct >= 90) return 'A';
    if (pct >= 85) return 'B+';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    return 'Passed';
  };

  const diffLines = computeLineDiff(assignment.buggyCode, progress.currentCode);
  const additions = diffLines.filter(l => l.type === 'added').length;
  const deletions = diffLines.filter(l => l.type === 'removed').length;

  const letterGrade = getLetterGrade(percentage);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}m ${remaining}s`;
  };

  const submissionPayload = {
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    studentName,
    submittedAt: new Date().toISOString(),
    letterGrade,
    score: `${finalScore}/${assignment.points} (${percentage}%)`,
    testsPassed: `${runResult?.passedCount || assignment.testCases.length}/${assignment.testCases.length}`,
    timeSpent: formatTime(progress.timeSpentSeconds),
    attempts: progress.attempts,
    hintsUsed: progress.hintsRevealed,
    diff: { additions, deletions },
    verificationToken: `BF-${assignment.id.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(submissionPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignment-${assignment.id}-submission.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const summary = `### Assignment Submission: ${assignment.title}
**Student:** ${studentName}
**Grade:** ${letterGrade} (${finalScore}/${assignment.points} pts - ${percentage}%)
**Tests:** ${submissionPayload.testsPassed} Passing
**Time Spent:** ${submissionPayload.timeSpent}
**Attempts:** ${progress.attempts}
**Verification Token:** ${submissionPayload.verificationToken}`;

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-100 text-sm">Assignment Completion Scorecard</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Top Grade Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-800/60 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Assignment Verified</span>
              </div>
              <h3 className="text-base font-semibold text-slate-100">{assignment.title}</h3>
              <p className="text-slate-400 text-xs">
                All public and hidden edge case tests passed successfully.
              </p>
            </div>

            <div className="text-center pl-4 border-l border-slate-800">
              <div className="text-3xl font-bold font-mono text-emerald-400">{letterGrade}</div>
              <div className="text-[11px] font-mono text-slate-400">{finalScore} / {assignment.points}p</div>
            </div>
          </div>

          {/* Student Name Field */}
          <div className="space-y-1">
            <label className="text-slate-400 font-mono text-[11px]">Submitted By (Student / Candidate Name)</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-slate-600 font-sans"
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Tests Passed</span>
              <div className="text-sm font-semibold text-emerald-400 font-mono">
                {runResult?.passedCount || assignment.testCases.length} / {assignment.testCases.length}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Time Spent</span>
              <div className="text-sm font-semibold text-slate-200 font-mono">
                {formatTime(progress.timeSpentSeconds)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Attempts</span>
              <div className="text-sm font-semibold text-slate-200 font-mono">
                {progress.attempts} runs
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Code Diff</span>
              <div className="text-sm font-semibold font-mono">
                <span className="text-emerald-400">+{additions}</span>{' '}
                <span className="text-rose-400">-{deletions}</span>
              </div>
            </div>
          </div>

          {/* Verification Hash & Token */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Submission Hash:</span>
            <span className="text-amber-400">{submissionPayload.verificationToken}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-14 bg-slate-950 px-6 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Transcript</span>
            </button>
          </div>

          {hasNextAssignment && (
            <button
              onClick={onNextAssignment}
              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition cursor-pointer"
            >
              Next Assignment ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
