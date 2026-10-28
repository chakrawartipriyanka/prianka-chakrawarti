export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  originalLineNumber?: number;
  newLineNumber?: number;
}

export function computeLineDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  // Simple and clean Longest Common Subsequence line diff
  const dp: number[][] = Array(origLines.length + 1)
    .fill(0)
    .map(() => Array(modLines.length + 1).fill(0));

  for (let i = 0; i < origLines.length; i++) {
    for (let j = 0; j < modLines.length; j++) {
      if (origLines[i] === modLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to find diff
  const result: DiffLine[] = [];
  let i = origLines.length;
  let j = modLines.length;

  const rawBacktrack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
      rawBacktrack.push({
        type: 'unchanged',
        content: origLines[i - 1],
        originalLineNumber: i,
        newLineNumber: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawBacktrack.push({
        type: 'added',
        content: modLines[j - 1],
        newLineNumber: j
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawBacktrack.push({
        type: 'removed',
        content: origLines[i - 1],
        originalLineNumber: i
      });
      i--;
    }
  }

  return rawBacktrack.reverse();
}
