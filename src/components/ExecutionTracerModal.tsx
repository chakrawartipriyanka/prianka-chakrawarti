import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Bug, 
  Layers, 
  Cpu, 
  AlertCircle 
} from 'lucide-react';
import { Assignment, TraceStep } from '../types/assignment';

interface ExecutionTracerModalProps {
  assignment: Assignment;
  onClose: () => void;
}

export const ExecutionTracerModal: React.FC<ExecutionTracerModalProps> = ({
  assignment,
  onClose
}) => {
  const traces = assignment.sampleTraces;
  const traceKeys = traces ? Object.keys(traces) : [];
  const [selectedTraceKey, setSelectedTraceKey] = useState<string>(traceKeys[0] || '');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: TraceStep[] = (traces && traces[selectedTraceKey]) || [];
  const currentStep = steps[currentStepIdx] || steps[0];

  const codeLines = assignment.buggyCode.split('\n');

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  React.useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Cpu className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-100 text-sm">Interactive Execution Trace Visualizer</span>
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

        {/* Trace Controls Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4 text-xs">
          {/* Test Case Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Trace Input:</span>
            <span className="text-slate-200 font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700/60 text-[11px]">
              arr: [10, 20, 30, 40, 50], target: 50
            </span>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Reset trace to step 1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
              title="Step Backward"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Auto Step'}</span>
            </button>
            <button
              onClick={handleNext}
              disabled={currentStepIdx >= steps.length - 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
              title="Step Forward"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>

            <span className="text-slate-400 font-mono text-[11px] ml-2">
              Step {currentStepIdx + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-800 overflow-hidden">
          {/* Left: Code with Active Line Highlighter */}
          <div className="flex flex-col h-full bg-[#0d1117] overflow-y-auto">
            <div className="p-2 border-b border-slate-800 text-[11px] font-mono text-slate-400 bg-slate-900/50">
              Buggy Code Execution View
            </div>
            <div className="p-3 font-mono text-xs space-y-1">
              {codeLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isActive = currentStep?.line === lineNum;
                const isBugLine = currentStep?.isBugTrigger && isActive;

                return (
                  <div
                    key={lineNum}
                    className={`flex items-start px-2 py-0.5 rounded transition ${
                      isBugLine 
                        ? 'bg-rose-950/80 border-l-4 border-rose-500 text-rose-200' 
                        : isActive 
                        ? 'bg-sky-950/80 border-l-4 border-sky-400 text-sky-100 font-medium' 
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-2">
                      {lineNum}
                    </span>
                    <pre className="font-mono text-[12px] whitespace-pre overflow-x-auto flex-1">
                      {line}
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Variable State Inspector & Step Notes */}
          <div className="flex flex-col h-full bg-slate-900 overflow-y-auto p-4 space-y-4">
            {/* Step Explanation Card */}
            <div className={`p-3.5 rounded-lg border ${
              currentStep?.isBugTrigger 
                ? 'bg-rose-950/40 border-rose-800 text-rose-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                {currentStep?.isBugTrigger ? (
                  <>
                    <Bug className="h-4 w-4 text-rose-400" />
                    <span className="text-rose-400">Bug Trigger Point Detected!</span>
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4 text-sky-400" />
                    <span>Step Explanation</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {currentStep?.note || 'Executing instruction at line ' + currentStep?.line}
              </p>
            </div>

            {/* Variables Watch Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                  Local Variables Watch Table
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Scope: Local</span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Variable</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Current Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {currentStep?.variables && Object.entries(currentStep.variables).map(([name, val]) => (
                      <tr key={name} className="hover:bg-slate-900/40">
                        <td className="px-3 py-2 font-semibold text-amber-400">{name}</td>
                        <td className="px-3 py-2 text-slate-500 text-[11px]">{typeof val}</td>
                        <td className="px-3 py-2 text-sky-300">{JSON.stringify(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Educational Diagnostic Note */}
            <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-900/40 text-xs text-sky-300 space-y-1">
              <span className="font-semibold text-[11px] uppercase tracking-wider font-mono">Debugger Takeaway</span>
              <p className="text-[11.5px] leading-relaxed text-sky-200/80">
                Notice how variables change with each iteration. When you see a variable fail to progress towards the termination condition (or jump beyond bounds), that marks the exact spot to patch!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
