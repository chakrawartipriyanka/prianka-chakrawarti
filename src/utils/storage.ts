import { StudentProgress, Assignment } from '../types/assignment';
import { INITIAL_ASSIGNMENTS } from '../data/assignments';

const STORAGE_KEY_PROGRESS = 'bugforge_student_progress_v1';
const STORAGE_KEY_CUSTOM_ASSIGNMENTS = 'bugforge_custom_assignments_v1';

export function loadAllProgress(): Record<string, StudentProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAssignmentProgress(progress: StudentProgress) {
  try {
    const all = loadAllProgress();
    all[progress.assignmentId] = progress;
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function getAssignmentProgress(assignment: Assignment): StudentProgress {
  const all = loadAllProgress();
  if (all[assignment.id]) {
    return all[assignment.id];
  }

  return {
    assignmentId: assignment.id,
    solved: false,
    score: assignment.points,
    currentCode: assignment.buggyCode,
    hintsRevealed: {
      tier1: false,
      tier2: false,
      tier3: false
    },
    attempts: 0,
    timeSpentSeconds: 0,
    lastUpdated: new Date().toISOString()
  };
}

export function loadCustomAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_ASSIGNMENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomAssignment(assignment: Assignment): Assignment[] {
  try {
    const custom = loadCustomAssignments();
    const existingIdx = custom.findIndex(a => a.id === assignment.id);
    if (existingIdx >= 0) {
      custom[existingIdx] = assignment;
    } else {
      custom.push(assignment);
    }
    localStorage.setItem(STORAGE_KEY_CUSTOM_ASSIGNMENTS, JSON.stringify(custom));
    return custom;
  } catch (err) {
    console.error('Failed to save custom assignment', err);
    return [];
  }
}

export function deleteCustomAssignment(id: string): Assignment[] {
  try {
    const custom = loadCustomAssignments().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY_CUSTOM_ASSIGNMENTS, JSON.stringify(custom));
    return custom;
  } catch {
    return [];
  }
}

export function getAllAssignments(): Assignment[] {
  const custom = loadCustomAssignments();
  return [...INITIAL_ASSIGNMENTS, ...custom];
}

export function calculateCurrentScore(progress: StudentProgress, maxPoints: number): number {
  let penalty = 0;
  if (progress.hintsRevealed.tier1) penalty += 10;
  if (progress.hintsRevealed.tier2) penalty += 20;
  if (progress.hintsRevealed.tier3) penalty += 40;

  // Small penalty for excessive failed attempts (> 5 attempts: -2 pts each, max 20)
  if (progress.attempts > 5) {
    penalty += Math.min(20, (progress.attempts - 5) * 2);
  }

  return Math.max(15, maxPoints - penalty);
}
