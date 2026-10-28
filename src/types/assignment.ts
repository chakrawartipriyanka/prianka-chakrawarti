export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Category = 
  | 'Algorithms'
  | 'Data Structures'
  | 'Async & Promises'
  | 'State & Memory'
  | 'Type & Numeric'
  | 'Security & Validation'
  | 'React Hooks';

export interface TestCase {
  id: string;
  name: string;
  input: any[];
  expectedOutput: any;
  isHidden?: boolean;
  explanation?: string;
}

export interface TraceStep {
  line: number;
  variables: Record<string, any>;
  callStack?: string[];
  note?: string;
  isBugTrigger?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  estimatedMinutes: number;
  points: number;
  scenario: string;
  bugDescription: string;
  buggyCode: string;
  solutionCode: string;
  functionName: string;
  hints: {
    tier1: string; // Symptom / Observation clue
    tier2: string; // Root Cause clue
    tier3: string; // Fix Strategy & Code clue
  };
  rootCauseAnalysis: string;
  bestPracticeAdvice: string;
  testCases: TestCase[];
  sampleTraces?: Record<string, TraceStep[]>; // testCaseId -> step-by-step trace
  isCustom?: boolean;
}

export interface TestResult {
  testCaseId: string;
  name: string;
  passed: boolean;
  input: any[];
  expectedOutput: any;
  actualOutput: any;
  logs: Array<{ type: 'log' | 'warn' | 'error' | 'info'; message: string }>;
  executionTimeMs: number;
  errorMessage?: string;
  isHidden?: boolean;
}

export interface ExecutionRunResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  publicPassedCount: number;
  publicTotalCount: number;
  results: TestResult[];
  overallTimeMs: number;
  compilationError?: string;
}

export interface StudentProgress {
  assignmentId: string;
  solved: boolean;
  score: number;
  currentCode: string;
  hintsRevealed: {
    tier1: boolean;
    tier2: boolean;
    tier3: boolean;
  };
  attempts: number;
  timeSpentSeconds: number;
  lastUpdated: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  language: string;
  snippet: string[];
  correctLineIndex: number; // 0-indexed line in snippet
  questionText: string;
  explanation: string;
  category: string;
}
