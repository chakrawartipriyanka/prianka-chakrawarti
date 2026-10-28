import { Assignment } from '../types/assignment';

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'binary-search-off-by-one',
    title: 'Binary Search: The Elusive Edge Index',
    category: 'Algorithms',
    difficulty: 'Easy',
    estimatedMinutes: 8,
    points: 100,
    scenario: 
      'You are building a high-speed log search service for an observability platform. The search function `binarySearch(arr, target)` is deployed to query sorted array timestamps. However, QA reports that searches for the very last element in the array fail with -1, and searching for non-existent values occasionally enters an infinite loop.',
    bugDescription: 
      'The loop condition `low < high` terminates prematurely before evaluating the single-element interval when `low === high`. Furthermore, the middle index calculation `Math.round((low + high) / 2)` biases toward the upper bound without decrementing `high`, causing a freeze.',
    buggyCode: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  // BUG 1: Loop condition exits when low === high, skipping the last candidate element
  while (low < high) {
    // BUG 2: Math.round can cause infinite loop when low and high differ by 1
    let mid = Math.round((low + high) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid; // BUG 3: Doesn't advance past mid, leads to infinite loop
    } else {
      high = mid; // BUG 4: Doesn't decrement past mid
    }
  }

  return -1;
}`,
    solutionCode: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    let mid = Math.floor(low + (high - low) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}`,
    functionName: 'binarySearch',
    hints: {
      tier1: 'Test what happens when the target is the very last element in an array of 5 elements, e.g., `binarySearch([10, 20, 30, 40, 50], 50)`. Why is `mid` never evaluated for `low === high`?',
      tier2: 'Examine both the while condition (`low < high` vs `low <= high`) and how `low` and `high` are updated. If `arr[mid] < target`, does `mid` ever need to be inspected again? How should `mid` be computed to avoid ceiling bias?',
      tier3: 'Change the loop condition to `while (low <= high)`. Compute `mid = Math.floor((low + high) / 2)`. When moving boundaries, use `low = mid + 1` and `high = mid - 1`.'
    },
    rootCauseAnalysis: 
      'Binary search partitions the search space into halves. The active search space is inclusive: `[low, high]`. When `low === high`, the search space still contains exactly one candidate element. Using `while (low < high)` skips this element. Additionally, without `+ 1` and `- 1` adjustments to `low` and `high`, a two-element range can lock into an infinite loop when `mid` repeats.',
    bestPracticeAdvice: 
      'Always use `low <= high` with `mid - 1` and `mid + 1` for standard exact-match binary search. To prevent potential 32-bit integer overflow in languages like C++/Java (and precision loss), prefer `low + Math.floor((high - low) / 2)`.',
    testCases: [
      {
        id: 'bs-1',
        name: 'Find target in the middle of odd-length array',
        input: [[1, 3, 5, 7, 9], 5],
        expectedOutput: 2,
        isHidden: false,
        explanation: '5 is at index 2'
      },
      {
        id: 'bs-2',
        name: 'Find first element (lower bound boundary)',
        input: [[10, 20, 30, 40], 10],
        expectedOutput: 0,
        isHidden: false,
        explanation: '10 is at index 0'
      },
      {
        id: 'bs-3',
        name: 'Find last element (upper bound boundary bug trigger)',
        input: [[10, 20, 30, 40, 50], 50],
        expectedOutput: 4,
        isHidden: false,
        explanation: '50 is at index 4 (the off-by-one bug causes this to return -1)'
      },
      {
        id: 'bs-4',
        name: 'Target missing (value smaller than min)',
        input: [[5, 12, 18, 24], 2],
        expectedOutput: -1,
        isHidden: false,
        explanation: '2 is absent from array'
      },
      {
        id: 'bs-5',
        name: 'Target missing (value greater than max)',
        input: [[5, 12, 18, 24], 99],
        expectedOutput: -1,
        isHidden: false,
        explanation: '99 is absent from array'
      },
      {
        id: 'bs-6',
        name: 'Single-element array: match',
        input: [[42], 42],
        expectedOutput: 0,
        isHidden: true,
        explanation: 'Single element array where low === high === 0'
      },
      {
        id: 'bs-7',
        name: 'Single-element array: mismatch',
        input: [[42], 100],
        expectedOutput: -1,
        isHidden: true,
        explanation: 'Single element array mismatch should cleanly return -1'
      },
      {
        id: 'bs-8',
        name: 'Empty array edge case',
        input: [[], 7],
        expectedOutput: -1,
        isHidden: true,
        explanation: 'Empty array should immediately exit and return -1'
      }
    ],
    sampleTraces: {
      'bs-3': [
        { line: 2, variables: { low: 0, high: 4 }, note: 'Initialize low=0, high=4 for array of 5 elements.' },
        { line: 6, variables: { low: 0, high: 4 }, note: 'Check low < high (0 < 4: true).' },
        { line: 8, variables: { low: 0, high: 4, mid: 2 }, note: 'Compute mid = 2 (arr[2] = 30).' },
        { line: 12, variables: { low: 2, high: 4, mid: 2 }, note: '30 < 50: sets low = mid (low = 2).' },
        { line: 6, variables: { low: 2, high: 4 }, note: 'Next iteration: 2 < 4: true.' },
        { line: 8, variables: { low: 2, high: 4, mid: 3 }, note: 'Compute mid = 3 (arr[3] = 40).' },
        { line: 12, variables: { low: 3, high: 4, mid: 3 }, note: '40 < 50: sets low = mid (low = 3).' },
        { line: 6, variables: { low: 3, high: 4 }, note: '3 < 4: true.' },
        { line: 8, variables: { low: 3, high: 4, mid: 4 }, note: 'Math.round((3+4)/2) = 4. arr[4] === 50.' },
        { line: 10, variables: { low: 3, high: 4, mid: 4 }, note: 'Matches 50! But if high was 3, condition fails without returning index.', isBugTrigger: true }
      ]
    }
  },
  {
    id: 'floating-point-cart-discount',
    title: 'E-Commerce Cart: The Floating Point Discount Glitch',
    category: 'Type & Numeric',
    difficulty: 'Easy',
    estimatedMinutes: 7,
    points: 100,
    scenario: 
      'An online checkout system calculates promotional tiers based on item subtotals. Customers who spend exactly $100.00 or more should receive a 15% discount. However, customers adding specific combinations of items totaling exactly $100.00 (e.g., $19.99 + $29.99 + $50.02) are being charged full price, and discounts show fractional fractions of cents (e.g., $84.99999999999999).',
    bugDescription: 
      'IEEE 754 floating-point representation causes binary rounding inaccuracies when summing decimals. Using raw addition results in totals like `99.99999999999999` which fail strict `>= 100` comparisons. Also, the final returned price is not rounded to standard cents (2 decimal places).',
    buggyCode: `function calculateCartTotal(items, discountRate = 0.15) {
  // items is an array of objects: [{ name: "Shirt", price: 19.99, qty: 1 }]
  if (!items || items.length === 0) return 0;

  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    // BUG 1: Naive floating point addition accumulates fractional epsilon errors
    subtotal += items[i].price * items[i].qty;
  }

  // BUG 2: 19.99 + 29.99 + 50.02 might be 99.99999999999999 in JS float math
  // Failing the >= 100 threshold check!
  if (subtotal >= 100) {
    let discounted = subtotal * (1 - discountRate);
    // BUG 3: Returns unrounded float with repeating decimals like 84.99999999999999
    return discounted;
  }

  return subtotal;
}`,
    solutionCode: `function calculateCartTotal(items, discountRate = 0.15) {
  if (!items || items.length === 0) return 0;

  // Calculate in integer cents to eliminate float rounding errors
  let subtotalCents = 0;
  for (let i = 0; i < items.length; i++) {
    const itemCents = Math.round(items[i].price * 100);
    subtotalCents += itemCents * items[i].qty;
  }

  const subtotal = subtotalCents / 100;

  if (subtotalCents >= 10000) { // $100.00 in cents
    const discountedCents = Math.round(subtotalCents * (1 - discountRate));
    return Number((discountedCents / 100).toFixed(2));
  }

  return Number(subtotal.toFixed(2));
}`,
    functionName: 'calculateCartTotal',
    hints: {
      tier1: 'Open your browser console and type `0.1 + 0.2`. Notice the output is `0.30000000000000004`. How does this affect `19.99 + 29.99 + 50.02`?',
      tier2: 'In financial software, calculating values in integer cents (`price * 100`) avoids IEEE-754 precision drift. Alternatively, round totals to 2 decimal places before comparing with thresholds.',
      tier3: 'Convert all calculations to cents using `Math.round(price * 100)`. Check if `subtotalCents >= 10000`. Return the final result rounded to 2 decimal places using `Number((cents / 100).toFixed(2))`.'
    },
    rootCauseAnalysis: 
      'Computers represent numbers in binary base-2. Decimal fractions like 0.1 or 0.99 cannot be represented with finite binary digits, leading to precision drift. Summing floats directly causes subtle threshold comparison failures and displays ugly fractional cents to users.',
    bestPracticeAdvice: 
      'Always store and compute currency in minimal integer units (cents, satoshis, pence) or use specialized libraries like `decimal.js` or `dinero.js`. Never store currency as naked IEEE-754 floats in SQL databases or financial ledgers.',
    testCases: [
      {
        id: 'cart-1',
        name: 'Single item below threshold',
        input: [[{ name: 'Hat', price: 45.50, qty: 1 }]],
        expectedOutput: 45.50,
        isHidden: false,
        explanation: 'Subtotal is $45.50 (< $100), no discount applied'
      },
      {
        id: 'cart-2',
        name: 'Exact $100 combination triggering floating point leak',
        input: [[
          { name: 'Item A', price: 19.99, qty: 1 },
          { name: 'Item B', price: 29.99, qty: 1 },
          { name: 'Item C', price: 50.02, qty: 1 }
        ]],
        expectedOutput: 85.00,
        isHidden: false,
        explanation: 'Total is exactly $100.00. 15% discount yields $85.00.'
      },
      {
        id: 'cart-3',
        name: 'Multiple quantities with cents rounding',
        input: [[
          { name: 'Book', price: 12.33, qty: 3 },
          { name: 'Pen', price: 1.05, qty: 2 }
        ]],
        expectedOutput: 39.09,
        isHidden: false,
        explanation: '12.33*3 + 1.05*2 = 36.99 + 2.10 = 39.09'
      },
      {
        id: 'cart-4',
        name: 'Above $100 with fractional discount rounding',
        input: [[
          { name: 'Monitor', price: 199.99, qty: 1 }
        ]],
        expectedOutput: 169.99,
        isHidden: true,
        explanation: '199.99 * 0.85 = 169.9915 -> rounded to 169.99'
      },
      {
        id: 'cart-5',
        name: 'Empty cart edge case',
        input: [[]],
        expectedOutput: 0,
        isHidden: true,
        explanation: 'Empty cart returns 0'
      }
    ]
  },
  {
    id: 'deep-state-mutation',
    title: 'State Mutation: The Ghost Notification Bug',
    category: 'State & Memory',
    difficulty: 'Medium',
    estimatedMinutes: 12,
    points: 120,
    scenario: 
      'In a user settings dashboard, users can toggle individual notification channels (email, push, sms). A helper function `updateChannelPreference(userProfile, channelId, isEnabled)` is supposed to return a new immutable profile without altering the previous state. However, the Redux undo/history feature is completely broken, and inspecting previous states reveals that earlier historical snapshots were silently mutated!',
    bugDescription: 
      'The function uses a shallow copy (`{ ...userProfile }`). However, `userProfile.preferences.channels` is a nested array of objects. Modifying an item inside that array directly mutates the original reference in memory, destroying purity.',
    buggyCode: `function updateChannelPreference(userProfile, channelId, isEnabled) {
  // BUG 1: Shallow copy only clones top-level keys; nested objects/arrays share memory!
  const updatedProfile = { ...userProfile };

  // BUG 2: Direct reference to preferences and channels array
  const channels = updatedProfile.preferences.channels;

  const targetChannel = channels.find(c => c.id === channelId);
  if (targetChannel) {
    // BUG 3: Mutating the existing channel object in-place corrupts original userProfile!
    targetChannel.enabled = isEnabled;
  } else {
    // BUG 4: Pushing into original array mutates input reference
    channels.push({ id: channelId, enabled: isEnabled });
  }

  // Return mutated object
  return updatedProfile;
}`,
    solutionCode: `function updateChannelPreference(userProfile, channelId, isEnabled) {
  if (!userProfile) return null;

  const existingChannels = userProfile.preferences?.channels || [];
  const channelExists = existingChannels.some(c => c.id === channelId);

  let newChannels;
  if (channelExists) {
    newChannels = existingChannels.map(channel => 
      channel.id === channelId 
        ? { ...channel, enabled: isEnabled } 
        : { ...channel }
    );
  } else {
    newChannels = [
      ...existingChannels.map(c => ({ ...c })),
      { id: channelId, enabled: isEnabled }
    ];
  }

  return {
    ...userProfile,
    preferences: {
      ...userProfile.preferences,
      channels: newChannels
    }
  };
}`,
    functionName: 'updateChannelPreference',
    hints: {
      tier1: 'Look at what `targetChannel.enabled = isEnabled` does. Where does `targetChannel` live in memory? Does `const updatedProfile = { ...userProfile }` clone nested objects?',
      tier2: 'JavaScript objects and arrays are stored by reference. Shallow spreading only copies the outer object reference. To guarantee immutability, every nested level being modified must be copied (`Array.prototype.map` with object spread).',
      tier3: 'Construct the new object cleanly: return `{ ...userProfile, preferences: { ...userProfile.preferences, channels: updatedChannels } }` where `updatedChannels = channels.map(c => c.id === channelId ? { ...c, enabled: isEnabled } : { ...c })`.'
    },
    rootCauseAnalysis: 
      'JavaScript assignment copies object references by default. The spread operator `{ ...obj }` performs only a shallow copy. If an object property references another object or array, both copies point to the exact same memory address. Mutating a nested property mutates both references, violating immutability and breaking React re-renders and undo-redo stacks.',
    bestPracticeAdvice: 
      'Embrace functional immutability using `structuredClone(obj)` for deep copies when performance allows, or use libraries like Immer (`produce(state, draft => { ... })`). In TypeScript, annotate state interfaces with `readonly` modifiers to catch mutations at compile time.',
    testCases: [
      {
        id: 'mut-1',
        name: 'Correctly toggle existing channel status',
        input: [
          {
            id: 'usr_1',
            name: 'Alex',
            preferences: {
              theme: 'dark',
              channels: [
                { id: 'email', enabled: true },
                { id: 'sms', enabled: false }
              ]
            }
          },
          'email',
          false
        ],
        expectedOutput: {
          id: 'usr_1',
          name: 'Alex',
          preferences: {
            theme: 'dark',
            channels: [
              { id: 'email', enabled: false },
              { id: 'sms', enabled: false }
            ]
          }
        },
        isHidden: false,
        explanation: 'Email channel should be updated to false'
      },
      {
        id: 'mut-2',
        name: 'Purity Check: Original object must NOT be mutated in memory',
        input: [
          'TEST_PURITY_CHECK',
          'sms',
          true
        ],
        expectedOutput: true,
        isHidden: false,
        explanation: 'Checks that originalProfile.preferences.channels[0].enabled is untouched'
      },
      {
        id: 'mut-3',
        name: 'Add new channel without modifying original array length',
        input: [
          {
            id: 'usr_2',
            name: 'Sarah',
            preferences: {
              channels: [{ id: 'email', enabled: true }]
            }
          },
          'push',
          true
        ],
        expectedOutput: {
          id: 'usr_2',
          name: 'Sarah',
          preferences: {
            channels: [
              { id: 'email', enabled: true },
              { id: 'push', enabled: true }
            ]
          }
        },
        isHidden: false,
        explanation: 'Appends new channel to channels array'
      },
      {
        id: 'mut-4',
        name: 'Empty preferences channels list handling',
        input: [
          { id: 'usr_3', name: 'Dev', preferences: { channels: [] } },
          'email',
          true
        ],
        expectedOutput: {
          id: 'usr_3',
          name: 'Dev',
          preferences: {
            channels: [{ id: 'email', enabled: true }]
          }
        },
        isHidden: true,
        explanation: 'Handles empty starting channels gracefully'
      }
    ]
  },
  {
    id: 'async-loop-race-condition',
    title: 'Async Pipeline: The Broken forEach Race Condition',
    category: 'Async & Promises',
    difficulty: 'Medium',
    estimatedMinutes: 10,
    points: 120,
    scenario: 
      'You are building a batch asset processing pipeline. The function `processBatch(assetIds, fetchMetadataFn)` is supposed to fetch metadata for each asset ID asynchronously, enrich it with a timestamp, and return the aggregated array of metadata objects. Instead, the function returns an empty array immediately, and backend tests log uncaught promise rejections!',
    bugDescription: 
      'The code uses `Array.prototype.forEach(async (id) => ...)` to invoke asynchronous functions. `forEach` does not await promises; it executes the callback synchronously and immediately returns `undefined`. Thus `processBatch` returns `results` before any async call finishes.',
    buggyCode: `async function processBatch(assetIds, fetchMetadataFn) {
  const results = [];

  // BUG: forEach does not await promises! It fires callbacks without waiting.
  // The function reaches the return statement immediately while results is still []!
  assetIds.forEach(async (id) => {
    try {
      const data = await fetchMetadataFn(id);
      results.push({
        id,
        ...data,
        processedAt: Date.now()
      });
    } catch (err) {
      console.error("Failed for id: " + id, err);
    }
  });

  // Returns empty array immediately!
  return results;
}`,
    solutionCode: `async function processBatch(assetIds, fetchMetadataFn) {
  if (!assetIds || assetIds.length === 0) return [];

  // Use Promise.all with map to execute in parallel and wait for all completions
  const promiseArray = assetIds.map(async (id) => {
    try {
      const data = await fetchMetadataFn(id);
      return {
        id,
        ...data,
        processed: true
      };
    } catch (err) {
      return null;
    }
  });

  const resolved = await Promise.all(promiseArray);
  return resolved.filter(Boolean);
}`,
    functionName: 'processBatch',
    hints: {
      tier1: 'Why does `Array.prototype.forEach` ignore `async` callbacks? Check the MDN documentation for `Array.prototype.forEach`.',
      tier2: '`forEach` expects a synchronous function. When you pass `async (id) => ...`, it returns a pending Promise that `forEach` discards. How can you run multiple promises concurrently and wait for all of them to settle?',
      tier3: 'Replace `assetIds.forEach(...)` with `await Promise.all(assetIds.map(async (id) => ...))` or use a sequential `for (const id of assetIds)` loop.'
    },
    rootCauseAnalysis: 
      '`Array.prototype.forEach` was specified before async/await existed. It simply invokes the callback in a loop: `callback(element, index)`. When an async function is called, it returns a Promise instance immediately. `forEach` does not check or await the return value, continuing to the next iteration. As a result, the outer function continues executing synchronously.',
    bestPracticeAdvice: 
      'Never use `forEach` with `async/await`. For concurrent execution, use `Promise.all(array.map(async item => ...))` or `Promise.allSettled`. For sequential execution where order or rate limiting matters, use a standard `for (const item of array)` loop.',
    testCases: [
      {
        id: 'async-1',
        name: 'Process 3 asset IDs with mock async delay',
        input: [
          ['asset_101', 'asset_102', 'asset_103'],
          'MOCK_ASYNC_FETCHER'
        ],
        expectedOutput: [
          { id: 'asset_101', name: 'File asset_101', processed: true },
          { id: 'asset_102', name: 'File asset_102', processed: true },
          { id: 'asset_103', name: 'File asset_103', processed: true }
        ],
        isHidden: false,
        explanation: 'All 3 items must be awaited and returned in completed array'
      },
      {
        id: 'async-2',
        name: 'Empty array input',
        input: [[], 'MOCK_ASYNC_FETCHER'],
        expectedOutput: [],
        isHidden: false,
        explanation: 'Empty array should resolve to empty array'
      },
      {
        id: 'async-3',
        name: 'Handle failed fetcher without crashing whole batch',
        input: [
          ['valid_1', 'FAIL_ME', 'valid_2'],
          'MOCK_FAILING_FETCHER'
        ],
        expectedOutput: [
          { id: 'valid_1', name: 'File valid_1', processed: true },
          { id: 'valid_2', name: 'File valid_2', processed: true }
        ],
        isHidden: true,
        explanation: 'Handles rejected promise cleanly'
      }
    ]
  },
  {
    id: 'deep-flatten-circular-stack-overflow',
    title: 'Recursion: The Circular Graph Stack Overflow',
    category: 'Data Structures',
    difficulty: 'Hard',
    estimatedMinutes: 15,
    points: 150,
    scenario: 
      'A configuration compiler takes nested JSON objects and flattens them into dot-notation key-value pairs (e.g. `{ user: { name: "A" } }` -> `{ "user.name": "A" }`). However, when imported configs contain cyclical references (such as parent pointers or self-referential graph nodes), the service crashes with: `RangeError: Maximum call stack size exceeded` and brings down the worker pool!',
    bugDescription: 
      'The recursive function lacks a `visited` Set or WeakSet to track already-seen object references. When encountering a cycle (A -> B -> A), it recurses infinitely until memory exhausts. Furthermore, arrays and null values are improperly classified.',
    buggyCode: `function flattenObject(obj, prefix = '') {
  const result = {};

  // BUG 1: No cycle tracking (Set/WeakSet) causes infinite recursion on circular objects
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propKey = prefix ? prefix + '.' + key : key;
      const value = obj[key];

      // BUG 2: typeof null === "object" in JS! Crashes on null values.
      // BUG 3: Does not treat arrays or dates safely
      if (typeof value === 'object') {
        const nested = flattenObject(value, propKey); // Recursion without cycle guard
        Object.assign(result, nested);
      } else {
        result[propKey] = value;
      }
    }
  }

  return result;
}`,
    solutionCode: `function flattenObject(obj, prefix = '', seen = new WeakSet()) {
  const result = {};

  if (!obj || typeof obj !== 'object') {
    return result;
  }

  // Guard against circular reference
  if (seen.has(obj)) {
    return { [prefix]: '[Circular]' };
  }
  seen.add(obj);

  for (const key of Object.keys(obj)) {
    const propKey = prefix ? prefix + '.' + key : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      if (seen.has(value)) {
        result[propKey] = '[Circular]';
      } else {
        const nested = flattenObject(value, propKey, seen);
        Object.assign(result, nested);
      }
    } else {
      result[propKey] = value;
    }
  }

  return result;
}`,
    functionName: 'flattenObject',
    hints: {
      tier1: 'In JavaScript, what is `typeof null`? What happens when an object contains a reference to itself, e.g. `obj.self = obj`?',
      tier2: 'To prevent infinite recursion in graph traversals, pass a `seen = new WeakSet()` through the recursive calls. Before recursing on an object, check `seen.has(obj)`.',
      tier3: 'Add a `seen = new WeakSet()` parameter. Ensure you guard `value !== null && typeof value === "object" && !Array.isArray(value)`. If `seen.has(value)`, record `"[Circular]"` instead of recursing.'
    },
    rootCauseAnalysis: 
      '1. In JavaScript, `typeof null === "object"` is a legacy quirk from 1995. When `value` is `null`, `typeof value === "object"` evaluates to `true`, passing `null` into `flattenObject` which throws when iterating keys.\n2. Deep object graphs frequently contain circular or shared references. Without a cycle tracking mechanism (like a `WeakSet`), recursive traversals generate unbounded call frames until V8 throws `Maximum call stack size exceeded`.',
    bestPracticeAdvice: 
      'Always use `value !== null && typeof value === "object"` when performing object type checks. When dealing with untrusted or complex object graphs, always maintain a cycle detection mechanism (`WeakSet` or `Set`) or enforce a maximum recursion depth limit.',
    testCases: [
      {
        id: 'flat-1',
        name: 'Standard two-level nested object',
        input: [{ server: { host: '127.0.0.1', port: 8080 }, version: 1 }],
        expectedOutput: { 'server.host': '127.0.0.1', 'server.port': 8080, version: 1 },
        isHidden: false,
        explanation: 'Flatten nested object to dot notation'
      },
      {
        id: 'flat-2',
        name: 'Object containing null and boolean values',
        input: [{ config: { debug: false, token: null }, count: 0 }],
        expectedOutput: { 'config.debug': false, 'config.token': null, count: 0 },
        isHidden: false,
        explanation: 'null must not crash the flattener'
      },
      {
        id: 'flat-3',
        name: 'Circular reference cycle handling',
        input: ['CIRCULAR_TEST_OBJECT'],
        expectedOutput: { 'name': 'NodeA', 'child.name': 'NodeB', 'child.parent': '[Circular]' },
        isHidden: false,
        explanation: 'Must gracefully mark [Circular] rather than crashing with stack overflow'
      },
      {
        id: 'flat-4',
        name: 'Three-level deep nesting with array leaf values',
        input: [{ a: { b: { c: 'deep', list: [1, 2] } } }],
        expectedOutput: { 'a.b.c': 'deep', 'a.b.list': [1, 2] },
        isHidden: true,
        explanation: 'Array preserved as leaf value'
      }
    ]
  },
  {
    id: 'array-chunk-boundary-bug',
    title: 'Array Chunking: The Lost Remainder Partition',
    category: 'Algorithms',
    difficulty: 'Easy',
    estimatedMinutes: 6,
    points: 80,
    scenario: 
      'You are building a pagination and batch dispatch utility `chunkArray(array, size)`. It should split an array into sub-arrays of maximum length `size`. However, the last partial batch is either truncated or includes duplicate items when the array length is not evenly divisible by `size`.',
    bugDescription: 
      'The loop increments the index counter incorrectly with `i += size + 1`, skipping elements, and uses `<=` instead of `<` in slice indices.',
    buggyCode: `function chunkArray(array, size) {
  if (!array || size <= 0) return [];

  const chunks = [];
  // BUG 1: i += size + 1 skips an element on every chunk boundary!
  for (let i = 0; i < array.length; i += size + 1) {
    // BUG 2: i + size + 1 overshoots the slice
    chunks.push(array.slice(i, i + size + 1));
  }

  return chunks;
}`,
    solutionCode: `function chunkArray(array, size) {
  if (!array || size <= 0 || array.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}`,
    functionName: 'chunkArray',
    hints: {
      tier1: 'Take an array of 5 elements: `[1, 2, 3, 4, 5]` and chunk size 2. How many items should each chunk have? Trace what `i += size + 1` does to `i`.',
      tier2: '`Array.prototype.slice(start, end)` extracts up to but not including `end`. Slicing `[0, 2)` gives elements at indices 0 and 1. Where should the next slice start?',
      tier3: 'The loop step should be `i += size`, and the slice should be `array.slice(i, i + size)`. `slice` automatically stops at `array.length` if `i + size` exceeds it.'
    },
    rootCauseAnalysis: 
      'The step increment `i += size + 1` caused the iterator to jump an extra element after every chunk. `slice(i, i + size)` is half-open `[start, end)`, meaning exactly `size` elements are taken, and the subsequent slice must begin at `i + size`.',
    bestPracticeAdvice: 
      'Take advantage of standard half-open interval conventions in programming. `slice` handles out-of-bounds ending indices cleanly without requiring extra boundary checks.',
    testCases: [
      {
        id: 'chunk-1',
        name: 'Even division (6 items into chunks of 2)',
        input: [[1, 2, 3, 4, 5, 6], 2],
        expectedOutput: [[1, 2], [3, 4], [5, 6]],
        isHidden: false,
        explanation: 'Three equal chunks of 2'
      },
      {
        id: 'chunk-2',
        name: 'Uneven division with remainder (5 items into chunks of 2)',
        input: [[1, 2, 3, 4, 5], 2],
        expectedOutput: [[1, 2], [3, 4], [5]],
        isHidden: false,
        explanation: 'Two chunks of 2 and one remainder chunk of 1'
      },
      {
        id: 'chunk-3',
        name: 'Chunk size larger than array length',
        input: [[10, 20], 5],
        expectedOutput: [[10, 20]],
        isHidden: false,
        explanation: 'Single chunk containing all elements'
      },
      {
        id: 'chunk-4',
        name: 'Empty array handling',
        input: [[], 3],
        expectedOutput: [],
        isHidden: true,
        explanation: 'Empty array returns empty array'
      },
      {
        id: 'chunk-5',
        name: 'Chunk size of 1',
        input: [['a', 'b', 'c'], 1],
        expectedOutput: [['a'], ['b'], ['c']],
        isHidden: true,
        explanation: 'Each element in its own chunk'
      }
    ]
  },
  {
    id: 'sql-in-memory-null-filter',
    title: 'Data Filtering: The NULL Swallowing WHERE Clause',
    category: 'Algorithms',
    difficulty: 'Medium',
    estimatedMinutes: 9,
    points: 110,
    scenario: 
      'In a reporting microservice, an in-memory SQL/relational joined table dataset simulates customer orders: `[{ customerId: 1, name: "Acme", orderTotal: 500 }, { customerId: 2, name: "Beta", orderTotal: null }]`. The function `filterHighValueOrProspects(records)` is intended to return all customers who either spent >= $200 OR have not placed any order yet (`orderTotal === null`). Instead, prospective customers with `null` orderTotals are mysteriously vanished!',
    bugDescription: 
      'The boolean logic incorrectly evaluates `record.orderTotal >= 200 || record.orderTotal === undefined` while ignoring `null`, or combines conditions with `&&` instead of `||`, causing falsy coercion.',
    buggyCode: `function filterHighValueOrProspects(records) {
  // Return records where orderTotal >= 200 OR orderTotal is null/undefined
  if (!records) return [];

  return records.filter(record => {
    // BUG 1: In JS, null >= 200 is false, but null == undefined is true with loose equality!
    // However here strict equality === undefined is used, failing when orderTotal is null!
    // BUG 2: Missing check for record presence
    return record.orderTotal >= 200 || record.orderTotal === undefined;
  });
}`,
    solutionCode: `function filterHighValueOrProspects(records) {
  if (!Array.isArray(records)) return [];

  return records.filter(record => {
    if (!record) return false;
    // A prospect has either null, undefined, or missing orderTotal
    const isProspect = record.orderTotal === null || record.orderTotal === undefined;
    const isHighValue = typeof record.orderTotal === 'number' && record.orderTotal >= 200;
    return isProspect || isHighValue;
  });
}`,
    functionName: 'filterHighValueOrProspects',
    hints: {
      tier1: 'In JavaScript, `null === undefined` evaluates to `false` under strict equality (`===`). If a database record has `orderTotal: null`, does `record.orderTotal === undefined` match it?',
      tier2: 'Also check what happens if `orderTotal` is `0`. Is a zero order a high-value customer? How should `typeof orderTotal === "number"` be guarded?',
      tier3: 'Check explicitly for both: `record.orderTotal === null || record.orderTotal === undefined` or use loose equality `record.orderTotal == null` (which matches both `null` and `undefined`). Guard `record.orderTotal >= 200` to ensure it is a valid number.'
    },
    rootCauseAnalysis: 
      'Relational databases return `NULL` for missing foreign records in `LEFT JOIN`. In JSON, this serializes as `null`. In JavaScript, `=== undefined` does NOT match `null`. Furthermore, JavaScript type coercion can yield unexpected results when comparing `null` with numbers (`null >= 0` is true, but `null > 0` is false). Explicit type checking is essential.',
    bestPracticeAdvice: 
      'Use `value == null` to concisely check for both `null` and `undefined` simultaneously, or use modern optional chaining `??`. In database filters, be hyper-vigilant about tri-value logic (TRUE, FALSE, UNKNOWN).',
    testCases: [
      {
        id: 'sql-1',
        name: 'High value customer and prospect with null',
        input: [[
          { customerId: 1, name: 'Acme Corp', orderTotal: 750 },
          { customerId: 2, name: 'Beta LLC', orderTotal: null },
          { customerId: 3, name: 'Low Spend', orderTotal: 50 }
        ]],
        expectedOutput: [
          { customerId: 1, name: 'Acme Corp', orderTotal: 750 },
          { customerId: 2, name: 'Beta LLC', orderTotal: null }
        ],
        isHidden: false,
        explanation: 'Acme ($750) and Beta (null) should both be included'
      },
      {
        id: 'sql-2',
        name: 'Customer with 0 order total should not qualify as high value or prospect',
        input: [[
          { customerId: 4, name: 'Zero Co', orderTotal: 0 },
          { customerId: 5, name: 'Big Spender', orderTotal: 200 }
        ]],
        expectedOutput: [
          { customerId: 5, name: 'Big Spender', orderTotal: 200 }
        ],
        isHidden: false,
        explanation: '0 is neither null nor >= 200'
      },
      {
        id: 'sql-3',
        name: 'Records with undefined orderTotal property',
        input: [[
          { customerId: 6, name: 'New Signup' }
        ]],
        expectedOutput: [
          { customerId: 6, name: 'New Signup' }
        ],
        isHidden: true,
        explanation: 'Missing orderTotal is undefined, which is a prospect'
      }
    ]
  }
];

export const SPOT_THE_BUG_QUESTIONS = [
  {
    id: 'quiz-1',
    title: 'Array Mutation in Reducer',
    language: 'javascript',
    category: 'State & Memory',
    questionText: 'Which line mutates the state array directly instead of creating a new copy?',
    snippet: [
      'function todoReducer(state, action) {',
      '  switch (action.type) {',
      '    case "ADD_TODO":',
      '      state.push(action.payload); // line 4',
      '      return state;',
      '    case "REMOVE_TODO":',
      '      return state.filter(t => t.id !== action.id);',
      '    default:',
      '      return state;',
      '  }',
      '}'
    ],
    correctLineIndex: 3, // index 3 is line 4 (state.push)
    explanation: '`state.push()` modifies the original array in place. In React/Redux reducers, you must return a new array: `[...state, action.payload]`.'
  },
  {
    id: 'quiz-2',
    title: 'Stale Closure in useEffect',
    language: 'javascript',
    category: 'React Hooks',
    questionText: 'Which line causes the timer to read a stale count value on every tick?',
    snippet: [
      'function Counter() {',
      '  const [count, setCount] = useState(0);',
      '  useEffect(() => {',
      '    const id = setInterval(() => {',
      '      setCount(count + 1); // line 5',
      '    }, 1000);',
      '    return () => clearInterval(id);',
      '  }, []); // line 8',
      '}'
    ],
    correctLineIndex: 7, // index 7 is line 8 (empty dependency array with count closed over)
    explanation: 'Passing `[]` as dependency array while referencing `count` in the callback creates a stale closure where `count` is always 0. Either add `count` to dependencies or use the functional updater: `setCount(prev => prev + 1)`.'
  },
  {
    id: 'quiz-3',
    title: 'Promise Error Swallowing',
    language: 'javascript',
    category: 'Async & Promises',
    questionText: 'Which line accidentally silences errors without re-throwing or notifying caller?',
    snippet: [
      'async function fetchUserData(userId) {',
      '  try {',
      '    const res = await api.get("/users/" + userId);',
      '    return res.data;',
      '  } catch (error) {',
      '    console.log("Error occurred"); // line 6',
      '    return null; // line 7',
      '  }',
      '}'
    ],
    correctLineIndex: 6, // line 7 returning null turns failures into silent false-successes
    explanation: 'Returning `null` on line 7 masks network/auth failures as empty data, preventing callers from handling errors properly. Callers cannot distinguish between a non-existent user and a broken 500 server crash.'
  },
  {
    id: 'quiz-4',
    title: 'Equality Coercion Gotcha',
    language: 'javascript',
    category: 'Type & Numeric',
    questionText: 'Which line uses loose equality that leads to truthy/falsy coercion bugs with 0 and empty strings?',
    snippet: [
      'function validateInput(value) {',
      '  if (value == false) { // line 2',
      '    return "Value is falsy";',
      '  }',
      '  return "Value is valid";',
      '}'
    ],
    correctLineIndex: 1, // line 2: value == false
    explanation: 'In JavaScript loose equality, `"" == false`, `0 == false`, and `[] == false` all evaluate to `true`. This causes numeric zeros or empty arrays to be treated identically to false boolean flags.'
  }
];
