import { useState, useEffect, useCallback } from 'react'
import './App.css'
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Calendar,
  Search,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  SunMedium,
  Moon,
  ClipboardList,
  Target,
  MessageSquare,
  Filter,
} from 'lucide-react'

interface DiaryEntry {
  id: string
  date: string
  title: string
  category: 'learning' | 'meeting' | 'task' | 'reflection' | 'goal'
  mood: 'great' | 'good' | 'neutral' | 'challenging' | 'difficult'
  content: string
  keyTakeaways: string[]
  starred: boolean
  createdAt: number
}

type ViewMode = 'list' | 'create' | 'edit'
type FilterCategory = DiaryEntry['category'] | 'all'
type SortOrder = 'newest' | 'oldest'

const CATEGORIES: { value: DiaryEntry['category']; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'meeting', label: 'Meeting', icon: <MessageSquare className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'task', label: 'Task', icon: <ClipboardList className="w-4 h-4" />, color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'reflection', label: 'Reflection', icon: <SunMedium className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'goal', label: 'Goal', icon: <Target className="w-4 h-4" />, color: 'bg-rose-100 text-rose-700 border-rose-200' },
]

const MOODS: { value: DiaryEntry['mood']; emoji: string; label: string }[] = [
  { value: 'great', emoji: '\u{1F929}', label: 'Great' },
  { value: 'good', emoji: '\u{1F60A}', label: 'Good' },
  { value: 'neutral', emoji: '\u{1F610}', label: 'Neutral' },
  { value: 'challenging', emoji: '\u{1F624}', label: 'Challenging' },
  { value: 'difficult', emoji: '\u{1F613}', label: 'Difficult' },
]

const STORAGE_KEY = 'onboarding-diary-entries'
const THEME_KEY = 'onboarding-diary-theme'

function loadEntries(): DiaryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveEntries(entries: DiaryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getCategoryMeta(cat: DiaryEntry['category']) {
  return CATEGORIES.find((c) => c.value === cat) || CATEGORIES[0]
}

function getMoodMeta(mood: DiaryEntry['mood']) {
  return MOODS.find((m) => m.value === mood) || MOODS[2]
}

function emptyForm(): Omit<DiaryEntry, 'id' | 'createdAt'> {
  return {
    date: todayDate(),
    title: '',
    category: 'learning',
    mood: 'good',
    content: '',
    keyTakeaways: [''],
    starred: false,
  }
}

function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>(loadEntries)
  const [view, setView] = useState<ViewMode>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const filteredEntries = entries
    .filter((e) => {
      if (filterCategory !== 'all' && e.category !== filterCategory) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.keyTakeaways.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
      return sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    })

  const handleSave = useCallback(() => {
    if (!form.title.trim() || !form.content.trim()) return

    const cleanTakeaways = form.keyTakeaways.filter((t) => t.trim())

    if (editingId) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? { ...e, ...form, keyTakeaways: cleanTakeaways }
            : e
        )
      )
    } else {
      const newEntry: DiaryEntry = {
        ...form,
        id: generateId(),
        keyTakeaways: cleanTakeaways,
        createdAt: Date.now(),
      }
      setEntries((prev) => [newEntry, ...prev])
    }

    setForm(emptyForm())
    setEditingId(null)
    setView('list')
  }, [form, editingId])

  const handleEdit = (entry: DiaryEntry) => {
    setForm({
      date: entry.date,
      title: entry.title,
      category: entry.category,
      mood: entry.mood,
      content: entry.content,
      keyTakeaways: entry.keyTakeaways.length ? entry.keyTakeaways : [''],
      starred: entry.starred,
    })
    setEditingId(entry.id)
    setView('edit')
  }

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setDeleteConfirm(null)
  }

  const toggleStar = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e))
    )
  }

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addTakeaway = () => {
    setForm((prev) => ({ ...prev, keyTakeaways: [...prev.keyTakeaways, ''] }))
  }

  const updateTakeaway = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways.map((t, i) => (i === index ? value : t)),
    }))
  }

  const removeTakeaway = (index: number) => {
    setForm((prev) => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== index),
    }))
  }

  const starredCount = entries.filter((e) => e.starred).length
  const todayCount = entries.filter((e) => e.date === todayDate()).length

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900'}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Onboarding Diary</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {entries.length} entries &middot; {todayCount} today &middot; {starredCount} starred
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Toggle theme"
            >
              {darkMode ? <SunMedium className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {view === 'list' ? (
              <button
                onClick={() => {
                  setForm(emptyForm())
                  setEditingId(null)
                  setView('create')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                New Entry
              </button>
            ) : (
              <button
                onClick={() => {
                  setView('list')
                  setEditingId(null)
                  setForm(emptyForm())
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {(view === 'create' || view === 'edit') && (
          <div className={`rounded-2xl border p-6 mb-6 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-xl shadow-gray-100'}`}>
            <h2 className="text-lg font-semibold mb-5">
              {view === 'edit' ? 'Edit Entry' : 'New Diary Entry'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setForm({ ...form, category: cat.value })}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        form.category === cat.value
                          ? cat.color + ' ring-2 ring-offset-1 ring-indigo-400'
                          : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </label>
              <input
                type="text"
                placeholder="What did you work on today?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
              />
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                How was your day?
              </label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setForm({ ...form, mood: m.value })}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs transition-all ${
                      form.mood === m.value
                        ? darkMode
                          ? 'bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-500/30'
                          : 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                        : darkMode
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className={`font-medium ${form.mood === m.value ? (darkMode ? 'text-indigo-300' : 'text-indigo-700') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Details
              </label>
              <textarea
                rows={5}
                placeholder="Describe your onboarding experience, what you learned, people you met..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
              />
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Key Takeaways
              </label>
              <div className="space-y-2">
                {form.keyTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className={`mt-2 text-xs font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder="What's a key takeaway?"
                      value={takeaway}
                      onChange={(e) => updateTakeaway(idx, e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    />
                    {form.keyTakeaways.length > 1 && (
                      <button
                        onClick={() => removeTakeaway(idx)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-500 hover:text-red-400 hover:bg-gray-800' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addTakeaway}
                className={`mt-2 text-sm font-medium flex items-center gap-1 transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add takeaway
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setView('list')
                  setEditingId(null)
                  setForm(emptyForm())
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || !form.content.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm shadow-md shadow-indigo-200"
              >
                <Check className="w-4 h-4" />
                {view === 'edit' ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}

        {view === 'list' && (
          <>
            <div className="mb-5 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm'}`}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    showFilters || filterCategory !== 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : darkMode
                      ? 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
                >
                  {sortOrder === 'newest' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      filterCategory === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-400'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setFilterCategory(cat.value)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        filterCategory === cat.value
                          ? cat.color + ' ring-2 ring-offset-1 ring-indigo-400'
                          : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-400'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredEntries.length === 0 ? (
              <div className={`text-center py-20 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <BookOpen className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {entries.length === 0 ? 'Start Your Onboarding Diary' : 'No matching entries'}
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {entries.length === 0
                    ? 'Document your journey, track your progress, and reflect on your growth.'
                    : 'Try adjusting your search or filters.'}
                </p>
                {entries.length === 0 && (
                  <button
                    onClick={() => {
                      setForm(emptyForm())
                      setEditingId(null)
                      setView('create')
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Write Your First Entry
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => {
                  const catMeta = getCategoryMeta(entry.category)
                  const moodMeta = getMoodMeta(entry.mood)
                  const isExpanded = expandedEntries.has(entry.id)

                  return (
                    <div
                      key={entry.id}
                      className={`rounded-2xl border transition-all ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'}`}
                    >
                      <div
                        className="px-5 py-4 cursor-pointer"
                        onClick={() => toggleExpand(entry.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${catMeta.color}`}>
                                {catMeta.icon}
                                {catMeta.label}
                              </span>
                              <span className="text-sm" title={moodMeta.label}>
                                {moodMeta.emoji}
                              </span>
                              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {formatDate(entry.date)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-base truncate">{entry.title}</h3>
                            {!isExpanded && (
                              <p className={`text-sm mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {entry.content}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleStar(entry.id)
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                entry.starred
                                  ? 'text-amber-500 hover:text-amber-600'
                                  : darkMode
                                  ? 'text-gray-600 hover:text-gray-400'
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                            >
                              {entry.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                            </button>
                            {isExpanded ? (
                              <ChevronUp className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={`px-5 pb-5 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                          <div className={`mt-4 text-sm whitespace-pre-wrap leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {entry.content}
                          </div>

                          {entry.keyTakeaways.length > 0 && (
                            <div className="mt-4">
                              <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Key Takeaways
                              </h4>
                              <ul className="space-y-1.5">
                                {entry.keyTakeaways.map((t, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
                                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className={`mt-4 pt-3 border-t flex gap-2 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                            <button
                              onClick={() => handleEdit(entry)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            {deleteConfirm === entry.id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-red-500 font-medium">Delete?</span>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(entry.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${darkMode ? 'text-red-400 bg-gray-800 hover:bg-red-900/30' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      <footer className={`mt-12 py-6 border-t text-center text-xs ${darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
        Onboarding Diary &copy; {new Date().getFullYear()} &middot; Track your journey, one day at a time.
      </footer>
    </div>
  )
}

export default App
