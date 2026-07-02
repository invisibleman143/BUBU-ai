"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MemoryVaultProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Record<string, string>;
  onSaveMemory: (updatedMemory: Record<string, string>) => void;
  style?: React.CSSProperties;
  className?: string;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  name: {
    label: "Your Name",
    icon: "👤",
    desc: "How BUBU addresses you in chat.",
  },
  birthday_age: {
    label: "Birthday & Age",
    icon: "🎂",
    desc: "Special dates or your current age.",
  },
  likes: {
    label: "Likes & Hobbies",
    icon: "❤️",
    desc: "Your favorite things, foods, music, or hobbies.",
  },
  habit: {
    label: "Habits & Routines",
    icon: "🔁",
    desc: "Your daily schedules, routines, or recurring habits.",
  },
};

export default function MemoryVault({
  isOpen,
  onClose,
  memory,
  onSaveMemory,
  style,
  className,
}: MemoryVaultProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  if (!isOpen) return null;

  const handleEditStart = (key: string, val: string) => {
    setEditingKey(key);
    setEditValue(val);
  };

  const handleEditSave = (key: string) => {
    if (!editValue.trim()) {
      handleDelete(key);
      return;
    }
    const updated = { ...memory, [key]: editValue.trim() };
    onSaveMemory(updated);
    setEditingKey(null);
  };

  const handleDelete = (key: string) => {
    const updated = { ...memory };
    delete updated[key];
    onSaveMemory(updated);
    if (editingKey === key) setEditingKey(null);
  };

  const handleAddCustom = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const formattedKey = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    const updated = { ...memory, [formattedKey]: newValue.trim() };
    onSaveMemory(updated);
    setIsAddingCustom(false);
    setNewKey("");
    setNewValue("");
  };

  const allKeys = Array.from(
    new Set([...Object.keys(CATEGORY_LABELS), ...Object.keys(memory)])
  );

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", duration: 0.5 }}
      className={`relative flex flex-col rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden custom-glass-panel ${
        style ? "w-full h-full" : "w-full max-w-2xl max-h-[85vh]"
      }`}
      style={style}
    >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧠</span>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  BUBU's Memory Vault
                </h2>
                <p className="text-xs text-white/40">
                  Manage the facts and context BUBU remembers about you
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition cursor-pointer text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 glass-scrollbar">
            {allKeys.map((key) => {
              const meta = CATEGORY_LABELS[key] || {
                label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                icon: "✨",
                desc: "Custom memory detail added manually or in conversation.",
              };
              const value = memory[key];
              const isEditing = editingKey === key;

              return (
                <div
                  key={key}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <span className="text-2xl mt-1 select-none">{meta.icon}</span>
                    <div className="space-y-1 w-full min-w-0">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                        {meta.label}
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1.5 w-full">
                          <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditSave(key);
                              if (e.key === "Escape") setEditingKey(null);
                            }}
                            className="flex-1 bg-white/5 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-400/60"
                          />
                          <button
                            onClick={() => handleEditSave(key)}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 active:scale-95 transition cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : value ? (
                        <p className="text-sm text-white/90 font-medium break-words">
                          {value}
                        </p>
                      ) : (
                        <p className="text-xs text-white/20 italic">
                          No details captured. Talk to BUBU or add them manually.
                        </p>
                      )}
                      <p className="text-[10px] text-white/30">{meta.desc}</p>
                    </div>
                  </div>

                  {/* Right actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-2 justify-end sm:flex-shrink-0">
                      {value ? (
                        <>
                          <button
                            onClick={() => handleEditStart(key, value)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-bold text-white/80 hover:text-white transition-all cursor-pointer"
                          >
                            ✍️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(key)}
                            className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-xs font-bold text-red-400 transition-all cursor-pointer"
                            title="Delete memory"
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditStart(key, "")}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-xs font-bold text-cyan-400 transition-all cursor-pointer"
                        >
                          ➕ Add
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Fact Add Form */}
            {isAddingCustom ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-cyan-500/20 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Add Custom Fact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Memory Label (e.g. Favorite Drink)"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-400/50"
                  />
                  <input
                    type="text"
                    placeholder="Detail (e.g. Mocha Latte)"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-400/50"
                  />
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={() => setIsAddingCustom(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustom}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black text-xs font-bold hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                  >
                    Add Memory
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCustom(true)}
                className="w-full py-3.5 border border-dashed border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] rounded-2xl text-xs font-bold text-white/40 hover:text-cyan-400 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>➕</span> Add Custom Memory Fact
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-white/30 font-medium px-6">
            <span>Memory items are stored locally and synced contextually.</span>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to wipe BUBU's memory vault?")) {
                  onSaveMemory({});
                }
              }}
              className="text-red-400/60 hover:text-red-400 transition cursor-pointer"
            >
              Reset Vault
            </button>
          </div>
    </motion.div>
  );

  if (style) return content;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />
        {content}
      </div>
    </AnimatePresence>
  );
}
