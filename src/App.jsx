import { useEffect, useState } from 'react'
import { clearTokens, getTokens, setTokens } from './lib/tokenStorage.js'
import { getCurrentUser, loginAccount, loginWithGoogle, logoutAccount, registerAccount } from './services/authApi.js'
import {
  Check,
  Eye,
  EyeOff,
  Folder,
  KeyRound,
  MessageSquareText,
  Zap,
  CircleMinus,
  ShieldCheck,
  Sparkles,
  Puzzle,
  Pin,
  ArrowRight,
  X,
} from 'lucide-react'

const features = [
  {
    icon: MessageSquareText,
    title: 'Chat with top AI models',
    description: 'Use GPT-4o, Claude, Gemini, Llama, DeepSeek and more in one place.',
  },
  {
    icon: Zap,
    title: 'AI anywhere on the web',
    description: 'Summarize, rewrite, translate, explain and generate on any website.',
  },
  {
    icon: Folder,
    title: 'Sync your history',
    description: 'Save your chats and settings, and sync across your devices.',
  },
]

function GoogleMark() {
  return (
    <svg className="size-[18px] shrink-0" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.6 6.1-14.7Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18Z" />
      <path fill="#EA4335" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.9 15l6.7 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z" />
    </svg>
  )
}

const inputClasses = 'h-11 w-full rounded-[7px] border border-[#2c2c2c] bg-[#0d0d0d] px-[13px] text-[clamp(13px,1.05vw,15px)] font-normal text-[#f4f4f4] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#a0a0a0] focus:border-[#8f7c00] focus:ring-2 focus:ring-[#ffdc00]/10'
const labelClasses = 'flex flex-col gap-2 text-[13px] font-medium text-[#bcbcbc]'

const ONBOARDING_STORAGE_KEY = 'lurph_onboarding_completed'

async function readOnboardingCompleted() {
  if (globalThis.chrome?.storage?.local) {
    const stored = await chrome.storage.local.get(ONBOARDING_STORAGE_KEY)
    return stored[ONBOARDING_STORAGE_KEY] === true
  }
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

async function writeOnboardingCompleted() {
  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.set({ [ONBOARDING_STORAGE_KEY]: true })
    return
  }
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
}

function BrandHeader({ onClose }) {
  return (
    <header className="ob-header flex shrink-0 items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-[#ffdc00] pb-1 pr-1 text-[25px] font-black leading-none tracking-[-3px] text-[#171600]">L</span>
      <span className="text-lg font-bold tracking-tight">Lurph</span>
      <button type="button" onClick={onClose} className="ml-auto grid size-8 place-items-center rounded-lg text-xl text-[#a0a0a0] transition hover:bg-white/[0.06] hover:text-white" aria-label="Close onboarding"><X size={19} /></button>
    </header>
  )
}

function OnboardingProgress({ step }) {
  return (
    <div className="ob-progress mx-auto mt-3 flex shrink-0 items-center gap-2" aria-label={`Onboarding step ${step} of 3`}>
      {[1, 2, 3].map((item) => <span key={item} className={`h-1.5 w-11 rounded-full ${item <= step ? 'bg-[#ffdc00]' : 'bg-white/[0.13]'}`} />)}
    </div>
  )
}

function ToolbarMock() {
  return (
    <div className="ob-mock-window mt-auto overflow-hidden rounded-xl border border-white/[0.12] bg-[#09090a]">
      <div className="flex h-7 items-center gap-1.5 border-b border-white/[0.08] bg-[#1b1b1e] px-2.5">
        <span className="size-2 rounded-full bg-[#ef6666]" /><span className="size-2 rounded-full bg-[#e8bd45]" /><span className="size-2 rounded-full bg-[#39b86a]" />
        <div className="ml-auto flex items-center gap-2 text-[#b4b4b8]"><span>☆</span><Puzzle size={14} /></div>
      </div>
      <div className="p-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#151517] px-2 py-2 text-xs">
          <span className="grid size-6 place-items-center rounded-md bg-[#ffdc00] text-base font-black text-black">L</span><span className="flex-1">Lurph</span><Pin size={14} className="text-[#ffdc00]" />
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-[#8f8f95]"><Puzzle size={12} /> Extensions menu <span className="ml-auto">⋮</span></div>
      </div>
    </div>
  )
}

function ContextMenuMock() {
  return (
    <div className="ob-mock-window mt-auto rounded-xl border border-white/[0.12] bg-[#111113] p-2.5 text-[11px] text-[#c5c5c8] shadow-lg">
      {['Copy', 'Search Google for “AI”', 'Print…'].map((item) => <div key={item} className="rounded-md px-2 py-1.5">{item}</div>)}
      <div className="flex items-center gap-2 rounded-md bg-[#ffdc00]/[0.17] px-2 py-2 font-semibold text-[#ffdf00]"><span className="grid size-5 place-items-center rounded bg-[#ffdc00] text-[11px] font-black text-black">L</span> Ask Lurph about this</div>
      <div className="rounded-md px-2 py-1.5">Inspect</div>
    </div>
  )
}

function SidebarMock() {
  return (
    <div className="ob-mock-window mt-auto overflow-hidden rounded-xl border border-white/[0.12] bg-[#09090a]">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-2.5 py-2 text-xs font-semibold"><span className="grid size-5 place-items-center rounded bg-[#ffdc00] text-[11px] font-black text-black">L</span>Lurph<span className="ml-auto text-[#aaa]">×</span></div>
      <div className="space-y-2 p-2.5">
        <div className="h-2 w-3/4 rounded-full bg-white/[0.08]" /><div className="h-2 w-full rounded-full bg-white/[0.08]" /><div className="h-2 w-5/6 rounded-full bg-white/[0.08]" />
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.12] bg-[#1c1c20] px-2 py-2 text-[10px] text-[#bcbcc2]"><span className="flex-1">Ask anything…</span><ArrowRight size={13} /></div>
      </div>
    </div>
  )
}

function OnboardingScreen({ step, onNext, onContinue, onFinish, onClose, websiteAccessGranted }) {
  const features = [
    { icon: MessageSquareText, title: 'Use AI on any website', description: 'Get answers, summarize, translate, rewrite and more, right where you work.' },
    { icon: Zap, title: 'Multiple leading AI models', description: 'GPT-4o, Claude, Gemini, Llama, DeepSeek and more in one place.' },
    { icon: Sparkles, title: 'Save time with better workflows', description: 'Turn your prompts into reusable workflows.' },
    { icon: ShieldCheck, title: 'Private, secure, and in your control', description: 'Your data stays yours.' },
  ]
  const permissions = [
    { title: 'Read and modify the content you see on websites', description: 'So you can translate, rewrite, summarize, and ask Lurph about text, images, and links.' },
    { title: 'Access your clipboard (optional)', description: 'To quickly analyze copied text.' },
    { title: 'Work on supported websites', description: 'To provide assistance while you browse, search, read, write, shop, or create.' },
  ]

  if (step === 1) {
    return (
      <main className="ob-screen h-svh w-full overflow-hidden bg-[#080808] p-3 text-[#f7f7f7] sm:p-4">
        <section className="ob-panel ob-step-panel mx-auto flex h-full min-h-0 w-full max-w-[650px] flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#171717] via-[#111114] to-[#09090b] p-4 sm:p-5">
          <div className="pointer-events-none absolute" />
          <BrandHeader onClose={onClose} />
          <OnboardingProgress step={1} />
          <div className="ob-intro mt-4 shrink-0 text-center">
            <h1 className="text-[clamp(25px,3.3vh,34px)] font-bold tracking-tight">Welcome to Lurph!</h1>
            <p className="mx-auto mt-2 max-w-[490px] text-[clamp(13px,1.9vh,16px)] leading-[1.45] text-[#aaa9ad]">Your AI assistant for the web.<br />Get answers, summarize, translate, rewrite and more, wherever you browse.</p>
          </div>
          <div className="ob-feature-list mt-4 grid min-h-0 gap-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="ob-feature-card flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.035] p-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ffdc00]/[0.10] text-[#ffdc00]"><Icon size={23} /></div>
                <div className="min-w-0"><h2 className="text-[clamp(12px,1.8vh,14px)] font-semibold">{title}</h2><p className="mt-1 text-[clamp(11px,1.55vh,13px)] leading-[1.4] text-[#aaa9ad]">{description}</p></div>
              </div>
            ))}
          </div>
          <button type="button" onClick={onNext} className="ob-primary-button mt-auto inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffdc00] to-[#ffc928] px-5 py-2.5 text-sm font-bold text-[#171500] transition hover:brightness-105">Next <ArrowRight size={18} /></button>
        </section>
      </main>
    )
  }

  if (step === 2) {
    return (
      <main className="ob-screen h-svh w-full overflow-hidden bg-[#080808] p-3 text-[#f7f7f7] sm:p-4">
        <section className="ob-panel ob-step-panel mx-auto flex h-full min-h-0 w-full max-w-[650px] flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#111] to-[#080808] p-4 sm:p-5">
          <BrandHeader onClose={onClose} />
          <OnboardingProgress step={2} />
          <div className="ob-intro mt-4 shrink-0 text-center">
            <h1 className="text-[clamp(22px,3vh,30px)] font-bold tracking-tight">Let Lurph see what you work with</h1>
            <p className="mx-auto mt-2 max-w-[480px] text-[clamp(12px,1.8vh,15px)] leading-[1.45] text-[#aaa9ad]">Lurph needs a few permissions to work across the web.<br className="hidden sm:block" /> Here’s what we can and cannot see.</p>
          </div>
          <div className="ob-permission-list mt-3 grid shrink-0 gap-2">
            {permissions.map(({ title, description }) => (
              <div key={title} className="ob-permission-card flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.035] p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#16a34a] text-white"><Check size={19} strokeWidth={3} /></span>
                <div className="min-w-0"><h2 className="text-[clamp(12px,1.7vh,14px)] font-semibold leading-5">{title}</h2><p className="mt-1 text-[clamp(11px,1.5vh,13px)] leading-[1.35] text-[#aaa9ad]">{description}</p></div>
              </div>
            ))}
          </div>
          <div className="ob-warning mt-2 rounded-xl border border-[#ef4444]/10 bg-[#ef4444]/[0.08] p-3">
            <h2 className="text-sm font-semibold text-[#ff7777]">We do NOT:</h2>
            <ul className="mt-1.5 grid gap-1 text-[clamp(11px,1.5vh,13px)] leading-[1.35] text-[#aaa9ad]">
              {['Read your browsing history', 'Access your passwords', 'Access your personal files', 'Collect data without your consent', 'Use your data to train models'].map((item) => <li key={item} className="flex items-center gap-2"><CircleMinus size={15} className="shrink-0 text-[#ef6464]" />{item}</li>)}
            </ul>
          </div>
          <div className="ob-footer mt-auto flex shrink-0 items-center justify-between gap-3 pt-3">
            <p className="text-xs text-[#aaa9ad]">Your privacy matters. <span className="text-[#ffdc00] underline underline-offset-4">Learn more →</span></p>
            <button type="button" onClick={onContinue} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffdc00] to-[#ffc928] px-5 py-2 text-sm font-bold text-[#171500] transition hover:brightness-105">Continue <ArrowRight size={17} /></button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="ob-screen h-svh w-full overflow-hidden bg-[#080808] p-3 text-[#f7f7f7] sm:p-4">
      <section className="ob-panel ob-final-panel mx-auto flex h-full min-h-0 w-full max-w-[1370px] flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#111] to-[#080808] p-4 sm:p-5 lg:p-6">
        <BrandHeader onClose={onClose} />
        <OnboardingProgress step={3} />
        <div className="ob-final-hero mt-2 shrink-0 text-center">
          <div className="relative mx-auto grid size-11 place-items-center rounded-xl bg-[#ffdc00] text-3xl font-black leading-none tracking-[-3px] text-[#171600] shadow-[0_0_30px_rgba(255,220,0,0.18)]"><span>L</span><Sparkles size={16} className="absolute -left-4 -top-2 text-[#ffdc00]" /><Sparkles size={16} className="absolute -right-4 -top-1 text-[#ffdc00]" /></div>
          <h1 className="mt-2 text-[clamp(27px,4vh,42px)] font-bold tracking-tight">You’re all set!</h1>
          <p className="mt-1 text-[clamp(13px,1.9vh,17px)] text-[#aaa9ad]">Lurph is now ready to use on any website.</p>
          <p className="mt-2 text-[clamp(12px,1.7vh,15px)] text-[#c5c5c8]">Here’s how to access it:</p>
        </div>
        <div className="ob-instruction-grid mt-3 grid min-h-0 flex-1 grid-cols-1 gap-2.5 lg:grid-cols-3">
          <article className="ob-instruction-card flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-3.5">
            <div className="flex items-start gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-base font-bold text-[#ffdc00]">1</span><div><h2 className="text-sm font-semibold">Find Lurph in your Chrome toolbar</h2><p className="mt-1 text-xs leading-[1.4] text-[#aaa9ad]">Click the puzzle icon in Chrome’s toolbar, then find Lurph in the list.</p></div></div>
            <ToolbarMock />
          </article>
          <article className="ob-instruction-card flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-3.5">
            <div className="flex items-start gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-base font-bold text-[#ffdc00]">2</span><div><h2 className="text-sm font-semibold">Start using Lurph anywhere on the web</h2><p className="mt-1 text-xs leading-[1.4] text-[#aaa9ad]">Right-click text or a page and choose “Ask Lurph”, or click the toolbar icon.</p></div></div>
            <ContextMenuMock />
          </article>
          <article className="ob-instruction-card flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-3.5">
            <div className="flex items-start gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-base font-bold text-[#ffdc00]">3</span><div><h2 className="text-sm font-semibold">Get answers, insights and more</h2><p className="mt-1 text-xs leading-[1.4] text-[#aaa9ad]">Open Lurph to chat, summarize, translate, rewrite, and more.</p></div></div>
            <SidebarMock />
          </article>
        </div>
        {websiteAccessGranted === false && <p className="mt-2 text-center text-xs text-[#f3d66b]">Website access wasn’t granted. You can enable it later in Chrome’s extension settings.</p>}
        <button type="button" onClick={onFinish} className="ob-primary-button mx-auto mt-3 inline-flex min-h-11 w-full max-w-[360px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffdc00] to-[#ffc928] px-5 py-2.5 text-sm font-bold text-[#171500] transition hover:brightness-105">Start using Lurph <ArrowRight size={18} /></button>
      </section>
    </main>
  )
}


function App() {
  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [websiteAccessGranted, setWebsiteAccessGranted] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const isSignup = mode === 'signup'

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setNotice('')
  }

  useEffect(() => {
    let active = true
    async function restoreSession() {
      try {
        const completed = await readOnboardingCompleted()
        if (active) setHasCompletedOnboarding(completed)
        const tokens = await getTokens()
        if (!tokens?.refreshToken) return
        const user = await getCurrentUser()
        if (active) {
          setCurrentUser(user)
          if (!completed) {
            setOnboardingStep(1)
            setShowOnboarding(true)
          }
        }
      } catch {
        // An expired/revoked session is handled by the API client; show sign-in.
        if (active) setCurrentUser(null)
      } finally {
        if (active) setIsCheckingSession(false)
      }
    }
    restoreSession()
    return () => { active = false }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)
    try {
      const payload = isSignup
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password }
      const result = isSignup ? await registerAccount(payload) : await loginAccount(payload)
      await setTokens(result.tokens)
      const completed = await readOnboardingCompleted()
      setHasCompletedOnboarding(completed)
      if (!completed) {
        setOnboardingStep(1)
        setWebsiteAccessGranted(null)
        setShowOnboarding(true)
      }
      setCurrentUser(result.user)
      setPassword('')
      setNotice(isSignup ? 'Your account has been created successfully.' : 'You are now signed in.')
    } catch (error) {
      setNotice(error.response?.data?.message || (error.code === 'ERR_NETWORK'
        ? 'Unable to reach the server. Check that the backend is running and its URL is configured.'
        : 'Something went wrong. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setNotice('')
    setIsGoogleSubmitting(true)
    try {
      const result = await loginWithGoogle()
      await setTokens(result.tokens)
      const completed = await readOnboardingCompleted()
      setHasCompletedOnboarding(completed)
      if (!completed) {
        setOnboardingStep(1)
        setWebsiteAccessGranted(null)
        setShowOnboarding(true)
      }
      setCurrentUser(result.user)
      setNotice('You are now signed in with Google.')
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Google sign-in failed. Please try again.')
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setNotice('')
    try {
      await logoutAccount()
    } catch {
      // Clear local credentials even if the server is unreachable.
    } finally {
      await clearTokens()
      setCurrentUser(null)
      setShowOnboarding(false)
      setMode('signin')
      setNotice('You have been signed out.')
    }
  }


  if (isCheckingSession) {
    return <main className="grid min-h-svh place-items-center bg-[#080808] text-sm text-[#bcbcbc]">Loading your session…</main>
  }

  const closeOnboardingTab = () => {
    const tabs = globalThis.chrome?.tabs
    if (!tabs?.getCurrent || !tabs?.remove) {
      setShowOnboarding(false)
      return
    }
    tabs.getCurrent((tab) => {
      if (tab?.id === undefined) {
        setShowOnboarding(false)
        return
      }
      tabs.remove(tab.id, () => {
        if (chrome.runtime.lastError) setShowOnboarding(false)
      })
    })
  }

  const handleContinueOnboarding = () => {
    const permissions = globalThis.chrome?.permissions
    // The permissions API call is made directly from the Continue click so Chrome
    // can associate the prompt with an explicit user gesture.
    if (!permissions?.request) {
      setWebsiteAccessGranted(null)
      setOnboardingStep(3)
      return
    }
    permissions.request({ origins: ['<all_urls>'] }, (granted) => {
      const failed = Boolean(chrome.runtime.lastError)
      setWebsiteAccessGranted(failed ? false : Boolean(granted))
      setOnboardingStep(3)
    })
  }

  const handleFinishOnboarding = async () => {
    try {
      await writeOnboardingCompleted()
      setHasCompletedOnboarding(true)
      setShowOnboarding(false)
      closeOnboardingTab()
    } catch {
      setNotice('Your setup is complete, but we could not save the setup status. It may appear again next time.')
      setShowOnboarding(false)
    }
  }

  if (currentUser && showOnboarding && !hasCompletedOnboarding) {
    return (
      <OnboardingScreen
        step={onboardingStep}
        onNext={() => setOnboardingStep(2)}
        onContinue={handleContinueOnboarding}
        onFinish={handleFinishOnboarding}
        onClose={closeOnboardingTab}
        websiteAccessGranted={websiteAccessGranted}
      />
    )
  }

  if (currentUser) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#080808] px-6 py-10 text-[#f7f7f7]">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-xl bg-[#ffdc00] pb-1 pr-1 text-4xl font-black leading-none tracking-[-3px] text-[#171600]">L</div>
          <h1 className="text-2xl font-bold tracking-tight">You’re signed in</h1>
          <p className="mt-2 text-sm text-[#a0a0a0]">Welcome to Lurph, {currentUser.name}.</p>
          <div className="mt-6 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-left">
            <p className="text-xs text-[#858585]">SIGNED IN AS</p>
            <p className="mt-1 break-all text-sm text-white">{currentUser.email}</p>
          </div>
          {notice && <p className="mt-4 text-sm text-[#d9d2a2]" role="status">{notice}</p>}
          <button type="button" onClick={handleLogout} className="mt-6 min-h-11 w-full rounded-md border border-[#3a3a3a] bg-[#202020] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]">Sign out</button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-svh w-full overflow-y-auto bg-[#080808] text-[#f7f7f7] md:h-svh md:overflow-hidden">
      <section className="grid min-h-svh w-full grid-cols-1 md:h-svh md:min-h-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" aria-label="Lurph account access">
        <section className="relative isolate hidden min-h-svh min-w-0 items-center justify-center overflow-hidden bg-[#101018] text-[#f8f8f8] md:flex md:h-svh" aria-label="About Lurph">
          <div
            className="pointer-events-none absolute -inset-[22%] z-0 blur-[1px]"
            style={{
              background: 'radial-gradient(ellipse at 12% 12%, rgba(255, 227, 0, .96) 0, rgba(255, 220, 0, .78) 17%, transparent 39%), radial-gradient(ellipse at 84% 76%, rgba(255, 222, 0, .98) 0, rgba(255, 218, 0, .78) 21%, transparent 44%), radial-gradient(ellipse at 50% 49%, #15162b 0, #0e0f19 39%, #09090b 68%)',
              transform: 'rotate(-7deg) scale(1.12)',
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-black/[0.04] via-black/[0.16] to-black/[0.07]" />
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.055]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
              backgroundSize: '34px 34px',
              maskImage: 'linear-gradient(130deg, transparent 2%, #000 52%, transparent 100%)',
            }}
          />
          <div className="pointer-events-none absolute left-[28%] top-[7%] z-0 size-[310px] rounded-full bg-[#0d0d32]/70 blur-[65px]" />
          <div className="pointer-events-none absolute -bottom-[14%] -right-[20%] z-0 size-[310px] rounded-full bg-[#ffdc00]/40 blur-[65px]" />

          <div className="relative z-10 mt-[38px] w-[min(66%,650px)] max-w-[650px]">
            <div className="mx-auto mb-8 flex min-h-[68px] w-fit max-w-full items-center justify-center rounded-full border-2 border-white/[0.23] bg-[#121215]/55 px-[30px] py-3 text-center text-[clamp(15px,1.55vw,23px)] leading-[1.3] tracking-[-0.015em] text-[#f2f2f4] shadow-[0_7px_20px_rgba(0,0,0,0.13)] backdrop-blur-xl">
              Your AI assistant for the web
            </div>

            <div className="mx-auto w-full rounded-[24px] border border-white/[0.16] bg-gradient-to-br from-[#0f0f13]/95 to-[#0d0d10]/90 px-9 py-7 shadow-[0_17px_45px_rgba(0,0,0,0.31),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[15px]">
              {features.map(({ icon: Icon, title, description }, index) => (
                <div
                  className={`relative flex items-start gap-9 px-0.5 ${index === 0 ? 'pb-[18px]' : 'border-t border-white/[0.09] py-[15px]'} ${index === features.length - 1 ? 'pb-0' : ''}`}
                  key={title}
                >
                  <div className="grid size-[82px] shrink-0 place-items-center rounded-[15px] border border-[#ffdc00]/10 bg-[#ffdc00]/[0.09] text-[#ffdc00] max-xl:size-[64px]">
                    <Icon className="size-[31px] max-xl:size-[27px]" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0 pt-2">
                    <h2 className="mb-[5px] text-[clamp(14px,1.15vw,18px)] font-semibold leading-[1.35] tracking-[-0.015em] text-[#f8f8f8]">{title}</h2>
                    <p className="m-0 max-w-[310px] text-[clamp(12px,1.08vw,17px)] leading-[1.45] text-[#aaa9ad]">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="flex min-h-svh min-w-0 flex-col items-stretch bg-[#080808] px-6 py-8 sm:px-10 md:h-svh md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-10 md:py-8 xl:px-24"
          aria-label={isSignup ? 'Create your Lurph account' : 'Sign in to Lurph'}
        >
          <div className="mx-auto my-auto w-full max-w-[500px] shrink-0">
            <div className="mb-6 flex items-center justify-center gap-2 md:hidden" aria-hidden="true">
              <span className="grid size-[34px] place-items-center rounded-lg bg-[#ffdc00] pr-1 text-[25px] font-black tracking-[-2px] text-[#171600]">L</span>
              <span className="text-base font-bold tracking-[-0.045em]">Lurph<span className="font-medium text-[#ffdc00]"> AI</span></span>
            </div>

            <div className="mb-[22px] flex flex-col items-center text-center">
              <div className="mb-5 grid size-14 shrink-0 place-items-center rounded-xl bg-[#ffdc00] pb-[5px] pr-[5px] text-[43px] font-black leading-none tracking-[-3px] text-[#171600] shadow-[0_3px_14px_rgba(255,220,0,0.18)]">
                L
              </div>
              <h1 className="m-0 text-[clamp(23px,1.9vw,29px)] font-bold leading-tight tracking-[-0.04em] text-[#f7f7f7]">
                {isSignup ? 'Welcome to Lurph' : 'Welcome back'}
              </h1>
              <p className="mt-[7px] text-[clamp(13px,1.18vw,18px)] leading-[1.4] text-[#a0a0a0]">
                {isSignup ? 'Your AI assistant for the web starts here.' : 'Sign in to continue with Lurph'}
              </p>
            </div>

            <div className="mb-[22px] grid grid-cols-2 gap-[3px] rounded-lg border border-[#292929] bg-[#171717] p-[3px]">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={`min-h-[44px] min-w-0 rounded-md border px-2.5 py-1.5 text-[clamp(12px,1.05vw,15px)] font-medium transition-colors duration-150 ${!isSignup ? 'border-[#525252] bg-gradient-to-b from-[#2d2d2d] to-[#242424] text-white shadow-[0_1px_2px_#000]' : 'border-transparent bg-transparent text-[#a1a1a1] hover:text-[#f3f3f3]'}`}
                onClick={() => switchMode('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={`min-h-[44px] min-w-0 rounded-md border px-2.5 py-1.5 text-[clamp(12px,1.05vw,15px)] font-medium transition-colors duration-150 ${isSignup ? 'border-[#525252] bg-gradient-to-b from-[#2d2d2d] to-[#242424] text-white shadow-[0_1px_2px_#000]' : 'border-transparent bg-transparent text-[#a1a1a1] hover:text-[#f3f3f3]'}`}
                onClick={() => switchMode('signup')}
              >
                Create account
              </button>
            </div>

            <button
              type="button"
              className="flex min-h-[45px] w-full items-center justify-center gap-3 rounded-md border border-[#e7e7e7] bg-[#f9f9f9] px-3 py-2.5 text-[clamp(13px,1.1vw,16px)] font-semibold text-[#171717] transition hover:-translate-y-px hover:bg-[#ededed] active:translate-y-0"
              onClick={handleGoogle}
              disabled={isGoogleSubmitting || isSubmitting}
              aria-busy={isGoogleSubmitting}
            >
              <GoogleMark />
              <span>{isGoogleSubmitting ? 'Connecting to Google…' : 'Continue with Google'}</span>
            </button>

            <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3.5 whitespace-nowrap text-xs tracking-[0.04em] text-[#929292]">
              <span className="h-px bg-[#303030]" />
              <span>OR</span>
              <span className="h-px bg-[#303030]" />
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {isSignup && (
                <label className={labelClasses} htmlFor="name">
                  <span>Name</span>
                  <input
                    className={inputClasses}
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>
              )}

              <label className={labelClasses} htmlFor="email">
                <span className={!isSignup ? 'sr-only' : ''}>Email address</span>
                <input
                  className={inputClasses}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <div className="flex flex-col gap-0 text-[13px] font-medium text-[#bcbcbc]">
                {isSignup && <label className="mb-2" htmlFor="password">Password</label>}
                <div className="relative block">
                  <input
                    className={`${inputClasses} pr-11`}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isSignup ? 'Create a password' : 'Password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 grid h-11 w-[42px] place-items-center border-0 bg-transparent text-[#858585] hover:text-[#e8e8e8]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {isSignup && (
                  <span className="mt-2 flex items-center gap-[5px] text-[11px] font-normal text-[#777]">
                    <KeyRound className="size-[13px] text-[#a99a16]" /> Use at least 8 characters.
                  </span>
                )}
              </div>



              <button
                className="mt-[3px] flex min-h-[47px] w-full items-center justify-center rounded-md border border-[#f4d000] bg-[#ffdc00] px-3 py-[11px] text-[clamp(14px,1.1vw,16px)] font-bold text-[#171500] shadow-[0_4px_14px_rgba(255,220,0,0.09)] transition hover:-translate-y-px hover:bg-[#ffe84b] hover:shadow-[0_5px_18px_rgba(255,220,0,0.15)] active:translate-y-0"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
              </button>
            </form>

            {notice && (
              <div className="mt-3.5 flex items-start gap-2 rounded-[7px] border border-[#ffdc00]/[0.22] bg-[#ffdc00]/[0.06] p-3 text-xs leading-[1.5] text-[#d9d2a2]" role="status">
                <span className="grid size-[19px] shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-[#ffdc00]"><Check size={15} /></span>
                {notice}
              </div>
            )}


          </div>
        </section>
      </section>
    </main>
  )
}

export default App
