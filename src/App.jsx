import { useState, useEffect, useRef } from 'react'

const FILTERS = ['all', 'active', 'done']

const PRIORITIES = {
  low: { label: 'Low', color: '#5b9cf6', dot: 'bg-blue-400' },
  medium: { label: 'Med', color: '#f5a623', dot: 'bg-amber-400' },
  high: { label: 'High', color: '#e85c5c', dot: 'bg-red-400' },
}

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial } catch { return initial }
  })
  useEffect(() => localStorage.setItem(key, JSON.stringify(val)), [key, val])
  return [val, setVal]
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.text)
  const inputRef = useRef(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const save = () => {
    if (draft.trim()) onEdit(task.id, draft.trim())
    setEditing(false)
  }

  const p = PRIORITIES[task.priority]

  return (
    <div className="task-enter group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#f5f5f5] border border-[#e0e0e0] hover:border-[#d0d0d0] transition-all duration-200">
      <input type="checkbox" className="checkbox-custom" checked={task.done} onChange={() => onToggle(task.id)} />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(task.text); setEditing(false) } }}
            className="w-full bg-transparent text-[#000000] text-sm font-medium border-b border-[#10b981] pb-0.5 focus:outline-none"
          />
        ) : (
          <p
            className={`text-sm font-medium cursor-pointer truncate transition-all duration-200 ${task.done ? 'line-through text-[#cccccc]' : 'text-[#000000]'}`}
            onDoubleClick={() => !task.done && setEditing(true)}
          >
            {task.text}
          </p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-[#999999] mt-0.5">
          {task.category && <span>{task.category}</span>}
          {task.category && task.dueDate && <span>•</span>}
          {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 transition-opacity duration-150 opacity-0 group-hover:opacity-100">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} title={p.label} />
        {!task.done && (
          <button onClick={() => setEditing(true)} className="text-[#999999] hover:text-[#10b981] transition-colors p-0.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        <button onClick={() => onDelete(task.id)} className="text-[#999999] hover:text-[#e85c5c] transition-colors p-0.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-100 group-hover:opacity-0 transition-opacity duration-150" style={{ background: p.color }} />
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('tasks', [])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')
  const [showCatInput, setShowCatInput] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [showDateInput, setShowDateInput] = useState(false)
  const inputRef = useRef(null)

  const addTask = () => {
    const text = input.trim()
    if (!text) return
    setTasks(prev => [{
      id: Date.now(),
      text,
      done: false,
      priority,
      category: category.trim(),
      dueDate: dueDate,
      createdAt: Date.now(),
    }, ...prev])
    setInput('')
    setCategory('')
    setDueDate('')
    setShowCatInput(false)
    setShowDateInput(false)
    inputRef.current?.focus()
  }

  const toggleTask = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const deleteTask = id => setTasks(prev => prev.filter(t => t.id !== id))
  const editTask = (id, text) => setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t))
  const clearDone = () => setTasks(prev => prev.filter(t => !t.done))

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const doneCount = tasks.filter(t => t.done).length
  const total = tasks.length
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#ffffff] flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#666666] text-xs tracking-widest uppercase mb-1">{today}</p>
          <h1 className="text-[#000000] leading-tight mb-4" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem' }}>
            My <em className="text-[#10b981] not-italic">Tasks</em>
          </h1>

          {/* Progress */}
          {total > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-[#e0e0e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10b981] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[#888888] text-xs tabular-nums">{doneCount}/{total}</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mb-6 space-y-2">
          <div className="flex gap-2 p-1.5 bg-[#f5f5f5] border border-[#e0e0e0] rounded-2xl focus-within:border-[#d0d0d0] transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Add a new task…"
              className="flex-1 bg-transparent text-[#000000] text-sm placeholder-[#cccccc] px-3 py-2 focus:outline-none"
            />
            <button
              onClick={addTask}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-[#10b981] hover:bg-[#059669] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          {/* Options row */}
          <div className="flex items-center gap-2 px-1">
            {/* Priority */}
            <div className="flex gap-1">
              {Object.entries(PRIORITIES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium tracking-wide transition-all duration-150 ${
                    priority === key
                      ? 'text-[#ffffff]'
                      : 'text-[#666666] hover:text-[#999999]'
                  }`}
                  style={priority === key ? { background: val.color } : { background: '#f5f5f5' }}
                >
                  {val.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Category toggle */}
            <button
              onClick={() => setShowCatInput(v => !v)}
              className="flex items-center gap-1.5 text-[10px] text-[#666666] hover:text-[#999999] transition-colors py-1 px-2 rounded-lg bg-[#f5f5f5]"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              {category || 'Tag'}
            </button>

            {/* Date toggle */}
            <button
              onClick={() => setShowDateInput(v => !v)}
              className="flex items-center gap-1.5 text-[10px] text-[#666666] hover:text-[#999999] transition-colors py-1 px-2 rounded-lg bg-[#f5f5f5]"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date'}
            </button>
          </div>

          {showCatInput && (
            <div className="task-enter">
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Category (e.g. Work, Personal…)"
                className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-xl px-3 py-2 text-xs text-[#000000] placeholder-[#cccccc] focus:outline-none focus:border-[#d0d0d0] transition-colors"
              />
            </div>
          )}

          {showDateInput && (
            <div className="task-enter">
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-xl px-3 py-2 text-xs text-[#000000] focus:outline-none focus:border-[#d0d0d0] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-[#f5f5f5] rounded-xl border border-[#e0e0e0]">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                filter === f
                  ? 'bg-[#10b981] text-[#ffffff]'
                  : 'text-[#888888] hover:text-[#666666]'
              }`}
            >
              {f}
              {f === 'done' && doneCount > 0 && (
                <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded-md ${filter === 'done' ? 'bg-[#ffffff]/30 text-[#ffffff]' : 'bg-[#e0e0e0] text-[#888888]'}`}>
                  {doneCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-3 text-4xl">
                {filter === 'done' ? '🎯' : filter === 'active' ? '✨' : '📋'}
              </div>
              <p className="text-[#cccccc] text-sm">
                {filter === 'done' ? 'Nothing completed yet' : filter === 'active' ? 'All caught up!' : 'No tasks yet — add one above'}
              </p>
            </div>
          ) : (
            filtered.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={editTask}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {doneCount > 0 && (
          <div className="flex justify-end mt-6">
            <button
              onClick={clearDone}
              className="text-xs text-[#cccccc] hover:text-[#e85c5c] transition-colors py-1"
            >
              Clear completed ({doneCount})
            </button>
          </div>
        )}

      </div>
    </div>
  )
}