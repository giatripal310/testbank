// ─────────────────────────────────────────────
// EDIT THESE THREE VALUES — then save the file
// ─────────────────────────────────────────────
const SUPABASE_URL      = 'https://rlrmumjiuiumpdqdlura.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscm11bWppdWl1bXBkcWRsdXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDQ0MzMsImV4cCI6MjA5NzM4MDQzM30.EUGNQ1DFWy6PEkc0SPArsidPZrORdp6ENBlIABC1Jg4'
const AI_WORKER_URL     = 'YOUR-CLOUDFLARE-WORKER-URL'   // set up after Cloudflare step
// ─────────────────────────────────────────────

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Constants shared across all pages
const SUBJECTS = [
  { value: 'math',           label: 'Mathematics',        color: 'blue'   },
  { value: 'science',        label: 'Science',            color: 'green'  },
  { value: 'social_studies', label: 'Social Studies',     color: 'yellow' },
  { value: 'language_arts',  label: 'Language Arts',      color: 'purple' },
  { value: 'reading',        label: 'Reading',            color: 'pink'   },
  { value: 'writing',        label: 'Writing',            color: 'indigo' },
  { value: 'history',        label: 'History',            color: 'orange' },
  { value: 'geography',      label: 'Geography',          color: 'teal'   },
  { value: 'art',            label: 'Art',                color: 'rose'   },
  { value: 'music',          label: 'Music',              color: 'violet' },
  { value: 'pe',             label: 'Physical Education', color: 'lime'   },
  { value: 'technology',     label: 'Technology / CS',    color: 'cyan'   },
  { value: 'other',          label: 'Other',              color: 'gray'   },
]

const GRADE_LEVELS = [
  { value: 'K', label: 'Kindergarten' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i+1), label: `Grade ${i+1}` }))
]

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Starter',      color: '#16a34a', bg: '#dcfce7', text: '#15803d' },
  { value: 2, label: 'Basic',        color: '#65a30d', bg: '#ecfccb', text: '#4d7c0f' },
  { value: 3, label: 'Intermediate', color: '#ca8a04', bg: '#fef9c3', text: '#92400e' },
  { value: 4, label: 'Advanced',     color: '#ea580c', bg: '#ffedd5', text: '#9a3412' },
  { value: 5, label: 'Challenge',    color: '#dc2626', bg: '#fee2e2', text: '#991b1b' },
]

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice'    },
  { value: 'true_false',      label: 'True / False'       },
  { value: 'short_answer',    label: 'Short Answer'       },
  { value: 'essay',           label: 'Essay'              },
  { value: 'fill_blank',      label: 'Fill in the Blank'  },
  { value: 'matching',        label: 'Matching'           },
]

const SUBJECT_COLORS = {
  blue:   { bg: '#dbeafe', text: '#1e40af' },
  green:  { bg: '#dcfce7', text: '#166534' },
  yellow: { bg: '#fef9c3', text: '#854d0e' },
  purple: { bg: '#f3e8ff', text: '#6b21a8' },
  pink:   { bg: '#fce7f3', text: '#9d174d' },
  indigo: { bg: '#e0e7ff', text: '#3730a3' },
  orange: { bg: '#ffedd5', text: '#9a3412' },
  teal:   { bg: '#ccfbf1', text: '#115e59' },
  rose:   { bg: '#ffe4e6', text: '#9f1239' },
  violet: { bg: '#ede9fe', text: '#5b21b6' },
  lime:   { bg: '#ecfccb', text: '#3f6212' },
  cyan:   { bg: '#cffafe', text: '#155e75' },
  gray:   { bg: '#f3f4f6', text: '#374151' },
}

function getSubject(value)    { return SUBJECTS.find(s => s.value === value) || { label: value, color: 'gray' } }
function getDifficulty(value) { return DIFFICULTY_LEVELS.find(d => d.value === value) || { label: String(value), bg: '#f3f4f6', text: '#374151' } }
function getTypeLabel(value)  { return (QUESTION_TYPES.find(t => t.value === value) || { label: value }).label }
function getGradeLabel(value) { return (GRADE_LEVELS.find(g => g.value === value) || { label: value }).label }

function subjectBadge(value) {
  const s = getSubject(value)
  const c = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.gray
  return `<span style="background:${c.bg};color:${c.text}" class="text-xs font-medium px-2 py-0.5 rounded-full">${s.label}</span>`
}

function difficultyBadge(value) {
  const d = getDifficulty(value)
  return `<span style="background:${d.bg};color:${d.text}" class="text-xs font-medium px-2 py-0.5 rounded-full">${d.label}</span>`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function requireAuth() {
  const { data: { session } } = await db.auth.getSession()
  if (!session) { window.location.href = 'index.html'; return null }
  return session.user
}

async function signOut() {
  await db.auth.signOut()
  window.location.href = 'index.html'
}

function navHTML(active) {
  const links = [
    { href: 'dashboard.html',     label: 'Dashboard'     },
    { href: 'questions.html',     label: 'Question Bank' },
    { href: 'generate.html',      label: '✨ AI Generate' },
    { href: 'question-form.html', label: '+ Add Question'},
  ]
  return `
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="dashboard.html" class="font-bold text-indigo-700 text-lg">📚 TestBank</a>
      <div class="hidden md:flex items-center gap-1">
        ${links.map(l => `
          <a href="${l.href}" class="px-3 py-1.5 text-sm rounded-lg transition-colors ${active === l.href ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}">${l.label}</a>
        `).join('')}
        <button onclick="signOut()" class="ml-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Sign out</button>
      </div>
      <button onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg hover:bg-gray-100" id="menuBtn">☰</button>
    </div>
    <div id="mobileMenu" class="hidden md:hidden border-t border-gray-200 bg-white px-4 py-2 space-y-1">
      ${links.map(l => `<a href="${l.href}" class="block px-3 py-2 text-sm rounded-lg ${active === l.href ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}">${l.label}</a>`).join('')}
      <button onclick="signOut()" class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">Sign out</button>
    </div>
  </nav>`
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('hidden')
}
