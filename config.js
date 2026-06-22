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
    { href: 'tests.html',         label: 'Tests'         },
    { href: 'generate.html',      label: '✦ AI Generate' },
  ]
  const lnk = (href, label) => {
    const on = active === href
    return `<a href="${href}" style="padding:6px 12px;font-size:.8125rem;font-weight:${on?'600':'400'};color:${on?'#3730a3':'#64748b'};background:${on?'#eef2ff':'transparent'};border-radius:4px;text-decoration:none">${label}</a>`
  }
  return `
  <nav style="background:#fff;border-bottom:1px solid #e2e8f0;position:sticky;top:0;z-index:40;font-family:'Inter',system-ui,sans-serif">
    <div style="max-width:1280px;margin:0 auto;padding:0 24px;height:96px;display:flex;align-items:center;justify-content:space-between">
      <a href="dashboard.html" style="text-decoration:none;display:flex;align-items:center;gap:10px">
        <img src="logo.png" alt="Prinberk Academy" style="height:90px;width:auto" />
        <span style="font-weight:800;color:#1a3263;font-size:1.8rem;letter-spacing:-.02em;line-height:1">TestBank</span>
      </a>
      <div class="hidden md:flex" style="align-items:center;gap:1px">
        ${links.map(l => lnk(l.href, l.label)).join('')}
        <a href="question-form.html" style="margin-left:10px;padding:6px 14px;font-size:.8125rem;font-weight:500;color:#fff;background:#4338ca;border-radius:4px;text-decoration:none">+ Add Question</a>
        <button onclick="signOut()" style="margin-left:6px;padding:6px 12px;font-size:.8125rem;color:#94a3b8;background:none;border:none;cursor:pointer;border-radius:4px;font-family:inherit">Sign out</button>
      </div>
      <button onclick="toggleMobileMenu()" class="md:hidden" style="padding:8px;border:none;background:none;cursor:pointer;font-size:1.1rem" id="menuBtn">☰</button>
    </div>
    <div id="mobileMenu" class="hidden" style="border-top:1px solid #e2e8f0;background:#fff;padding:8px 16px 12px">
      ${links.map(l => `<a href="${l.href}" style="display:block;padding:8px 12px;font-size:.875rem;border-radius:4px;text-decoration:none;color:${active===l.href?'#3730a3':'#374151'};font-weight:${active===l.href?'600':'400'}">${l.label}</a>`).join('')}
      <a href="question-form.html" style="display:block;padding:8px 12px;font-size:.875rem;color:#374151;text-decoration:none">+ Add Question</a>
      <button onclick="signOut()" style="display:block;width:100%;text-align:left;padding:8px 12px;font-size:.875rem;color:#94a3b8;background:none;border:none;cursor:pointer;font-family:inherit">Sign out</button>
    </div>
  </nav>`
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('hidden')
}
