import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Upload, 
  Save,
  Code2
} from 'lucide-react';
import { Assignment, Category, Difficulty, TestCase } from '../types/assignment';
import { runTestAssignment } from '../utils/runner';

interface AssignmentBuilderModalProps {
  onSaveAssignment: (assignment: Assignment) => void;
  onClose: () => void;
}

export const AssignmentBuilderModal: React.FC<AssignmentBuilderModalProps> = ({
  onSaveAssignment,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Algorithms');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [functionName, setFunctionName] = useState('solve');
  const [scenario, setScenario] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [buggyCode, setBuggyCode] = useState(`function solve(arr) {\n  // Buggy implementation here\n  return arr;\n}`);
  const [solutionCode, setSolutionCode] = useState(`function solve(arr) {\n  // Correct implementation here\n  return [...arr];\n}`);
  const [tier1Hint, setTier1Hint] = useState('');
  const [tier2Hint, setTier2Hint] = useState('');
  const [tier3Hint, setTier3Hint] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [bestPracticeAdvice, setBestPracticeAdvice] = useState('');

  const [testCases, setTestCases] = useState<Array<{ name: string; inputStr: string; expectedStr: string; isHidden: boolean }>>([
    {
      name: 'Basic test case',
      inputStr: '[[1, 2, 3]]',
      expectedStr: '[1, 2, 3]',
      isHidden: false
    }
  ]);

  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      {
        name: `Test case ${testCases.length + 1}`,
        inputStr: '[]',
        expectedStr: '[]',
        isHidden: false
      }
    ]);
  };

  const removeTestCase = (idx: number) => {
    if (testCases.length <= 1) return;
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  const verifySuite = async () => {
    setIsVerifying(true);
    setTestFeedback(null);

    try {
      const parsedTests: TestCase[] = testCases.map((tc, idx) => ({
        id: `custom-test-${idx}`,
        name: tc.name,
        input: JSON.parse(tc.inputStr),
        expectedOutput: JSON.parse(tc.expectedStr),
        isHidden: tc.isHidden
      }));

      // Test Solution: Must pass all
      const solutionResult = await runTestAssignment(solutionCode, functionName, 'temp-custom', parsedTests);
      if (!solutionResult.allPassed) {
        setTestFeedback(`Solution code verification failed! (${solutionResult.passedCount}/${solutionResult.totalCount} passed). Please fix the reference solution first.`);
        setIsVerifying(false);
        return;
      }

      // Test Buggy code: Should fail at least one
      const buggyResult = await runTestAssignment(buggyCode, functionName, 'temp-custom', parsedTests);
      if (buggyResult.allPassed) {
        setTestFeedback('Warning: Your buggy code passed all test cases! Add a test case that reveals the bug so the assignment has a challenge.');
        setIsVerifying(false);
        return;
      }

      setTestFeedback('Verification passed! Solution passes all tests and buggy code fails as expected.');
    } catch (err: any) {
      setTestFeedback(`Validation error: ${err?.message || 'Check JSON formatting of test inputs/outputs'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !functionName.trim()) {
      alert('Please fill out the Assignment Title and Function Name.');
      return;
    }

    try {
      const parsedTests: TestCase[] = testCases.map((tc, idx) => ({
        id: `custom-test-${Date.now()}-${idx}`,
        name: tc.name,
        input: JSON.parse(tc.inputStr),
        expectedOutput: JSON.parse(tc.expectedStr),
        isHidden: tc.isHidden
      }));

      const newAssignment: Assignment = {
        id: `custom-${Date.now()}`,
        title,
        category,
        difficulty,
        estimatedMinutes: 10,
        points: difficulty === 'Easy' ? 80 : difficulty === 'Medium' ? 120 : 160,
        scenario: scenario || 'Custom debugging challenge created in BugForge.',
        bugDescription: bugDescription || 'Fix the unexpected behavior in this function.',
        buggyCode,
        solutionCode,
        functionName,
        hints: {
          tier1: tier1Hint || 'Inspect test cases and boundary conditions.',
          tier2: tier2Hint || 'Look closely at variable assignments and loop termination.',
          tier3: tier3Hint || 'Compare with reference implementation logic.'
        },
        rootCauseAnalysis: rootCauseAnalysis || 'Analyzing edge cases and defensive checks helps prevent regression bugs.',
        bestPracticeAdvice: bestPracticeAdvice || 'Write comprehensive unit tests covering empty collections and extreme values.',
        testCases: parsedTests,
        isCustom: true
      };

      onSaveAssignment(newAssignment);
      onClose();
    } catch (err: any) {
      alert(`Invalid test case JSON: ${err?.message}`);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    try {
      const parsedTests = testCases.map((tc, idx) => ({
        id: `test-${idx}`,
        name: tc.name,
        input: JSON.parse(tc.inputStr),
        expectedOutput: JSON.parse(tc.expectedStr),
        isHidden: tc.isHidden
      }));

      const data = {
        title,
        category,
        difficulty,
        functionName,
        scenario,
        bugDescription,
        buggyCode,
        solutionCode,
        hints: { tier1: tier1Hint, tier2: tier2Hint, tier3: tier3Hint },
        rootCauseAnalysis,
        bestPracticeAdvice,
        testCases: parsedTests
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'custom-assignment'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Cannot export: ${err?.message}`);
    }
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.title) setTitle(json.title);
        if (json.category) setCategory(json.category);
        if (json.difficulty) setDifficulty(json.difficulty);
        if (json.functionName) setFunctionName(json.functionName);
        if (json.scenario) setScenario(json.scenario);
        if (json.bugDescription) setBugDescription(json.bugDescription);
        if (json.buggyCode) setBuggyCode(json.buggyCode);
        if (json.solutionCode) setSolutionCode(json.solutionCode);
        if (json.hints?.tier1) setTier1Hint(json.hints.tier1);
        if (json.hints?.tier2) setTier2Hint(json.hints.tier2);
        if (json.hints?.tier3) setTier3Hint(json.hints.tier3);
        if (json.rootCauseAnalysis) setRootCauseAnalysis(json.rootCauseAnalysis);
        if (json.bestPracticeAdvice) setBestPracticeAdvice(json.bestPracticeAdvice);

        if (json.testCases && Array.isArray(json.testCases)) {
          setTestCases(json.testCases.map((tc: any) => ({
            name: tc.name || 'Test',
            inputStr: JSON.stringify(tc.input),
            expectedStr: JSON.stringify(tc.expectedOutput),
            isHidden: !!tc.isHidden
          })));
        }
      } catch (err: any) {
        alert('Invalid assignment JSON file: ' + err?.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Code2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-100 text-sm">Assignment Authoring Studio</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Create & verify custom debugging challenges</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-slate-400 font-mono text-[11px]">Assignment Title *</label>
              <input
                type="text"
                placeholder="e.g. Reverse Linked List Cycle Glitch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[11px]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-slate-600"
              >
                <option value="Algorithms">Algorithms</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Async & Promises">Async & Promises</option>
                <option value="State & Memory">State & Memory</option>
                <option value="Type & Numeric">Type & Numeric</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[11px]">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-slate-600"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[11px]">Target Function Name *</label>
              <input
                type="text"
                placeholder="solve"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-slate-600 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-mono text-[11px]">Bug Symptoms Summary</label>
              <input
                type="text"
                placeholder="Brief summary of what goes wrong"
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono text-[11px]">Scenario Context (Background Story)</label>
            <textarea
              rows={2}
              placeholder="Explain the real-world scenario where this function is deployed..."
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-slate-600 resize-none"
            />
          </div>

          {/* Code Editors Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span className="text-rose-400 font-semibold">Buggy Code Template (Student Starts Here)</span>
              </div>
              <textarea
                rows={7}
                value={buggyCode}
                onChange={(e) => setBuggyCode(e.target.value)}
                className="w-full bg-slate-950 border border-rose-950/80 rounded p-2.5 text-rose-300 font-mono text-[12px] leading-relaxed outline-none focus:border-rose-700 resize-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span className="text-emerald-400 font-semibold">Verified Solution Code (Ground Truth)</span>
              </div>
              <textarea
                rows={7}
                value={solutionCode}
                onChange={(e) => setSolutionCode(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-950/80 rounded p-2.5 text-emerald-300 font-mono text-[12px] leading-relaxed outline-none focus:border-emerald-700 resize-none"
              />
            </div>
          </div>

          {/* Test Cases Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold uppercase tracking-wider text-[11px] font-mono">
                Test Cases Suite ({testCases.length})
              </span>
              <button
                onClick={addTestCase}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Test Case</span>
              </button>
            </div>

            <div className="space-y-2">
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      placeholder="Test Name"
                      value={tc.name}
                      onChange={(e) => {
                        const copy = [...testCases];
                        copy[idx].name = e.target.value;
                        setTestCases(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      placeholder="Input Args (JSON Array e.g. [[1,2]])"
                      value={tc.inputStr}
                      onChange={(e) => {
                        const copy = [...testCases];
                        copy[idx].inputStr = e.target.value;
                        setTestCases(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-[11px] text-slate-200"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      placeholder="Expected Output (JSON)"
                      value={tc.expectedStr}
                      onChange={(e) => {
                        const copy = [...testCases];
                        copy[idx].expectedStr = e.target.value;
                        setTestCases(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-[11px] text-slate-200"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer" title="Hidden edge case">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) => {
                          const copy = [...testCases];
                          copy[idx].isHidden = e.target.checked;
                          setTestCases(copy);
                        }}
                      />
                      <span>Hide</span>
                    </label>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeTestCase(idx)}
                      disabled={testCases.length <= 1}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Feedback Notice */}
          {testFeedback && (
            <div className={`p-3 rounded text-xs border ${
              testFeedback.includes('passed!')
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/60 border-amber-800 text-amber-200'
            }`}>
              {testFeedback}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="h-12 bg-slate-950 px-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={verifySuite}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium transition cursor-pointer"
          >
            <Play className={`h-3 w-3 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying...' : 'Verify Test Suite'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save & Publish Assignment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
