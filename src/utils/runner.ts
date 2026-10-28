import { TestCase, TestResult, ExecutionRunResult } from '../types/assignment';

// Deep equality helper for diverse test structures
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a === 'number' && typeof b === 'number') {
    if (isNaN(a) && isNaN(b)) return true;
  }

  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (keysB[i] !== key) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

// Prepare custom mock inputs for specialized assignments
function prepareTestInput(assignmentId: string, testCaseId: string, rawInput: any[]): { args: any[]; postCheck?: (fnResult: any, argsPassed: any[]) => boolean } {
  // Deep state mutation purity test
  if (assignmentId === 'deep-state-mutation' && testCaseId === 'mut-2') {
    const originalProfile = {
      id: 'usr_purity',
      name: 'PurityTest',
      preferences: {
        theme: 'dark',
        channels: [
          { id: 'sms', enabled: false },
          { id: 'email', enabled: true }
        ]
      }
    };
    // Deep clone copy for comparison
    const snapshotBefore = JSON.parse(JSON.stringify(originalProfile));

    return {
      args: [originalProfile, 'sms', true],
      postCheck: (result, passedArgs) => {
        // Must return updated state with sms enabled = true
        const updatedCorrectly = result?.preferences?.channels?.find((c: any) => c.id === 'sms')?.enabled === true;
        // AND original profile in passedArgs[0] must NOT have been mutated!
        const originalUntouched = passedArgs[0].preferences.channels[0].enabled === false;
        // AND not the same reference
        const differentChannelsRef = result?.preferences?.channels !== passedArgs[0].preferences.channels;
        return updatedCorrectly && originalUntouched && differentChannelsRef;
      }
    };
  }

  // Async batch processing mocks
  if (assignmentId === 'async-loop-race-condition') {
    const ids = rawInput[0];
    const fetcherType = rawInput[1];

    if (fetcherType === 'MOCK_FAILING_FETCHER') {
      const mockFetch = async (id: string) => {
        await new Promise(r => setTimeout(r, 10));
        if (id === 'FAIL_ME') {
          throw new Error('Network error on ' + id);
        }
        return { name: 'File ' + id };
      };
      return { args: [ids, mockFetch] };
    }

    const mockFetch = async (id: string) => {
      await new Promise(r => setTimeout(r, 15));
      return { name: 'File ' + id };
    };
    return { args: [ids, mockFetch] };
  }

  // Circular reference object test
  if (assignmentId === 'deep-flatten-circular-stack-overflow' && rawInput[0] === 'CIRCULAR_TEST_OBJECT') {
    const nodeA: any = { name: 'NodeA' };
    const nodeB: any = { name: 'NodeB' };
    nodeA.child = nodeB;
    nodeB.parent = nodeA;
    return { args: [nodeA] };
  }

  // Default: deep clone rawInput so tests don't pollute each other
  try {
    const cloned = JSON.parse(JSON.stringify(rawInput));
    return { args: cloned };
  } catch {
    return { args: [...rawInput] };
  }
}

export async function runTestAssignment(
  userCode: string,
  functionName: string,
  assignmentId: string,
  testCases: TestCase[]
): Promise<ExecutionRunResult> {
  const startTime = performance.now();
  const results: TestResult[] = [];

  // 1. Compile function from user code
  let targetFn: any;
  try {
    // Wrap code in a scoped function factory
    // We export the function by evaluating and returning the target function name
    const factory = new Function(`
      ${userCode}
      if (typeof ${functionName} !== 'function') {
        throw new Error('Function "${functionName}" is not defined or is not a function.');
      }
      return ${functionName};
    `);
    targetFn = factory();
  } catch (err: any) {
    return {
      allPassed: false,
      passedCount: 0,
      totalCount: testCases.length,
      publicPassedCount: 0,
      publicTotalCount: testCases.filter(t => !t.isHidden).length,
      results: [],
      overallTimeMs: performance.now() - startTime,
      compilationError: err?.message || 'Syntax / compilation error in code'
    };
  }

  // 2. Execute each test case
  for (const testCase of testCases) {
    const capturedLogs: Array<{ type: 'log' | 'warn' | 'error' | 'info'; message: string }> = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const origInfo = console.info;

    // Intercept console
    const serializeLogArg = (arg: any) => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    };

    console.log = (...args: any[]) => {
      capturedLogs.push({ type: 'log', message: args.map(serializeLogArg).join(' ') });
    };
    console.warn = (...args: any[]) => {
      capturedLogs.push({ type: 'warn', message: args.map(serializeLogArg).join(' ') });
    };
    console.error = (...args: any[]) => {
      capturedLogs.push({ type: 'error', message: args.map(serializeLogArg).join(' ') });
    };
    console.info = (...args: any[]) => {
      capturedLogs.push({ type: 'info', message: args.map(serializeLogArg).join(' ') });
    };

    const caseStart = performance.now();
    let actualOutput: any = undefined;
    let errorMessage: string | undefined = undefined;
    let passed = false;

    try {
      const { args, postCheck } = prepareTestInput(assignmentId, testCase.id, testCase.input);

      // Timeout safety: wrap in a 2500ms timeout promise
      const executionPromise = Promise.resolve().then(() => targetFn(...args));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Execution timed out (possible infinite loop)')), 2500)
      );

      actualOutput = await Promise.race([executionPromise, timeoutPromise]);

      if (postCheck) {
        passed = postCheck(actualOutput, args);
      } else {
        passed = deepEqual(actualOutput, testCase.expectedOutput);
      }
    } catch (err: any) {
      errorMessage = err?.message || String(err);
      passed = false;
    } finally {
      // Restore console
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      console.info = origInfo;
    }

    const caseTime = performance.now() - caseStart;

    results.push({
      testCaseId: testCase.id,
      name: testCase.name,
      passed,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput,
      logs: capturedLogs,
      executionTimeMs: Math.round(caseTime * 100) / 100,
      errorMessage,
      isHidden: testCase.isHidden
    });
  }

  const passedCount = results.filter(r => r.passed).length;
  const publicPassedCount = results.filter(r => r.passed && !r.isHidden).length;
  const publicTotalCount = results.filter(r => !r.isHidden).length;

  return {
    allPassed: passedCount === testCases.length,
    passedCount,
    totalCount: testCases.length,
    publicPassedCount,
    publicTotalCount,
    results,
    overallTimeMs: Math.round((performance.now() - startTime) * 10) / 10
  };
}
