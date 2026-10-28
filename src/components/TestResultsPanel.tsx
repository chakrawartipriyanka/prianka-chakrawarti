import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  FileText, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Eye,
  EyeOff,
  Send,
  Zap,
  Sparkles
} from 'lucide-react';
import { Assignment, ExecutionRunResult, TestResult } from '../types/assignment';

interface TestResultsPanelProps {
  assignment: Assignment;
  runResult: ExecutionRunResult | null;
  isRunning: boolean;
  onRunTests: () => void;
  onSubmitAssignment: () => void;
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({
  assignment,
  runResult,
  isRunning,
  onRunTests,
  onSubmitAssignment
}) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'specs'>('tests');
  const [expandedTestIds, setExpandedTestIds] = useState<Set<string>>(new Set());

  const toggleTestExpand = (id: string) => {
    const next = new Set(expandedTestIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedTestIds(next);
  };

  // Collect all console logs across tests
  const allLogs = runResult?.results.flatMap((r, idx) => 
    r.logs.map(log => ({ ...log, testName: r.name, testIdx: idx + 1 }))
  ) || [];

  const formatValue = (val: any) => {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 select-none">
      {/* Tab Navigation */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {runResult ? (
              runResult.allPassed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
              )
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>Test Results</span>
            {runResult && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                runResult.allPassed 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {runResult.passedCount}/{runResult.totalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'console'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-slate-400" />
            <span>Console</span>
            {allLogs.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {allLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>Problem Details</span>
          </button>
        </div>

        {/* Quick Run & Submit Actions */}
        <div className="flex items-center gap-2">
          {runResult?.allPassed && (
            <button
              onClick={onSubmitAssignment}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] shadow-sm transition cursor-pointer animate-pulse"
            >
              <Send className="h-3 w-3" />
              <span>Submit Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: TESTS */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            {!runResult && !isRunning && (
              <div className="py-12 text-center space-y-3">
                <div className="h-10 w-10 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-slate-300">No test runs executed yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Inspect the buggy code on the left, fix the underlying logic, and click Run Tests to verify your solution against the test suite.
                  </p>
                </div>
                <button
                  onClick={onRunTests}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer transition shadow-sm"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Execute Test Suite</span>
                </button>
              </div>
            )}

            {isRunning && (
              <div className="py-12 text-center space-y-3">
                <div className="h-8 w-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Executing test cases and sandboxed harness...</p>
              </div>
            )}

            {runResult && (
              <>
                {/* Overall Run Banner */}
                {runResult.compilationError ? (
                  <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-rose-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Compilation / Syntax Error</span>
                    </div>
                    <pre className="font-mono text-[12px] bg-black/40 p-2.5 rounded border border-rose-900/60 overflow-x-auto text-rose-300">
                      {runResult.compilationError}
                    </pre>
                  </div>
                ) : runResult.allPassed ? (
                  <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-emerald-900/80 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-emerald-300 text-sm">All Test Cases Passed!</h4>
                        <p className="text-[11px] text-emerald-400/80">
                          {runResult.passedCount} of {runResult.totalCount} tests passed in {runResult.overallTimeMs}ms. Ready for grading submission!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onSubmitAssignment}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition cursor-pointer"
                    >
                      Submit for Grade
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-amber-900/80 flex items-center justify-center text-amber-400">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-300">
                          {runResult.passedCount} / {runResult.totalCount} Tests Passing
                        </h4>
                        <p className="text-[11px] text-amber-400/80">
                          {runResult.totalCount - runResult.passedCount} test cases failed. Inspect the failing inputs below or use Hints.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Test Cases Accordion */}
                <div className="space-y-2">
                  {runResult.results.map((test, index) => {
                    const isExpanded = expandedTestIds.has(test.testCaseId) || !test.passed;

                    return (
                      <div 
                        key={test.testCaseId}
                        className={`rounded-lg border transition ${
                          test.passed
                            ? 'bg-slate-900/60 border-slate-800/80'
                            : 'bg-rose-950/20 border-rose-900/60'
                        }`}
                      >
                        {/* Test Header */}
                        <div 
                          onClick={() => toggleTestExpand(test.testCaseId)}
                          className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-lg transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {test.passed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                            )}
                            <span className="text-xs font-medium text-slate-200 truncate">
                              Test {index + 1}: {test.name}
                            </span>
                            {test.isHidden && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                                Hidden Edge Case
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-xs">
                            <span className="text-[11px] font-mono text-slate-500">
                              {test.executionTimeMs}ms
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Test Expanded Details */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 space-y-2.5 text-xs">
                            {test.errorMessage && (
                              <div className="p-2 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 font-mono text-[11px]">
                                <span className="font-bold">Error:</span> {test.errorMessage}
                              </div>
                            )}

                            {/* Inputs */}
                            <div>
                              <div className="text-[11px] font-mono text-slate-400 mb-1">Input Arguments:</div>
                              <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-32">
                                {formatValue(test.input)}
                              </pre>
                            </div>

                            {/* Expected vs Actual */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <div className="text-[11px] font-mono text-emerald-400 mb-1">Expected Output:</div>
                                <pre className="p-2 bg-slate-950 rounded border border-emerald-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-36">
                                  {formatValue(test.expectedOutput)}
                                </pre>
                              </div>
                              <div>
                                <div className={`text-[11px] font-mono mb-1 ${test.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  Actual Output:
                                </div>
                                <pre className={`p-2 bg-slate-950 rounded border font-mono text-[11px] overflow-x-auto max-h-36 ${
                                  test.passed 
                                    ? 'border-emerald-950 text-emerald-300' 
                                    : 'border-rose-950 text-rose-300'
                                }`}>
                                  {formatValue(test.actualOutput)}
                                </pre>
                              </div>
                            </div>

                            {/* Captured console logs for this test */}
                            {test.logs.length > 0 && (
                              <div>
                                <div className="text-[11px] font-mono text-slate-400 mb-1">Captured Logs:</div>
                                <div className="p-2 bg-black/60 rounded border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 max-h-28 overflow-y-auto">
                                  {test.logs.map((l, i) => (
                                    <div key={i} className="flex items-start gap-1.5">
                                      <span className="text-slate-600">[{l.type}]</span>
                                      <span className={l.type === 'error' ? 'text-rose-400' : l.type === 'warn' ? 'text-amber-400' : 'text-slate-200'}>
                                        {l.message}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: CONSOLE LOGS */}
        {activeTab === 'console' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
              <span>Standard Output Stream ({allLogs.length} events)</span>
            </div>

            {allLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-sans text-xs">
                No logs recorded. Use <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300 font-mono">console.log()</code> in your code to inspect variable states during execution.
              </div>
            ) : (
              <div className="space-y-1.5">
                {allLogs.map((log, index) => (
                  <div key={index} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                    <span className="text-[10px] text-slate-500 shrink-0">#{log.testIdx}</span>
                    <span className={`text-[10px] uppercase font-bold shrink-0 ${
                      log.type === 'error' ? 'text-rose-400' : log.type === 'warn' ? 'text-amber-400' : 'text-sky-400'
                    }`}>
                      {log.type}
                    </span>
                    <pre className="text-slate-200 whitespace-pre-wrap break-all text-[11.5px] flex-1">
                      {log.message}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SPECS & SCENARIO */}
        {activeTab === 'specs' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{assignment.title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Category: {assignment.category}</span>
                <span>•</span>
                <span>Target Function: <code className="font-mono text-amber-300">{assignment.functionName}()</code></span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Scenario Context
              </h4>
              <p className="text-slate-300 leading-relaxed text-xs">
                {assignment.scenario}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
              <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider font-mono">
                Reported Bug Symptoms
              </h4>
              <p className="text-rose-200/90 leading-relaxed text-xs">
                {assignment.bugDescription}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Assignment Requirements
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Debug and correct all edge cases in <code className="font-mono text-slate-200">{assignment.functionName}</code></li>
                <li>Pass all {assignment.testCases.length} public and hidden edge case assertions</li>
                <li>Avoid mutating input references unless explicitly documented</li>
                <li>Ensure execution terminates within safe complexity bounds</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
