/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  getAllAssignments, 
  loadAllProgress, 
  getAssignmentProgress, 
  saveAssignmentProgress, 
  saveCustomAssignment,
  calculateCurrentScore 
} from './utils/storage';
import { Assignment, StudentProgress, ExecutionRunResult } from './types/assignment';
import { runTestAssignment } from './utils/runner';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { TestResultsPanel } from './components/TestResultsPanel';
import { HintModal } from './components/HintModal';
import { DiffViewerModal } from './components/DiffViewerModal';
import { ExecutionTracerModal } from './components/ExecutionTracerModal';
import { SpotTheBugQuizModal } from './components/SpotTheBugQuizModal';
import { AssignmentBuilderModal } from './components/AssignmentBuilderModal';
import { SubmissionReportModal } from './components/SubmissionReportModal';
import confetti from 'canvas-confetti';

export default function App() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => getAllAssignments());
  const [activeAssignment, setActiveAssignment] = useState<Assignment>(() => assignments[0]);
  const [progressMap, setProgressMap] = useState<Record<string, StudentProgress>>(() => loadAllProgress());
  
  // Active assignment state
  const currentProgress = getAssignmentProgress(activeAssignment);
  const [code, setCode] = useState<string>(currentProgress.currentCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<ExecutionRunResult | null>(null);

  // Modals state
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);
  const [showTracerModal, setShowTracerModal] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [showBuilderModal, setShowBuilderModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Assignment Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(currentProgress.timeSpentSeconds || 0);

  // When active assignment switches, load its saved progress and code
  useEffect(() => {
    const prog = getAssignmentProgress(activeAssignment);
    setCode(prog.currentCode);
    setTimerSeconds(prog.timeSpentSeconds || 0);
    setRunResult(null);
  }, [activeAssignment.id]);

  // Active Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        const next = prev + 1;
        // Save time update periodically every 10 seconds
        if (next % 10 === 0) {
          const prog = getAssignmentProgress(activeAssignment);
          prog.timeSpentSeconds = next;
          prog.currentCode = code;
          saveAssignmentProgress(prog);
          setProgressMap(loadAllProgress());
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAssignment.id, code]);

  // Code change handler
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const prog = getAssignmentProgress(activeAssignment);
    prog.currentCode = newCode;
    saveAssignmentProgress(prog);
    setProgressMap(loadAllProgress());
  };

  // Reset code back to initial buggy code
  const handleResetCode = () => {
    if (window.confirm('Reset this assignment back to the initial buggy code?')) {
      setCode(activeAssignment.buggyCode);
      const prog = getAssignmentProgress(activeAssignment);
      prog.currentCode = activeAssignment.buggyCode;
      saveAssignmentProgress(prog);
      setProgressMap(loadAllProgress());
      setRunResult(null);
    }
  };

  // Run test execution
  const handleRunTests = async () => {
    if (isRunning) return;
    setIsRunning(true);

    try {
      const result = await runTestAssignment(
        code, 
        activeAssignment.functionName, 
        activeAssignment.id, 
        activeAssignment.testCases
      );
      setRunResult(result);

      // Update progress
      const prog = getAssignmentProgress(activeAssignment);
      prog.attempts += 1;
      prog.timeSpentSeconds = timerSeconds;
      prog.currentCode = code;

      if (result.allPassed) {
        prog.solved = true;
        prog.score = calculateCurrentScore(prog, activeAssignment.points);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
      }

      saveAssignmentProgress(prog);
      setProgressMap(loadAllProgress());
    } catch (err) {
      console.error('Test execution failed', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Hint unlock handler
  const handleUnlockHint = (tier: 'tier1' | 'tier2' | 'tier3') => {
    const prog = getAssignmentProgress(activeAssignment);
    prog.hintsRevealed[tier] = true;
    prog.score = calculateCurrentScore(prog, activeAssignment.points);
    saveAssignmentProgress(prog);
    setProgressMap(loadAllProgress());
  };

  // Save new custom challenge
  const handleSaveCustomAssignment = (newAssignment: Assignment) => {
    const updatedList = saveCustomAssignment(newAssignment);
    setAssignments([...getAllAssignments()]);
    setActiveAssignment(newAssignment);
  };

  // Add score from spot the bug quiz
  const handleAddQuizScore = (points: number) => {
    // Save quiz points into current progress
    const prog = getAssignmentProgress(activeAssignment);
    prog.score += points;
    saveAssignmentProgress(prog);
    setProgressMap(loadAllProgress());
  };

  // Next assignment index
  const currentIndex = assignments.findIndex(a => a.id === activeAssignment.id);
  const hasNext = currentIndex < assignments.length - 1;

  const handleNextAssignment = () => {
    if (hasNext) {
      setActiveAssignment(assignments[currentIndex + 1]);
      setShowReportModal(false);
    }
  };

  // Overall stats
  const solvedCount = Object.values(progressMap).filter(p => p.solved).length;
  const totalPoints = Object.values(progressMap).reduce((acc, p) => p.solved ? acc + (p.score || 0) : acc, 0);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Top Application Header */}
      <Header
        currentAssignment={activeAssignment}
        allAssignments={assignments}
        progress={currentProgress}
        solvedCount={solvedCount}
        totalPoints={totalPoints}
        timerSeconds={timerSeconds}
        onOpenQuiz={() => setShowQuizModal(true)}
        onOpenBuilder={() => setShowBuilderModal(true)}
        onOpenHints={() => setShowHintModal(true)}
        onResetCode={handleResetCode}
      />

      {/* Main Workspace: Sidebar + Split Editor & Results */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Assignment Bank */}
        <Sidebar
          assignments={assignments}
          activeAssignmentId={activeAssignment.id}
          onSelectAssignment={(a) => setActiveAssignment(a)}
          progressMap={progressMap}
        />

        {/* Center & Right: Code Editor & Test Harness */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Code Editor Pane (55% on desktop) */}
          <section className="flex-1 md:w-[55%] h-1/2 md:h-full overflow-hidden">
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              onRunTests={handleRunTests}
              isRunning={isRunning}
              onOpenDiff={() => setShowDiffModal(true)}
              onOpenTracer={() => setShowTracerModal(true)}
              onResetCode={handleResetCode}
              hasTraceSupport={!!activeAssignment.sampleTraces}
            />
          </section>

          {/* Test Runner & Diagnostic Panel (45% on desktop) */}
          <section className="flex-1 md:w-[45%] h-1/2 md:h-full overflow-hidden border-t md:border-t-0 md:border-l border-slate-800">
            <TestResultsPanel
              assignment={activeAssignment}
              runResult={runResult}
              isRunning={isRunning}
              onRunTests={handleRunTests}
              onSubmitAssignment={() => setShowReportModal(true)}
            />
          </section>
        </main>
      </div>

      {/* Modals */}
      {showHintModal && (
        <HintModal
          assignment={activeAssignment}
          progress={currentProgress}
          onUnlockHint={handleUnlockHint}
          onClose={() => setShowHintModal(false)}
        />
      )}

      {showDiffModal && (
        <DiffViewerModal
          assignment={activeAssignment}
          currentCode={code}
          onClose={() => setShowDiffModal(false)}
        />
      )}

      {showTracerModal && (
        <ExecutionTracerModal
          assignment={activeAssignment}
          onClose={() => setShowTracerModal(false)}
        />
      )}

      {showQuizModal && (
        <SpotTheBugQuizModal
          onClose={() => setShowQuizModal(false)}
          onAddScore={handleAddQuizScore}
        />
      )}

      {showBuilderModal && (
        <AssignmentBuilderModal
          onSaveAssignment={handleSaveCustomAssignment}
          onClose={() => setShowBuilderModal(false)}
        />
      )}

      {showReportModal && (
        <SubmissionReportModal
          assignment={activeAssignment}
          progress={currentProgress}
          runResult={runResult}
          onClose={() => setShowReportModal(false)}
          onNextAssignment={handleNextAssignment}
          hasNextAssignment={hasNext}
        />
      )}
    </div>
  );
}
