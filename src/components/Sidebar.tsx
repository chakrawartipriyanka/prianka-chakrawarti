import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Filter, 
  Search, 
  Sparkles, 
  BookMarked,
  Layers,
  Flame,
  ChevronRight,
  Code2
} from 'lucide-react';
import { Assignment, Category, Difficulty, StudentProgress } from '../types/assignment';

interface SidebarProps {
  assignments: Assignment[];
  activeAssignmentId: string;
  onSelectAssignment: (assignment: Assignment) => void;
  progressMap: Record<string, StudentProgress>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  assignments,
  activeAssignmentId,
  onSelectAssignment,
  progressMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const categories: Array<string> = ['All', 'Algorithms', 'Async & Promises', 'State & Memory', 'Type & Numeric', 'Data Structures'];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || assignment.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || assignment.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return <span className="text-[10px] font-mono text-emerald-400">Easy</span>;
      case 'Medium':
        return <span className="text-[10px] font-mono text-amber-400">Med</span>;
      case 'Hard':
        return <span className="text-[10px] font-mono text-rose-400">Hard</span>;
    }
  };

  return (
    <aside className="w-80 shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Search & Filters */}
      <div className="p-3 border-b border-slate-800/80 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search bugs or algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 font-sans"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-slate-100 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2 space-y-1">
        <div className="px-2 py-1 flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-wider font-mono">
          <span>Assignments ({filteredAssignments.length})</span>
          <span>Diff / Pts</span>
        </div>

        {filteredAssignments.map((assignment) => {
          const isActive = assignment.id === activeAssignmentId;
          const prog = progressMap[assignment.id];
          const isSolved = prog?.solved;

          return (
            <button
              key={assignment.id}
              onClick={() => onSelectAssignment(assignment)}
              className={`w-full text-left p-2.5 rounded-lg transition group flex items-start justify-between gap-2.5 cursor-pointer border ${
                isActive
                  ? 'bg-slate-900/90 border-slate-700/80 shadow-sm'
                  : 'border-transparent hover:bg-slate-900/50 hover:border-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {isSolved ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-medium truncate ${
                      isActive ? 'text-amber-300' : isSolved ? 'text-slate-200' : 'text-slate-300'
                    }`}>
                      {assignment.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>{assignment.category}</span>
                    <span>•</span>
                    <span>{assignment.estimatedMinutes}m</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1">
                {getDifficultyBadge(assignment.difficulty)}
                <span className="text-[10px] font-mono text-slate-400">
                  {assignment.points}p
                </span>
              </div>
            </button>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500">
            No assignments match the selected filter.
          </div>
        )}
      </div>

      {/* Footer helper */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between">
        <span className="font-mono text-[11px] text-slate-500">
          Tip: <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Cmd+Enter</kbd> to run
        </span>
      </div>
    </aside>
  );
};
