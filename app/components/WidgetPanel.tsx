"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToDoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface WidgetPanelProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  todos: ToDoItem[];
  setTodos: React.Dispatch<React.SetStateAction<ToDoItem[]>>;
  notes: string;
  setNotes: (notes: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function WidgetPanel({
  isMobile,
  isOpen,
  onClose,
  todos,
  setTodos,
  notes,
  setNotes,
  style,
  className,
}: WidgetPanelProps) {
  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const item: ToDoItem = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false,
    };
    setTodos((prev) => {
      const updated = [...prev, item];
      localStorage.setItem("bubu_widget_todo", JSON.stringify(updated));
      return updated;
    });
    setNewTodo("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      localStorage.setItem("bubu_widget_todo", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem("bubu_widget_todo", JSON.stringify(updated));
      return updated;
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem("bubu_widget_notes", val);
  };

  if (!isOpen) return null;

  // Helper to extract category badges (e.g. "[Work] Buy groceries")
  const getTaskDetails = (text: string) => {
    const match = text.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      const tag = match[1];
      const rest = match[2];
      
      let color = "bg-slate-500/20 text-slate-300 border-slate-500/30";
      const lt = tag.toLowerCase();
      if (lt === "work") {
        color = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]";
      } else if (lt === "urgent" || lt === "high") {
        color = "bg-red-500/20 text-red-300 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]";
      } else if (lt === "idea") {
        color = "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]";
      } else if (lt === "ai" || lt === "sync") {
        color = "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]";
      } else if (lt === "personal") {
        color = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
      }

      return { tag, content: rest, tagClass: color };
    }
    return { tag: null, content: text, tagClass: "" };
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 50 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 50 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`border flex flex-col gap-5 text-white overflow-hidden flex-shrink-0 transition-all duration-300 p-5 custom-glass-panel
        ${className || (isMobile 
          ? "fixed inset-x-0 bottom-0 top-16 rounded-t-3xl z-45 border-t" 
          : "w-80 h-full rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
        )}`}
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-cyan-400">Workspace HUD</h3>
            <p className="text-[10px] text-white/40">Shared workspace with BUBU</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/5 active:scale-90 transition cursor-pointer text-white/50 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 glass-scrollbar">
        
        {/* 1. TO-DO PLANNER */}
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs uppercase tracking-wider text-white/40 font-bold flex items-center justify-between">
              <span>📝 Planner & Tasks</span>
              <span className="text-[10px] lowercase text-cyan-400/80 font-semibold tracking-wide">
                {completedCount}/{totalCount} completed
              </span>
            </h4>

            {/* Neon Progress Bar */}
            {totalCount > 0 && (
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(completedCount / totalCount) * 100}%`,
                  }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />
              </div>
            )}
          </div>

          {/* Input block */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. [Work] Code widgets..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTodo();
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 outline-none text-white focus:border-cyan-400/40 placeholder-white/30 transition-all duration-300"
            />
            <button
              onClick={handleAddTodo}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black active:scale-95 hover:scale-[1.03] transition-all cursor-pointer shadow-[0_2px_8px_rgba(34,211,238,0.2)]"
            >
              +
            </button>
          </div>

          {/* List items */}
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {todos.length === 0 ? (
                <p className="text-xs text-white/30 italic text-center py-6">No active tasks</p>
              ) : (
                todos.map((todo) => {
                  const { tag, content, tagClass } = getTaskDetails(todo.text);
                  return (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, padding: 0, margin: 0 }}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                    >
                      <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo.id)}
                          className="w-4 h-4 accent-cyan-400 cursor-pointer rounded border-white/20"
                        />
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          {tag && (
                            <span className={`self-start text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${tagClass}`}>
                              {tag}
                            </span>
                          )}
                          <span
                            className={`text-xs truncate transition-all duration-300 ${
                              todo.completed ? "line-through text-white/30" : "text-white/85"
                            }`}
                          >
                            {content}
                          </span>
                        </div>
                      </label>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-[11px] text-white/30 hover:text-red-400 active:scale-90 transition cursor-pointer flex-shrink-0"
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. STICKY NOTES */}
        <div className="flex flex-col gap-2.5 relative group">
          <h4 className="text-xs uppercase tracking-wider text-white/40 font-bold">
            📌 Sticky Notes & Reminders
          </h4>
          
          <div className="relative rounded-2xl overflow-hidden border border-yellow-500/20 bg-yellow-500/[0.015] shadow-[0_8px_24px_rgba(0,0,0,0.3)] group-hover:border-yellow-500/35 transition-all duration-300">
            {/* Top pin ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-yellow-500/20 via-yellow-400/40 to-yellow-500/20" />
            
            <textarea
              placeholder="Type notes or reminders here... BUBU can read and write to this box too!"
              value={notes}
              onChange={handleNotesChange}
              rows={6}
              className="w-full p-4 text-xs bg-transparent text-yellow-100/90 outline-none resize-none placeholder-yellow-500/30 transition-all duration-300 leading-relaxed font-mono"
            />
            
            {/* Folded paper corner effect */}
            <div 
              className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-gradient-to-tl from-black/90 to-yellow-500/20 border-t border-l border-yellow-500/15 pointer-events-none" 
              style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
