import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clearTokens, getTokens, setTokens } from "./lib/tokenStorage.js";
import {
  EXTENSION_ACCESS_STORAGE_KEY,
  ALL_SITES_ORIGIN,
  canReadWebsiteContent,
  hasAllSitesHostPermission,
} from "./lib/extensionSettings.js";
import {
  getCurrentUser,
  loginAccount,
  loginWithGoogle,
  logoutAccount,
  registerAccount,
} from "./services/authApi.js";
import {
  sendChatMessage,
  extractPdf,
  getConversations,
  getConversation,
  renameConversation,
  deleteConversation,
} from "./services/chatApi.js";
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
  ArrowLeft,
  ChevronDown,
  Wrench,
  Settings,
  FileText,
  Lightbulb,
  ListChecks,
  Paperclip,
  Globe,
  ArrowUp,
  History,
  Plus,
  MoreHorizontal,
  LogOut,
  Search,
  Pencil,
  Trash2,
  X,
  Languages,
  ArrowLeftRight,
  Image as ImageIcon,
  Mail,
  ChevronRight,
  PenLine,
  Shield,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "Chat with top AI models",
    description:
      "Use GPT-4o, Claude, Gemini, Llama, DeepSeek and more in one place.",
  },
  {
    icon: Zap,
    title: "AI anywhere on the web",
    description:
      "Summarize, rewrite, translate, explain and generate on any website.",
  },
  {
    icon: Folder,
    title: "Sync your history",
    description: "Save your chats and settings, and sync across your devices.",
  },
];

function GoogleMark() {
  return (
    <svg
      className="size-[18px] shrink-0"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.6 6.1-14.7Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18Z"
      />
      <path
        fill="#EA4335"
        d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.9 15l6.7 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z"
      />
    </svg>
  );
}

const inputClasses =
  "h-11 w-full rounded-[7px] border border-[#2c2c2c] bg-[#0d0d0d] px-[13px] text-[clamp(13px,1.05vw,15px)] font-normal text-[#f4f4f4] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#a0a0a0] focus:border-[#8f7c00] focus:ring-2 focus:ring-[#ffdc00]/10";
const labelClasses =
  "flex flex-col gap-2 text-[13px] font-medium text-[#bcbcbc]";

const ONBOARDING_STORAGE_KEY = "lurph_onboarding_completed";
const THEME_PREFERENCE_STORAGE_KEY = "lurph_theme_preference";
const THEME_OPTIONS = ["dark", "light", "system"];

function normalizeThemePreference(value) {
  return THEME_OPTIONS.includes(value) ? value : "system";
}

async function readOnboardingCompleted() {
  if (globalThis.chrome?.storage?.local) {
    const stored = await chrome.storage.local.get(ONBOARDING_STORAGE_KEY);
    return stored[ONBOARDING_STORAGE_KEY] === true;
  }
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

async function writeOnboardingCompleted() {
  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.set({ [ONBOARDING_STORAGE_KEY]: true });
    return;
  }
  localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
}

function OnboardingProgress({ step }) {
  return (
    <div
      className="ob-progress mx-auto mt-3 flex shrink-0 items-center gap-2"
      aria-label={`Onboarding step ${step} of 3`}
    >
      {[1, 2, 3].map((item) => (
        <span
          key={item}
          className={`h-1.5 w-11 rounded-full ${item <= step ? "bg-[#ffdc00]" : "bg-white/[0.13]"}`}
        />
      ))}
    </div>
  );
}

function ToolbarMock() {
  return (
    <div className="ob-mock-window mt-auto overflow-hidden rounded-xl border border-white/[0.12] bg-[#09090a]">
      <div className="flex h-7 items-center gap-1.5 border-b border-white/[0.08] bg-[#1b1b1e] px-2.5">
        <span className="size-2 rounded-full bg-[#ef6666]" />
        <span className="size-2 rounded-full bg-[#e8bd45]" />
        <span className="size-2 rounded-full bg-[#39b86a]" />
        <div className="ml-auto flex items-center gap-2 text-[#b4b4b8]">
          <span>☆</span>
          <Puzzle size={14} />
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#151517] px-2 py-2 text-xs">
          <span className="grid size-6 place-items-center rounded-md bg-[#ffdc00] text-base font-black text-black">
            L
          </span>
          <span className="flex-1">Lurph</span>
          <Pin size={14} className="text-[#ffdc00]" />
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-[#8f8f95]">
          <Puzzle size={12} /> Extensions menu{" "}
          <span className="ml-auto">⋮</span>
        </div>
      </div>
    </div>
  );
}

function ContextMenuMock() {
  return (
    <div className="ob-mock-window mt-auto rounded-xl border border-white/[0.12] bg-[#111113] p-2.5 text-[11px] text-[#c5c5c8] shadow-lg">
      {["Copy", "Search Google for “AI”", "Print…"].map((item) => (
        <div key={item} className="rounded-md px-2 py-1.5">
          {item}
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-md bg-[#ffdc00]/[0.17] px-2 py-2 font-semibold text-[#ffdf00]">
        <span className="grid size-5 place-items-center rounded bg-[#ffdc00] text-[11px] font-black text-black">
          L
        </span>{" "}
        Ask Lurph about this
      </div>
      <div className="rounded-md px-2 py-1.5">Inspect</div>
    </div>
  );
}

function SidebarMock() {
  return (
    <div className="ob-mock-window mt-auto overflow-hidden rounded-xl border border-white/[0.12] bg-[#09090a]">
      <div className="flex items-center gap-2 border-b border-white/[0.08] px-2.5 py-2 text-xs font-semibold">
        <span className="grid size-5 place-items-center rounded bg-[#ffdc00] text-[11px] font-black text-black">
          L
        </span>
        Lurph<span className="ml-auto text-[#aaa]">×</span>
      </div>
      <div className="space-y-2 p-2.5">
        <div className="h-2 w-3/4 rounded-full bg-white/[0.08]" />
        <div className="h-2 w-full rounded-full bg-white/[0.08]" />
        <div className="h-2 w-5/6 rounded-full bg-white/[0.08]" />
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.12] bg-[#1c1c20] px-2 py-2 text-[10px] text-[#bcbcc2]">
          <span className="flex-1">Ask anything…</span>
          <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({
  step,
  onNext,
  onContinue,
  onFinish,
  websiteAccessGranted,
}) {
  const features = [
    {
      icon: MessageSquareText,
      title: "Use AI on any website",
      description:
        "Get answers, summarize, translate, rewrite and more, right where you work.",
    },
    {
      icon: Zap,
      title: "Multiple leading AI models",
      description:
        "GPT-4o, Claude, Gemini, Llama, DeepSeek and more in one place.",
    },
    {
      icon: Sparkles,
      title: "Save time with better workflows",
      description: "Turn your prompts into reusable workflows.",
    },
    {
      icon: ShieldCheck,
      title: "Private, secure, and in your control",
      description: "Your data stays yours.",
    },
  ];
  const permissions = [
    {
      title: "Read and modify the content you see on websites",
      description:
        "So you can translate, rewrite, summarize, and ask Lurph about text, images, and links.",
    },
    {
      title: "Access your clipboard (optional)",
      description: "To quickly analyze copied text.",
    },
    {
      title: "Work on supported websites",
      description:
        "To provide assistance while you browse, search, read, write, shop, or create.",
    },
  ];

  if (step === 1) {
    return (
      <main className="ob-screen h-svh w-full overflow-hidden bg-[#080808] p-3 text-[#f7f7f7] sm:p-4">
        <section className="ob-panel ob-step-panel mx-auto flex h-full min-h-0 w-full max-w-[650px] flex-col overflow-hidden bg-[#080808] p-4 sm:p-5">
          <div className="pointer-events-none absolute" />
          <OnboardingProgress step={1} />
          <div className="ob-intro mt-4 shrink-0 text-center">
            <h1 className="text-[clamp(25px,3.3vh,34px)] font-bold tracking-tight">
              Welcome to Lurph!
            </h1>
            <p className="mx-auto mt-2 max-w-[490px] text-[clamp(13px,1.9vh,16px)] leading-[1.45] text-[#aaa9ad]">
              Your AI assistant for the web.
              <br />
              Get answers, summarize, translate, rewrite and more, wherever you
              browse.
            </p>
          </div>
          <div className="ob-feature-list mt-4 grid min-h-0 gap-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="ob-feature-card flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.035] p-3"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ffdc00]/[0.10] text-[#ffdc00]">
                  <Icon size={23} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[clamp(12px,1.8vh,14px)] font-semibold">
                    {title}
                  </h2>
                  <p className="mt-1 text-[clamp(11px,1.55vh,13px)] leading-[1.4] text-[#aaa9ad]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onNext}
            className="ob-primary-button mt-auto inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffdc00] to-[#ffc928] px-5 py-2.5 text-sm font-bold text-[#171500] transition hover:brightness-105"
          >
            Next <ArrowRight size={18} />
          </button>
        </section>
      </main>
    );
  }

  if (step === 2) {
    return (
      <main className="ob-screen h-svh w-full overflow-hidden bg-[#080808] p-3 text-[#f7f7f7] sm:p-4">
        <section className="ob-panel ob-step-panel mx-auto flex h-full min-h-0 w-full max-w-[650px] flex-col overflow-hidden bg-[#080808] p-4 sm:p-5">
          <OnboardingProgress step={2} />
          <div className="ob-intro mt-4 shrink-0 text-center">
            <h1 className="text-[clamp(22px,3vh,30px)] font-bold tracking-tight">
              Let Lurph see what you work with
            </h1>
            <p className="mx-auto mt-2 max-w-[480px] text-[clamp(12px,1.8vh,15px)] leading-[1.45] text-[#aaa9ad]">
              Lurph needs a few permissions to work across the web.
              <br className="hidden sm:block" /> Here’s what we can and cannot
              see.
            </p>
          </div>
          <div className="ob-permission-list mt-3 grid shrink-0 gap-2">
            {permissions.map(({ title, description }) => (
              <div
                key={title}
                className="ob-permission-card flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.035] p-3"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#16a34a] text-white">
                  <Check size={19} strokeWidth={3} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[clamp(12px,1.7vh,14px)] font-semibold leading-5">
                    {title}
                  </h2>
                  <p className="mt-1 text-[clamp(11px,1.5vh,13px)] leading-[1.35] text-[#aaa9ad]">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="ob-warning mt-2 rounded-xl border border-[#ef4444]/10 bg-[#ef4444]/[0.08] p-3">
            <h2 className="text-sm font-semibold text-[#ff7777]">We do NOT:</h2>
            <ul className="mt-1.5 grid gap-1 text-[clamp(11px,1.5vh,13px)] leading-[1.35] text-[#aaa9ad]">
              {[
                "Read your browsing history",
                "Access your passwords",
                "Access your personal files",
                "Collect data without your consent",
                "Use your data to train models",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CircleMinus size={15} className="shrink-0 text-[#ef6464]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ob-footer mt-auto flex shrink-0 items-center justify-between gap-3 pt-3">
            <p className="text-xs text-[#aaa9ad]">
              Your privacy matters.{" "}
              <span className="text-[#ffdc00] underline underline-offset-4">
                Learn more →
              </span>
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffdc00] to-[#ffc928] px-5 py-2 text-sm font-bold text-[#171500] transition hover:brightness-105"
            >
              Continue <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="ob-screen h-svh w-full overflow-hidden bg-[#080808] p-3 text-[#f7f7f7] sm:p-4">
      <section className="ob-panel ob-final-panel mx-auto flex h-full min-h-0 w-full max-w-[1370px] flex-col overflow-hidden bg-[#080808] p-4 sm:p-5 lg:p-6">
        <OnboardingProgress step={3} />
        <div className="ob-final-hero mt-2 shrink-0 text-center">
          <h1 className="mt-2 text-[clamp(27px,4vh,42px)] font-bold tracking-tight">
            You’re all set!
          </h1>
          <p className="mt-1 text-[clamp(13px,1.9vh,17px)] text-[#aaa9ad]">
            Lurph is now ready to use on any website.
          </p>
          <p className="mt-2 text-[clamp(12px,1.7vh,15px)] text-[#c5c5c8]">
            Here’s how to access it:
          </p>
        </div>
        <div className="ob-instruction-grid mt-3 grid min-h-0 flex-1 grid-cols-1 gap-2.5 lg:grid-cols-3">
          <article className="ob-instruction-card flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-base font-bold text-[#ffdc00]">
                1
              </span>
              <div>
                <h2 className="text-sm font-semibold">
                  Find Lurph in your Chrome toolbar
                </h2>
                <p className="mt-1 text-xs leading-[1.4] text-[#aaa9ad]">
                  Click the puzzle icon in Chrome’s toolbar, then find Lurph in
                  the list.
                </p>
              </div>
            </div>
            <ToolbarMock />
          </article>
          <article className="ob-instruction-card flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-base font-bold text-[#ffdc00]">
                2
              </span>
              <div>
                <h2 className="text-sm font-semibold">
                  Start using Lurph anywhere on the web
                </h2>
                <p className="mt-1 text-xs leading-[1.4] text-[#aaa9ad]">
                  Right-click text or a page and choose “Ask Lurph”, or click
                  the toolbar icon.
                </p>
              </div>
            </div>
            <ContextMenuMock />
          </article>
          <article className="ob-instruction-card flex min-h-0 flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-3.5">
            <div className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-base font-bold text-[#ffdc00]">
                3
              </span>
              <div>
                <h2 className="text-sm font-semibold">
                  Get answers, insights and more
                </h2>
                <p className="mt-1 text-xs leading-[1.4] text-[#aaa9ad]">
                  Open Lurph to chat, summarize, translate, rewrite, and more.
                </p>
              </div>
            </div>
            <SidebarMock />
          </article>
        </div>
        {websiteAccessGranted === false && (
          <p className="mt-2 text-center text-xs text-[#f3d66b]">
            Website access wasn’t granted. You can enable it later in Chrome’s
            extension settings.
          </p>
        )}
        <button
          type="button"
          onClick={onFinish}
          className="ob-primary-button mx-auto mt-3 inline-flex min-h-11 w-full max-w-[360px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffdc00] to-[#ffc928] px-5 py-2.5 text-sm font-bold text-[#171500] transition hover:brightness-105"
        >
          Start using Lurph <ArrowRight size={18} />
        </button>
      </section>
    </main>
  );
}

const CHAT_MODELS = [
  { key: "gpt-4o", label: "GPT-4o" },
  { key: "claude-sonnet", label: "Claude Sonnet" },
  { key: "gemini-flash", label: "Gemini Flash" },
  { key: "llama-3.3", label: "Llama 3.3" },
  { key: "deepseek-v3", label: "DeepSeek V3" },
];

const QUICK_ACTIONS = [
  {
    icon: FileText,
    title: "Summarize",
    detail: "this page",
    prompt: "Summarize this webpage in concise bullet points.",
  },
  {
    icon: Lightbulb,
    title: "Explain",
    detail: "this content",
    prompt: "Explain this webpage in simple, clear language.",
  },
  {
    icon: ListChecks,
    title: "Find key",
    detail: "takeaways",
    prompt: "Extract the key takeaways from this page.",
  },
];

const MAX_PAGE_TEXT_CHARS = 16000;
// Dedicated page summaries can use a larger capture window than ordinary prompts.
// 60k characters is a practical request-size/context compromise for OpenRouter.
const MAX_SUMMARIZE_PAGE_TEXT_CHARS = 60000;
const MAX_ATTACHMENT_TEXT_CHARS = 20000;
const MAX_SELECTED_TEXT_CHARS = 12000;
const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;
const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const TRANSLATION_LANGUAGES = [
  "Auto-detect",
  "Arabic",
  "Bengali",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Dutch",
  "English",
  "French",
  "German",
  "Greek",
  "Gujarati",
  "Hindi",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kannada",
  "Korean",
  "Malay",
  "Marathi",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Russian",
  "Spanish",
  "Swahili",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
];

const IMAGE_ANALYSIS_PROMPT = "Analyze this image and explain its contents.";
const PENDING_SELECTION_STORAGE_KEY = "lurph_pending_selection";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("The selected image could not be read."));
    };
    reader.onerror = () =>
      reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

async function readActivePageContext({ maxChars = MAX_PAGE_TEXT_CHARS } = {}) {
  const chromeApi = globalThis.chrome;
  if (!chromeApi?.tabs?.query) return null;

  // The master setting and Chrome's optional host permission must both allow
  // access before Lurph reads any webpage content.
  if (!(await canReadWebsiteContent())) return null;

  try {
    const [tab] = await chromeApi.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (!tab?.id) return null;

    const fallback = {
      title: tab.title || "Current tab",
      url: tab.url || "",
      text: "",
      truncated: false,
    };

    if (!chromeApi.scripting?.executeScript) return fallback;

    const [injection] = await chromeApi.scripting.executeScript({
      target: { tabId: tab.id },
      func: (limit) => {
        // innerText captures the readable, rendered text throughout the page,
        // including content below the current scroll position.
        const fullText = (
          document.body?.innerText ||
          document.documentElement?.innerText ||
          ""
        )
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        return {
          title: document.title || "Current tab",
          url: window.location.href,
          text: fullText.slice(0, limit),
          truncated: fullText.length > limit,
          capturedCharacters: Math.min(fullText.length, limit),
          totalCharacters: fullText.length,
        };
      },
      args: [maxChars],
    });

    return injection?.result
      ? {
          title: String(injection.result.title || fallback.title).slice(0, 300),
          url: String(injection.result.url || fallback.url).slice(0, 2000),
          text: String(injection.result.text || "").slice(0, maxChars),
          truncated: injection.result.truncated === true,
          capturedCharacters: Number(injection.result.capturedCharacters) || 0,
          totalCharacters: Number(injection.result.totalCharacters) || 0,
        }
      : fallback;
  } catch {
    // Restricted pages (chrome://, Chrome Web Store, PDF viewers, etc.) cannot
    // be injected into. The dedicated page-summary flow will show a clear error.
    return null;
  }
}

function getConversationGroup(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Older";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const itemDay = new Date(date);
  itemDay.setHours(0, 0, 0, 0);
  const dayDifference = Math.floor(
    (today.getTime() - itemDay.getTime()) / 86400000,
  );

  if (dayDifference <= 0) return "Today";
  if (dayDifference === 1) return "Yesterday";
  if (dayDifference < 7) return "Last 7 days";
  return "Older";
}

function formatConversationDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const group = getConversationGroup(dateValue);
  if (group === "Older") {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(date);
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function createChatMessageId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

const TOOL_MARKERS = {
  Rewrite: "rewrite",
  Translate: "translate",
  "Image Analysis": "image-analysis",
  "Email Draft": "email-draft",
  "PDF Q&A": "pdf-qa",
  "Summarize this page": "summarize-page",
};

const TOOL_TITLES_BY_MARKER = Object.fromEntries(
  Object.entries(TOOL_MARKERS).map(([title, marker]) => [marker, title]),
);

const REWRITE_TONES = [
  "Professional",
  "Friendly",
  "Casual",
  "Formal",
  "Persuasive",
  "Concise",
  "Academic",
  "Creative",
  "Simple",
  "Confident",
];

const TOOL_MESSAGE_LABELS = {
  rewrite: { user: "Original text", assistant: "Rewritten text" },
  translate: { user: "Source text", assistant: "Translation" },
  "image-analysis": { user: "Request", assistant: "Analysis" },
  "email-draft": { user: "Request", assistant: "Email draft" },
  "pdf-qa": { user: "Question", assistant: "Answer" },
  "summarize-page": { user: "Request", assistant: "Summary" },
};

function getToolMessageLabel(message) {
  return TOOL_MESSAGE_LABELS[message.tool]?.[message.role] || "";
}

function ToolsView({
  onUsePrompt,
  onSelectPdf,
  onSelectImage,
  isUploadingPdf,
  isUploadingImage,
  extensionAccessEnabled,
  notice,
  onReturnToChat,
}) {
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const tools = [
    {
      icon: FileText,
      title: "PDF Q&A",
      description: "Upload and chat with any PDF",
    },
    {
      icon: PenLine,
      title: "Rewrite",
      description: "Improve, rephrase or change tone",
    },
    {
      icon: Languages,
      title: "Translate",
      description: "Translate and understand content",
    },
    {
      icon: ImageIcon,
      title: "Image Analysis",
      description: "Describe, analyze or extract text",
    },
    {
      icon: Mail,
      title: "Email Draft",
      description: "Write and improve emails with AI",
    },
  ];
  const toolPrompts = {
    "Image Analysis": IMAGE_ANALYSIS_PROMPT,
    "Email Draft": "Draft a professional email using my notes.",
  };
  const handleToolClick = (title) => {
    if (!extensionAccessEnabled) return;
    if (title === "PDF Q&A") {
      pdfInputRef.current?.click();
      return;
    }
    if (title === "Image Analysis") {
      imageInputRef.current?.click();
      return;
    }
    if (title === "Translate" || title === "Rewrite") {
      onUsePrompt("", title);
      return;
    }
    const suggestedPrompt = toolPrompts[title];
    if (suggestedPrompt) onUsePrompt(suggestedPrompt, title);
  };

  return (
    <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-1">
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onSelectPdf(file);
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onSelectImage(file);
        }}
      />
      <div className="mb-3 flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={onReturnToChat}
          title="Back to chat"
          aria-label="Back to chat"
          className="grid size-7 shrink-0 place-items-center rounded-lg text-[#a9a9ae] transition hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">Tools</h1>
      </div>
      {(!extensionAccessEnabled || notice) && (
        <p
          role="status"
          className="mb-2 rounded-lg border border-[#ffdc00]/20 bg-[#ffdc00]/[0.06] px-3 py-2 text-[11px] leading-4 text-[#d9d2a2]"
        >
          {!extensionAccessEnabled
            ? "Extension Access is off. Turn it on in Settings tab → Settings & Permissions → Extension Access."
            : notice}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {tools.map(({ icon: Icon, title, description }) => (
          <button
            key={title}
            type="button"
            title={title}
            onClick={() => handleToolClick(title)}
            disabled={
              (title === "PDF Q&A" && isUploadingPdf) ||
              (title === "Image Analysis" && isUploadingImage)
            }
            className="group flex min-h-[132px] min-w-0 flex-col items-start rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#19191b] to-[#111113] p-3.5 text-left transition hover:border-[#ffdc00]/35 hover:bg-[#1b1b1d] disabled:cursor-wait disabled:opacity-65"
          >
            <Icon
              size={27}
              strokeWidth={1.8}
              className="mb-2.5 text-[#ffdc00]"
            />
            <span className="flex w-full items-center gap-1 text-[13px] font-semibold text-[#f4f4f6]">
              <span className="min-w-0 flex-1">
                {title === "PDF Q&A" && isUploadingPdf
                  ? "Reading PDF…"
                  : title === "Image Analysis" && isUploadingImage
                    ? "Loading image…"
                    : title}
              </span>
              <ChevronRight
                size={17}
                className="shrink-0 text-[#c7c7cc] transition group-hover:translate-x-0.5"
              />
            </span>
            <span className="mt-1 text-[11px] leading-[1.45] text-[#a4a4ac]">
              {title === "PDF Q&A" && isUploadingPdf
                ? "Extracting document text"
                : title === "Image Analysis" && isUploadingImage
                  ? "Preparing image"
                  : description}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function SettingsView({ themePreference, onThemeChange, onReturnToChat }) {
  const [extensionAccess, setExtensionAccess] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState("");

  useEffect(() => {
    const chromeApi = globalThis.chrome;
    const storage = chromeApi?.storage?.local;
    if (!storage) {
      setSettingsNotice(
        "Settings are available in the installed Chrome extension.",
      );
      setIsLoadingSettings(false);
      return undefined;
    }

    let active = true;
    const loadSettings = async () => {
      try {
        const stored = await storage.get(EXTENSION_ACCESS_STORAGE_KEY);
        const chromePermissionGranted = await hasAllSitesHostPermission();
        const hasSavedAccessSetting =
          typeof stored[EXTENSION_ACCESS_STORAGE_KEY] === "boolean";
        // Existing installs inherit the access they already granted during
        // onboarding. New installs remain disabled until Chrome grants access.
        const shouldEnableAccess = hasSavedAccessSetting
          ? stored[EXTENSION_ACCESS_STORAGE_KEY] && chromePermissionGranted
          : chromePermissionGranted;

        if (active) setExtensionAccess(shouldEnableAccess);

        if (
          !hasSavedAccessSetting ||
          stored[EXTENSION_ACCESS_STORAGE_KEY] !== shouldEnableAccess
        ) {
          await storage.set({
            [EXTENSION_ACCESS_STORAGE_KEY]: shouldEnableAccess,
          });
        }
      } catch (error) {
        if (active) {
          setSettingsNotice(
            error?.message || "Could not load your extension settings.",
          );
        }
      } finally {
        if (active) setIsLoadingSettings(false);
      }
    };

    loadSettings();

    const handleStorageChange = (changes, areaName) => {
      if (areaName !== "local") return;
      if (changes[EXTENSION_ACCESS_STORAGE_KEY]) {
        setExtensionAccess(
          changes[EXTENSION_ACCESS_STORAGE_KEY].newValue === true,
        );
      }
    };

    chromeApi.storage.onChanged?.addListener(handleStorageChange);
    return () => {
      active = false;
      chromeApi.storage.onChanged?.removeListener(handleStorageChange);
    };
  }, []);

  const Toggle = ({ checked, onChange, label, disabled = false }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={disabled}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-5 w-10 shrink-0 rounded-full transition disabled:cursor-wait disabled:opacity-60 ${checked ? "bg-[#ffdc00]" : "bg-[#55555b]"}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );

  const handleExtensionAccessToggle = async () => {
    if (isLoadingSettings || isUpdatingAccess) return;
    const chromeApi = globalThis.chrome;
    if (!chromeApi?.permissions || !chromeApi?.storage?.local) {
      setSettingsNotice(
        "Website permissions can only be changed in the installed Chrome extension.",
      );
      return;
    }

    setSettingsNotice("");
    setIsUpdatingAccess(true);

    try {
      if (extensionAccess) {
        // Disable Lurph in storage first so page-reading checks fail immediately,
        // then revoke the optional all-sites host permission in Chrome.
        setExtensionAccess(false);
        await chromeApi.storage.local.set({
          [EXTENSION_ACCESS_STORAGE_KEY]: false,
        });
        await chromeApi.storage.local.remove("lurph_pending_selection");
        if (chromeApi.permissions.remove) {
          await chromeApi.permissions.remove({
            origins: [ALL_SITES_ORIGIN],
          });
        }
        setSettingsNotice("Lurph is disabled on all websites.");
        return;
      }

      // Call permissions.request directly from this click handler. Chrome
      // requires an explicit user gesture for optional host permission prompts.
      const request = chromeApi.permissions.request({
        origins: [ALL_SITES_ORIGIN],
      });
      const granted = await request;
      if (!granted) {
        setExtensionAccess(false);
        await chromeApi.storage.local.set({
          [EXTENSION_ACCESS_STORAGE_KEY]: false,
        });
        setSettingsNotice(
          "Website access was not granted. Lurph will remain disabled on websites.",
        );
        return;
      }

      await chromeApi.storage.local.set({
        [EXTENSION_ACCESS_STORAGE_KEY]: true,
      });
      setExtensionAccess(true);
      setSettingsNotice("Lurph is enabled on all websites.");
    } catch (error) {
      setSettingsNotice(
        error?.message || "Could not update website access. Please try again.",
      );
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const themeOptions = [
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "light", label: "Light", Icon: Sun },
    { value: "system", label: "System", Icon: Monitor },
  ];

  return (
    <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-1">
      <div className="mb-3 px-1">
        <div className="mb-1 flex items-center gap-2">
          <button
            type="button"
            onClick={onReturnToChat}
            title="Back to chat"
            aria-label="Back to chat"
            className="grid size-7 shrink-0 place-items-center rounded-lg text-[#a9a9ae] transition hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">
            Settings &amp; Appearance
          </h1>
        </div>
        <p className="mt-1 text-[11px] leading-[1.5] text-[#a4a4ac]">
          Manage website access and customize how Lurph looks.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-gradient-to-br from-[#19191b] to-[#111113]">
          <div className="flex items-center gap-3 p-3">
            <Globe size={23} className="shrink-0 text-[#d9d9de]" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-semibold">Extension Access</h2>
              <p className="mt-1 text-[10px] leading-4 text-[#9d9da5]">
                Allow Lurph to work on websites you visit.
              </p>
            </div>
          </div>
          <div className="flex justify-end border-t border-white/[0.07] px-3 py-2.5">
            <Toggle
              checked={extensionAccess}
              onChange={handleExtensionAccessToggle}
              label="Extension access"
              disabled={isLoadingSettings || isUpdatingAccess}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.10] bg-gradient-to-br from-[#19191b] to-[#111113] p-3">
          <div className="mb-2.5">
            <h2 className="text-xs font-semibold">Appearance</h2>
            <p className="mt-1 text-[10px] text-[#9d9da5]">
              Choose your preferred theme.
            </p>
          </div>
          <div
            className="grid grid-cols-3 gap-2"
            role="group"
            aria-label="Theme preference"
          >
            {themeOptions.map(({ value, label, Icon }) => {
              const selected = themePreference === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onThemeChange(value)}
                  aria-pressed={selected}
                  className={`theme-option flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-[10px] font-medium transition ${selected ? "border-[#ffdc00]/80 bg-[#ffdc00]/[0.07] text-[#ffdc00]" : "border-white/[0.08] bg-[#111113] text-[#b8b8c0] hover:border-white/[0.18] hover:text-white"}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {settingsNotice && (
          <p
            className="px-1 text-[10px] leading-4 text-[#c8c2a2]"
            role="status"
            aria-live="polite"
          >
            {settingsNotice}
          </p>
        )}
      </div>
    </section>
  );
}

function MainChatPanel({
  currentUser,
  onLogout,
  themePreference,
  onThemeChange,
}) {
  const [model, setModel] = useState("gpt-4o");
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activePromptTool, setActivePromptTool] = useState("");
  const [translateFromLanguage, setTranslateFromLanguage] =
    useState("Auto-detect");
  const [translateToLanguage, setTranslateToLanguage] = useState("English");
  const [rewriteTone, setRewriteTone] = useState("Professional");
  const [, setPageTitle] = useState("Current tab");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedFileText, setAttachedFileText] = useState("");
  const [imageAttachment, setImageAttachment] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pdfAttachment, setPdfAttachment] = useState(null);
  const [clearPdfAttachment, setClearPdfAttachment] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [selectedTextContext, setSelectedTextContext] = useState(null);
  const [clearSelectedTextContext, setClearSelectedTextContext] =
    useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");
  const [extensionAccessEnabled, setExtensionAccessEnabled] = useState(false);
  const [isExtensionAccessLoaded, setIsExtensionAccessLoaded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [openedFromHistory, setOpenedFromHistory] = useState(false);
  const [activeSection, setActiveSection] = useState("chat");
  const [historySearch, setHistorySearch] = useState("");
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [openConversationMenuId, setOpenConversationMenuId] = useState(null);
  const [renamingConversationId, setRenamingConversationId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [isHistoryMutation, setIsHistoryMutation] = useState(false);
  const messagesEndRef = useRef(null);
  const promptTextareaRef = useRef(null);
  const processedSelectionIdRef = useRef(null);
  const previousChatRef = useRef(null);
  const selectedModel =
    CHAT_MODELS.find((item) => item.key === model) || CHAT_MODELS[0];

  // Keep the chat composer in sync with the Settings master switch and
  // Chrome's optional all-sites permission. Access changes are reflected
  // immediately in this side panel without requiring a reload.
  useEffect(() => {
    const chromeApi = globalThis.chrome;
    const storage = chromeApi?.storage?.local;
    let active = true;

    const refreshAccess = async () => {
      const enabled = await canReadWebsiteContent();
      if (active) {
        setExtensionAccessEnabled(enabled);
        setIsExtensionAccessLoaded(true);
        if (!enabled) {
          setSelectedTextContext(null);
          setClearSelectedTextContext(false);
        }
      }
    };

    if (!storage) {
      setExtensionAccessEnabled(false);
      setIsExtensionAccessLoaded(true);
      return () => {
        active = false;
      };
    }

    const handleStorageChange = (changes, areaName) => {
      if (areaName !== "local" || !changes[EXTENSION_ACCESS_STORAGE_KEY])
        return;
      const nextValue = changes[EXTENSION_ACCESS_STORAGE_KEY].newValue === true;
      if (!nextValue) {
        // Fail closed synchronously as soon as the user switches access off.
        setExtensionAccessEnabled(false);
        setIsExtensionAccessLoaded(true);
        setSelectedTextContext(null);
        setClearSelectedTextContext(false);
        setStatus(
          "Extension Access is turned off. Enable it in Settings to use Lurph.",
        );
      } else {
        setIsExtensionAccessLoaded(false);
        refreshAccess();
        setStatus("");
      }
    };

    const handlePermissionAdded = () => {
      refreshAccess();
    };

    const handlePermissionRemoved = () => {
      refreshAccess();
    };

    // onChanged belongs to chrome.storage, not chrome.storage.local.
    // Listening on the correct event is essential for reflecting an ON toggle
    // immediately; the OFF path was also refreshed by permissions.onRemoved.
    chromeApi.storage.onChanged?.addListener(handleStorageChange);
    chromeApi.permissions?.onAdded?.addListener(handlePermissionAdded);
    chromeApi.permissions?.onRemoved?.addListener(handlePermissionRemoved);
    refreshAccess();

    return () => {
      active = false;
      chromeApi.storage.onChanged?.removeListener(handleStorageChange);
      chromeApi.permissions?.onAdded?.removeListener(handlePermissionAdded);
      chromeApi.permissions?.onRemoved?.removeListener(handlePermissionRemoved);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const tabs = globalThis.chrome?.tabs;
    if (!tabs?.query) return undefined;
    (async () => {
      try {
        const websiteAccessEnabled = await canReadWebsiteContent();
        if (!active || !websiteAccessEnabled) return;
        const [tab] = await tabs.query({
          active: true,
          lastFocusedWindow: true,
        });
        if (active && tab?.title) setPageTitle(tab.title);
      } catch {
        // Tab metadata is intentionally not read when website access is off.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const chromeApi = globalThis.chrome;
    const storage = chromeApi?.storage?.local;
    if (!storage) return undefined;

    const applySelection = (selection) => {
      if (
        !selection ||
        typeof selection.text !== "string" ||
        !selection.text.trim()
      )
        return;
      if (selection.expiresAt && Number(selection.expiresAt) < Date.now())
        return;
      const selectionId =
        selection.id ||
        `${selection.createdAt || ""}:${selection.text.slice(0, 80)}`;
      if (processedSelectionIdRef.current === selectionId) return;
      processedSelectionIdRef.current = selectionId;

      const nextContext = {
        text: selection.text.slice(0, MAX_SELECTED_TEXT_CHARS),
        title:
          typeof selection.title === "string"
            ? selection.title.slice(0, 300)
            : "",
        url:
          typeof selection.url === "string" ? selection.url.slice(0, 2000) : "",
      };

      // A context-menu selection always starts a fresh chat, never appends to
      // the conversation that happened to be open in the side panel.
      previousChatRef.current = null;
      setActiveSection("chat");
      setIsHistoryOpen(false);
      setOpenedFromHistory(false);
      setConversationId(null);
      setMessages([]);
      setPrompt("");
      setActivePromptTool("");
      setAttachedFileName("");
      setAttachedFileText("");
      setImageAttachment(null);
      setPdfAttachment(null);
      setClearPdfAttachment(false);
      setSelectedTextContext(nextContext);
      setClearSelectedTextContext(false);
      setPageTitle(nextContext.title || "Selected text");
      setStatus("Selected text attached. Ask Lurph a question about it.");
      setOpenConversationMenuId(null);
      setRenamingConversationId(null);
    };

    const consumePendingSelection = async () => {
      try {
        const stored = await storage.get(PENDING_SELECTION_STORAGE_KEY);
        const pending = stored?.[PENDING_SELECTION_STORAGE_KEY];
        if (!pending) return;
        applySelection(pending);
        await storage.remove(PENDING_SELECTION_STORAGE_KEY);
      } catch (error) {
        console.error("Could not load the selected text for Lurph:", error);
      }
    };

    const handleStorageChange = (changes, areaName) => {
      if (areaName !== "local") return;
      const pending = changes?.[PENDING_SELECTION_STORAGE_KEY]?.newValue;
      if (!pending) return;
      applySelection(pending);
      storage.remove(PENDING_SELECTION_STORAGE_KEY).catch(() => {});
    };

    chromeApi.storage.onChanged.addListener(handleStorageChange);
    consumePendingSelection();
    return () =>
      chromeApi.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending]);

  useEffect(() => {
    const textarea = promptTextareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxHeight = Math.max(
      140,
      Math.min(Math.round(window.innerHeight * 0.42), 320),
    );
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [prompt]);

  useEffect(() => {
    if (!isHistoryOpen) return undefined;
    let active = true;
    setIsLoadingHistory(true);
    const timeoutId = setTimeout(async () => {
      setHistoryError("");
      try {
        const result = await getConversations(historySearch);
        if (active) setHistoryItems(result.conversations || []);
      } catch (error) {
        if (active) {
          setHistoryError(
            error.response?.data?.message ||
              "Could not load your conversations. Please try again.",
          );
        }
      } finally {
        if (active) setIsLoadingHistory(false);
      }
    }, 220);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [isHistoryOpen, historySearch]);

  const openSection = (section, { captureCurrentChat = false } = {}) => {
    if (
      section === "tools" &&
      captureCurrentChat &&
      activeSection === "chat" &&
      !isHistoryOpen &&
      !activePromptTool
    ) {
      const hasCurrentChat =
        messages.length > 0 ||
        Boolean(conversationId) ||
        Boolean(prompt.trim()) ||
        Boolean(activePromptTool) ||
        Boolean(selectedTextContext) ||
        Boolean(imageAttachment) ||
        Boolean(pdfAttachment) ||
        Boolean(attachedFileName);

      previousChatRef.current = hasCurrentChat
        ? {
            conversationId,
            messages,
            prompt,
            activePromptTool,
            translateFromLanguage,
            translateToLanguage,
            rewriteTone,
            pageTitle,
            attachedFileName,
            attachedFileText,
            imageAttachment,
            pdfAttachment,
            clearPdfAttachment,
            selectedTextContext,
            clearSelectedTextContext,
            openedFromHistory,
            status,
            model,
          }
        : null;
    }

    // If the user simply closes the Tools section without choosing a tool,
    // the original chat is still in state and no return snapshot is needed.
    if (section === "chat" && activeSection === "tools") {
      previousChatRef.current = null;
    }

    setActiveSection(section);
    if (section !== "chat") setOpenedFromHistory(false);
    setIsHistoryOpen(false);
    setIsModelMenuOpen(false);
    setIsMoreMenuOpen(false);
  };

  // All tab-level back buttons return to the main chat. If a regular chat
  // was saved before opening a tool, restore it. Otherwise, leave tool-specific
  // chat state behind and show the main chat home screen.
  const returnToMainChat = () => {
    if (previousChatRef.current) {
      restorePreviousChat();
      return;
    }

    if (activePromptTool) {
      handleNewChat();
      return;
    }

    setActiveSection("chat");
    setIsHistoryOpen(false);
    setIsModelMenuOpen(false);
    setIsMoreMenuOpen(false);
    setOpenConversationMenuId(null);
  };

  const restorePreviousChat = () => {
    const previousChat = previousChatRef.current;
    if (!previousChat) return false;

    setConversationId(previousChat.conversationId);
    setMessages(previousChat.messages);
    setPrompt(previousChat.prompt);
    setActivePromptTool(previousChat.activePromptTool);
    setTranslateFromLanguage(previousChat.translateFromLanguage);
    setTranslateToLanguage(previousChat.translateToLanguage);
    setRewriteTone(previousChat.rewriteTone);
    setPageTitle(previousChat.pageTitle);
    setAttachedFileName(previousChat.attachedFileName);
    setAttachedFileText(previousChat.attachedFileText);
    setImageAttachment(previousChat.imageAttachment);
    setPdfAttachment(previousChat.pdfAttachment);
    setClearPdfAttachment(previousChat.clearPdfAttachment);
    setSelectedTextContext(previousChat.selectedTextContext);
    setClearSelectedTextContext(previousChat.clearSelectedTextContext);
    setOpenedFromHistory(previousChat.openedFromHistory);
    setStatus(previousChat.status);
    setModel(previousChat.model);
    setActiveSection("chat");
    setIsHistoryOpen(false);
    setIsModelMenuOpen(false);
    setIsMoreMenuOpen(false);
    setOpenConversationMenuId(null);
    setRenamingConversationId(null);
    previousChatRef.current = null;
    return true;
  };

  const handleQuickAction = (suggestedPrompt, toolName = "") => {
    if (!extensionAccessEnabled) {
      setStatus(
        "Extension Access is turned off. Enable it in Settings to use Lurph.",
      );
      return;
    }

    // Every tool starts a fresh conversation instead of reusing the chat
    // currently open (including a conversation opened from History).
    setActiveSection("chat");
    setIsHistoryOpen(false);
    setOpenedFromHistory(false);
    setConversationId(null);
    setMessages([]);
    setAttachedFileName("");
    setAttachedFileText("");
    setImageAttachment(null);
    setPdfAttachment(null);
    setClearPdfAttachment(false);
    setSelectedTextContext(null);
    setClearSelectedTextContext(false);
    setOpenConversationMenuId(null);
    setRenamingConversationId(null);

    setPrompt(
      toolName === "Translate" || toolName === "Rewrite" ? "" : suggestedPrompt,
    );
    setActivePromptTool(toolName || "");
    if (toolName === "Rewrite") setRewriteTone("Professional");
    setStatus("");
  };

  const handleNewChat = (preservePreviousChat = false) => {
    if (!preservePreviousChat) previousChatRef.current = null;
    setActiveSection("chat");
    setOpenedFromHistory(false);
    setConversationId(null);
    setMessages([]);
    setPrompt("");
    setActivePromptTool("");
    setRewriteTone("Professional");
    setStatus("");
    setAttachedFileName("");
    setAttachedFileText("");
    setImageAttachment(null);
    setPdfAttachment(null);
    setClearPdfAttachment(false);
    setSelectedTextContext(null);
    setClearSelectedTextContext(false);
    setIsHistoryOpen(false);
    setOpenConversationMenuId(null);
    setRenamingConversationId(null);
  };

  const handleImageSelect = async (file, startNewChat = false) => {
    if (!file) return;
    if (!(await canReadWebsiteContent())) {
      setExtensionAccessEnabled(false);
      setStatus(
        "Extension Access is turned off. Enable it in Settings to use Lurph.",
      );
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    const extensionMime =
      {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        jfif: "image/jpeg",
        pjpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
      }[extension] || "";
    const browserMime = (file.type || "").toLowerCase().split(";")[0];
    // Some Windows file associations report an empty or non-standard MIME type.
    // Prefer a recognized browser MIME type, then fall back to the file extension.
    const inferredMime = IMAGE_MIME_TYPES.has(browserMime)
      ? browserMime
      : extensionMime;
    if (!IMAGE_MIME_TYPES.has(inferredMime)) {
      setStatus("Please choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setStatus(
        "Images must be 2 MB or smaller. Please choose a smaller image.",
      );
      return;
    }

    setIsUploadingImage(true);
    setStatus("Preparing your image…");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (!dataUrl.startsWith(`data:${inferredMime};base64,`)) {
        throw new Error(
          "The selected image could not be read in a supported format.",
        );
      }
      if (startNewChat) handleNewChat(true);
      setImageAttachment({ name: file.name, mimeType: inferredMime, dataUrl });
      setActivePromptTool("Image Analysis");
      setPrompt(IMAGE_ANALYSIS_PROMPT);
      setPageTitle(file.name);
      setActiveSection("chat");
      setStatus(
        "Image attached. Ask a question or send the suggested prompt to analyze it.",
      );
    } catch (error) {
      setStatus(
        error.message || "Could not read this image. Please try another file.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePdfSelect = async (file) => {
    if (!file) return;
    if (!(await canReadWebsiteContent())) {
      setExtensionAccessEnabled(false);
      setStatus(
        "Extension Access is turned off. Enable it in Settings to use Lurph.",
      );
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setStatus("Please choose a PDF file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setStatus("PDF uploads must be 3 MB or smaller.");
      return;
    }

    setIsUploadingPdf(true);
    setStatus("Extracting text from your PDF…");
    try {
      const extracted = await extractPdf(file);
      handleNewChat(true);
      setPdfAttachment(extracted);
      setActivePromptTool("PDF Q&A");
      setClearPdfAttachment(false);
      setPageTitle(extracted.name || file.name);
      setPrompt("Summarize this PDF and answer my questions.");
      setStatus(
        extracted.truncated
          ? `PDF attached (${extracted.pageCount || "unknown"} pages). The extracted text was shortened to fit the context limit.`
          : `PDF attached successfully (${extracted.pageCount || "unknown"} pages). Ask a question to begin.`,
      );
      setActiveSection("chat");
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          error.message ||
          "Could not read this PDF. Please try another file.",
      );
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleLoadConversation = async (item) => {
    previousChatRef.current = null;
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const result = await getConversation(item.id);
      const conversation = result.conversation;
      setConversationId(conversation.id);
      const legacyConversationTool = conversation.pdfAttachment?.name
        ? "pdf-qa"
        : "";
      const loadedMessages = (conversation.messages || []).map((message) => ({
        id: message.id || createChatMessageId(),
        role: message.role,
        content: message.content,
        model: message.providerModel || message.model || "",
        tool: message.tool || legacyConversationTool,
        translationFrom: message.translationFrom || "",
        translationTo: message.translationTo || "",
        rewriteTone: message.rewriteTone || "",
      }));
      setMessages(loadedMessages);
      setOpenedFromHistory(true);
      if (conversation.lastModel) setModel(conversation.lastModel);
      if (conversation.pageTitle) setPageTitle(conversation.pageTitle);
      else if (conversation.pdfAttachment?.name)
        setPageTitle(conversation.pdfAttachment.name);
      setSelectedTextContext(
        conversation.selectedTextContext?.text
          ? conversation.selectedTextContext
          : null,
      );
      setClearSelectedTextContext(false);
      setPdfAttachment(
        conversation.pdfAttachment
          ? { ...conversation.pdfAttachment, text: "" }
          : null,
      );
      const lastToolMessage = [...loadedMessages]
        .reverse()
        .find((message) => TOOL_TITLES_BY_MARKER[message.tool]);
      setActivePromptTool(
        lastToolMessage ? TOOL_TITLES_BY_MARKER[lastToolMessage.tool] : "",
      );
      const lastTranslationMessage = [...loadedMessages]
        .reverse()
        .find((message) => message.tool === "translate");
      if (lastTranslationMessage) {
        setTranslateFromLanguage(
          lastTranslationMessage.translationFrom || "Auto-detect",
        );
        setTranslateToLanguage(
          lastTranslationMessage.translationTo || "English",
        );
      }
      const lastRewriteMessage = [...loadedMessages]
        .reverse()
        .find((message) => message.tool === "rewrite");
      setRewriteTone(lastRewriteMessage?.rewriteTone || "Professional");
      setClearPdfAttachment(false);
      setPrompt("");
      setStatus("");
      setAttachedFileName("");
      setAttachedFileText("");
      setImageAttachment(null);
      setIsHistoryOpen(false);
      setOpenConversationMenuId(null);
    } catch (error) {
      setHistoryError(
        error.response?.data?.message ||
          "Could not open this conversation. Please try again.",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startRename = (item) => {
    setRenamingConversationId(item.id);
    setRenameDraft(item.title || "");
    setOpenConversationMenuId(null);
  };

  const saveRename = async (event, item) => {
    event.preventDefault();
    const title = renameDraft.trim();
    if (!title) {
      setHistoryError("A conversation title cannot be empty.");
      return;
    }
    setIsHistoryMutation(true);
    setHistoryError("");
    try {
      const result = await renameConversation(item.id, title);
      setHistoryItems((items) =>
        items.map((conversation) =>
          conversation.id === item.id
            ? { ...conversation, ...result.conversation }
            : conversation,
        ),
      );
      setRenamingConversationId(null);
      setRenameDraft("");
    } catch (error) {
      setHistoryError(
        error.response?.data?.message || "Could not rename this conversation.",
      );
    } finally {
      setIsHistoryMutation(false);
    }
  };

  const handleDeleteConversation = async (item) => {
    const confirmed =
      typeof globalThis.confirm === "function"
        ? globalThis.confirm(
            `Delete “${item.title}”? This conversation will be permanently removed.`,
          )
        : true;
    if (!confirmed) return;

    setIsHistoryMutation(true);
    setHistoryError("");
    setOpenConversationMenuId(null);
    try {
      await deleteConversation(item.id);
      setHistoryItems((items) =>
        items.filter((conversation) => conversation.id !== item.id),
      );
      if (conversationId === item.id) {
        setConversationId(null);
        setMessages([]);
        setPrompt("");
        setAttachedFileName("");
        setAttachedFileText("");
        setImageAttachment(null);
        setPdfAttachment(null);
        setClearPdfAttachment(false);
        setSelectedTextContext(null);
        setClearSelectedTextContext(false);
        setStatus("");
      }
    } catch (error) {
      setHistoryError(
        error.response?.data?.message || "Could not delete this conversation.",
      );
    } finally {
      setIsHistoryMutation(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isSending) return;

    // Re-check the stored master switch and live Chrome grant at submit time;
    // disabling the composer is UI feedback, not the security boundary.
    const hasWebsiteAccess = await canReadWebsiteContent();
    if (!hasWebsiteAccess) {
      setExtensionAccessEnabled(false);
      setIsExtensionAccessLoaded(true);
      setStatus(
        "Extension Access is turned off. Enable it in Settings to use Lurph.",
      );
      return;
    }

    const submittedTool = TOOL_MARKERS[activePromptTool] || "";
    const translation =
      activePromptTool === "Translate"
        ? {
            fromLanguage: translateFromLanguage,
            toLanguage: translateToLanguage,
          }
        : undefined;
    const rewrite =
      activePromptTool === "Rewrite" ? { tone: rewriteTone } : undefined;
    const userMessage = {
      id: createChatMessageId(),
      role: "user",
      content: trimmedPrompt,
      tool: submittedTool,
      translationFrom: translation?.fromLanguage || "",
      translationTo: translation?.toLanguage || "",
      rewriteTone: rewrite?.tone || "",
    };
    const nextMessages = [...messages, userMessage];
    const isFullPageSummary = activePromptTool === "Summarize this page";
    setIsSending(true);
    setStatus(isFullPageSummary ? "Reading the current webpage…" : "");

    try {
      if (selectedTextContext && !(await canReadWebsiteContent())) {
        setStatus(
          "Enable Extension Access in Settings and grant website permission before asking Lurph about selected webpage text.",
        );
        return;
      }

      const activePageContext =
        activePromptTool === "Translate" ||
        selectedTextContext ||
        pdfAttachment ||
        imageAttachment
          ? null
          : await readActivePageContext({
              maxChars: isFullPageSummary
                ? MAX_SUMMARIZE_PAGE_TEXT_CHARS
                : MAX_PAGE_TEXT_CHARS,
            });
      const pageContext = selectedTextContext
        ? {
            title: selectedTextContext.title || activePageContext?.title || "",
            url: selectedTextContext.url || activePageContext?.url || "",
            text: "",
          }
        : pdfAttachment
          ? { title: pdfAttachment.name || "Uploaded PDF", url: "", text: "" }
          : imageAttachment
            ? {
                title: imageAttachment.name || "Uploaded image",
                url: "",
                text: "",
              }
            : activePageContext;

      if (isFullPageSummary && !pageContext?.text?.trim()) {
        const websiteAccessEnabled = await canReadWebsiteContent();
        setStatus(
          websiteAccessEnabled
            ? "Lurph could not read this webpage. Open a regular website and try again. Chrome internal pages and some protected pages cannot be read."
            : "Enable Extension Access in Settings and grant website permission before summarizing a webpage.",
        );
        return;
      }

      if (pageContext?.title) setPageTitle(pageContext.title);
      setMessages(nextMessages);
      setPrompt("");
      setStatus("");

      const result = await sendChatMessage({
        conversationId,
        model,
        messages: nextMessages
          .slice(-16)
          .map(({ role, content }) => ({ role, content })),
        pageContext,
        selectedTextContext: selectedTextContext || undefined,
        clearSelectedTextContext,
        attachment: attachedFileText
          ? { name: attachedFileName, text: attachedFileText }
          : undefined,
        pdfAttachment: pdfAttachment?.text
          ? {
              name: pdfAttachment.name,
              pageCount: pdfAttachment.pageCount,
              text: pdfAttachment.text,
            }
          : undefined,
        clearPdfAttachment,
        imageAttachment: imageAttachment
          ? {
              name: imageAttachment.name,
              mimeType: imageAttachment.mimeType,
              dataUrl: imageAttachment.dataUrl,
            }
          : undefined,
        tool: submittedTool,
        translation,
        rewrite,
        webSearchEnabled: false,
      });

      if (result.conversationId) setConversationId(result.conversationId);
      setClearSelectedTextContext(false);
      setClearPdfAttachment(false);
      if (result.historySaved && pdfAttachment?.text) {
        setPdfAttachment((current) =>
          current ? { ...current, text: "" } : current,
        );
      }
      setMessages((current) => [
        ...current,
        {
          id: createChatMessageId(),
          role: "assistant",
          content: result.reply,
          model: result.providerModel || selectedModel.label,
          tool: result.tool || submittedTool,
          translationFrom: translation?.fromLanguage || "",
          translationTo: translation?.toLanguage || "",
          rewriteTone: rewrite?.tone || "",
        },
      ]);
      if (result.historySaved === false) {
        setStatus(
          result.historyWarning ||
            "Your response was generated but could not be saved to history.",
        );
      } else if (result.imageAttachmentStored === false) {
        setStatus(
          "Image analyzed. It remains available for follow-up questions in this open chat, but the image file is not saved to chat history. Re-upload it if you reopen this conversation.",
        );
      } else if (isFullPageSummary && pageContext?.truncated) {
        setStatus(
          `This page contains more text than Lurph can send in one request. The summary covers the first ${MAX_SUMMARIZE_PAGE_TEXT_CHARS.toLocaleString()} characters of readable page content.`,
        );
      }
      setAttachedFileName("");
      setAttachedFileText("");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "Lurph took too long to respond. Please try again."
          : error.code === "ERR_NETWORK"
            ? "Unable to reach the Lurph server. Check your connection and API deployment."
            : error.message ||
              "Something went wrong while generating the response.");
      setPrompt((current) => current || trimmedPrompt);
      setStatus(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttach = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!(await canReadWebsiteContent())) {
      setExtensionAccessEnabled(false);
      setStatus(
        "Extension Access is turned off. Enable it in Settings to use Lurph.",
      );
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    const isImage =
      file.type.toLowerCase().startsWith("image/") ||
      ["jpg", "jpeg", "jfif", "pjpeg", "png", "webp", "gif"].includes(
        extension,
      );
    if (isImage) {
      await handleImageSelect(file);
      return;
    }
    if (!["txt", "md", "csv", "json"].includes(extension)) {
      setStatus(
        "Attach an image (JPEG, PNG, WebP, or GIF) or a TXT, MD, CSV, or JSON file.",
      );
      return;
    }
    if (file.size > 200 * 1024) {
      setStatus("Please attach a text file smaller than 200 KB.");
      return;
    }

    try {
      const text = (await file.text()).slice(0, MAX_ATTACHMENT_TEXT_CHARS);
      setAttachedFileName(file.name);
      setAttachedFileText(text);
      setStatus("");
    } catch {
      setStatus(
        "Could not read this attachment. Please try another text file.",
      );
    }
  };

  const groupedHistory = (() => {
    const sorted = [...historyItems].sort(
      (a, b) =>
        new Date(b.lastMessageAt || b.updatedAt).getTime() -
        new Date(a.lastMessageAt || a.updatedAt).getTime(),
    );
    const labels = ["Today", "Yesterday", "Last 7 days", "Older"];
    const groups = labels.map((label) => ({ label, items: [] }));
    for (const item of sorted) {
      const group = getConversationGroup(
        item.lastMessageAt || item.updatedAt || item.createdAt,
      );
      groups.find((entry) => entry.label === group)?.items.push(item);
    }
    return groups.filter((group) => group.items.length > 0);
  })();

  return (
    <main className="lurph-chat-shell flex h-dvh min-h-[480px] w-full flex-col overflow-hidden bg-[#0a0a0b] text-[#f5f5f7]">
      <header className="flex shrink-0 items-center gap-2 px-4 pb-3 pt-4">
        <div className="relative min-w-0 w-[min(44%,180px)] shrink-0">
          <button
            type="button"
            onClick={() => setIsModelMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={isModelMenuOpen}
            title="Choose AI model"
            className="flex h-10 w-full min-w-0 max-w-none items-center gap-2 rounded-xl border border-white/[0.12] bg-[#151517] px-3 text-sm transition hover:bg-[#1c1c1f]"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#252b50] text-[10px] font-bold text-[#d8ddff]">
              ✦
            </span>
            <span className="min-w-0 flex-1 truncate text-left">
              {selectedModel.label}
            </span>
            <ChevronDown size={15} className="shrink-0 text-[#a4a4aa]" />
          </button>
          {isModelMenuOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-12 z-40 w-56 rounded-xl border border-white/[0.12] bg-[#19191c] p-1.5 shadow-2xl"
            >
              {CHAT_MODELS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  aria-selected={model === item.key}
                  onClick={() => {
                    setModel(item.key);
                    setIsModelMenuOpen(false);
                  }}
                  className={`model-menu-option flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${model === item.key ? "text-[#ffdc00]" : "text-[#dfdfe3]"}`}
                >
                  {item.label}
                  {model === item.key && (
                    <Check size={15} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-5 items-center justify-items-center whitespace-nowrap">
          <button
            type="button"
            onClick={() =>
              activeSection === "tools"
                ? openSection("chat")
                : openSection("tools", { captureCurrentChat: true })
            }
            title="Tools"
            aria-label="Tools"
            aria-pressed={activeSection === "tools"}
            className={`grid size-8 shrink-0 place-items-center rounded-lg transition hover:bg-white/[0.07] ${activeSection === "tools" ? "bg-[#ffdc00]/[0.12] text-[#ffdc00]" : "text-[#a9a9ae] hover:text-white"}`}
          >
            <Wrench size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              openSection(activeSection === "settings" ? "chat" : "settings")
            }
            title="Settings"
            aria-label="Settings"
            aria-pressed={activeSection === "settings"}
            className={`grid size-8 shrink-0 place-items-center rounded-lg transition hover:bg-white/[0.07] ${activeSection === "settings" ? "bg-[#ffdc00]/[0.12] text-[#ffdc00]" : "text-[#a9a9ae] hover:text-white"}`}
          >
            <Settings size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSection("chat");
              setIsHistoryOpen((open) => !open);
              setHistoryError("");
              setOpenConversationMenuId(null);
              setIsMoreMenuOpen(false);
              setIsModelMenuOpen(false);
            }}
            title="History"
            aria-label="History"
            aria-pressed={isHistoryOpen}
            className={`grid size-8 shrink-0 place-items-center rounded-lg transition hover:bg-white/[0.07] ${isHistoryOpen ? "bg-[#ffdc00]/[0.12] text-[#ffdc00]" : "text-[#a9a9ae] hover:text-white"}`}
          >
            <History size={19} />
          </button>
          <button
            type="button"
            onClick={handleNewChat}
            title="New chat"
            aria-label="New chat"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-[#a9a9ae] transition hover:bg-white/[0.07] hover:text-white"
          >
            <Plus size={21} />
          </button>
          <div className="relative grid size-8 place-items-center">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((open) => !open)}
              title="More options"
              aria-label="More options"
              aria-expanded={isMoreMenuOpen}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-[#a9a9ae] transition hover:bg-white/[0.07] hover:text-white"
            >
              <MoreHorizontal size={20} />
            </button>
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-9 z-40 w-52 rounded-xl border border-white/[0.12] bg-[#19191c] p-1.5 shadow-2xl">
                <div className="border-b border-white/[0.08] px-3 py-2">
                  <p className="truncate text-sm font-semibold">
                    {currentUser?.name || "Lurph user"}
                  </p>
                  <p className="truncate text-xs text-[#96969d]">
                    {currentUser?.email || ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#ff9b9b] hover:bg-white/[0.06]"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {activeSection === "chat" &&
        !isHistoryOpen &&
        (activePromptTool || openedFromHistory) && (
          <div className="shrink-0 px-4 pb-2">
            <button
              type="button"
              onClick={() => {
                if (activePromptTool) {
                  returnToMainChat();
                } else if (openedFromHistory) {
                  setIsHistoryOpen(true);
                  setHistoryError("");
                  setOpenConversationMenuId(null);
                }
              }}
              title={activePromptTool ? "Back to chat" : "Back to History"}
              className="flex h-8 max-w-full items-center gap-2 rounded-md px-1 text-left text-sm text-[#d7d7dc] transition hover:text-white"
            >
              <ArrowLeft size={17} className="shrink-0 text-[#b8b8c0]" />
              <span className="truncate font-medium">
                {activePromptTool ? "Back to chat" : "Back to History"}
              </span>
            </button>
          </div>
        )}

      {activeSection === "chat" &&
        !isHistoryOpen &&
        activePromptTool === "Translate" && (
          <div className="shrink-0 px-3 pb-2">
            <div className="rounded-xl border border-white/[0.10] bg-gradient-to-br from-[#171b22] to-[#111318] p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)] items-end gap-2">
                <label className="min-w-0">
                  <span className="mb-1.5 block text-[11px] font-medium text-[#c8cbd2]">
                    From
                  </span>
                  <span className="relative block">
                    <select
                      value={translateFromLanguage}
                      onChange={(event) =>
                        setTranslateFromLanguage(event.target.value)
                      }
                      aria-label="Translate from language"
                      className="h-10 w-full appearance-none rounded-lg border border-white/[0.10] bg-[#1b222c] px-3 pr-8 text-xs text-[#f0f1f4] outline-none transition focus:border-[#ffdc00]/60"
                    >
                      {TRANSLATION_LANGUAGES.map((language) => (
                        <option key={language} value={language}>
                          {language === "Auto-detect" ? "Select" : language}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a9afb9]"
                    />
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    if (translateFromLanguage === "Auto-detect") return;
                    setTranslateFromLanguage(translateToLanguage);
                    setTranslateToLanguage(translateFromLanguage);
                  }}
                  disabled={translateFromLanguage === "Auto-detect"}
                  title={
                    translateFromLanguage === "Auto-detect"
                      ? "Choose a source language to swap"
                      : "Swap languages"
                  }
                  aria-label="Swap translation languages"
                  className="mb-1 grid size-[34px] place-items-center rounded-lg text-[#b9c0cb] transition hover:bg-white/[0.07] hover:text-[#ffdc00] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowLeftRight size={18} />
                </button>

                <label className="min-w-0">
                  <span className="mb-1.5 block text-[11px] font-medium text-[#c8cbd2]">
                    To
                  </span>
                  <span className="relative block">
                    <select
                      value={translateToLanguage}
                      onChange={(event) =>
                        setTranslateToLanguage(event.target.value)
                      }
                      aria-label="Translate to language"
                      className="h-10 w-full appearance-none rounded-lg border border-white/[0.10] bg-[#1b222c] px-3 pr-8 text-xs text-[#f0f1f4] outline-none transition focus:border-[#ffdc00]/60"
                    >
                      {TRANSLATION_LANGUAGES.filter(
                        (language) => language !== "Auto-detect",
                      ).map((language) => (
                        <option key={language} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a9afb9]"
                    />
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

      {activeSection === "chat" &&
        !isHistoryOpen &&
        activePromptTool === "Rewrite" && (
          <div className="shrink-0 px-3 pb-2">
            <div className="rounded-xl border border-white/[0.10] bg-gradient-to-br from-[#171b22] to-[#111318] p-3">
              <label className="flex w-full items-center justify-between gap-3">
                <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-[#d5d7dc]">
                  <PenLine size={15} className="text-[#c8cbd2]" />
                  Tone
                </span>
                <span className="relative block w-[220px] max-w-[65%] shrink-0">
                  <select
                    value={rewriteTone}
                    onChange={(event) => setRewriteTone(event.target.value)}
                    aria-label="Rewrite tone"
                    className="h-10 w-full appearance-none rounded-lg border border-white/[0.10] bg-[#1b222c] px-3 pr-8 text-xs text-[#f0f1f4] outline-none transition focus:border-[#ffdc00]/60"
                  >
                    {REWRITE_TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a9afb9]"
                  />
                </span>
              </label>
            </div>
          </div>
        )}

      {isHistoryOpen ? (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3">
          <div className="flex shrink-0 items-center gap-2 pb-2">
            <button
              type="button"
              onClick={returnToMainChat}
              title="Back to chat"
              aria-label="Back to chat"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-[#a9a9ae] transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-base font-semibold tracking-tight">History</h1>
          </div>
          <div className="shrink-0 pb-3">
            <div className="relative w-full">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#85858c]"
              />
              <input
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search conversations..."
                aria-label="Search conversations"
                className="h-10 w-full rounded-xl border border-white/[0.12] bg-[#151517] pl-9 pr-3 text-sm text-[#f2f2f4] outline-none placeholder:text-[#898991] focus:border-[#ffdc00]/50"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {isLoadingHistory && historyItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#92929a]">
                Loading conversations…
              </p>
            ) : historyError ? (
              <p
                className="rounded-lg border border-[#ffdc00]/20 bg-[#ffdc00]/[0.06] px-3 py-2 text-xs text-[#ded29a]"
                role="alert"
              >
                {historyError}
              </p>
            ) : groupedHistory.length === 0 ? (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center px-5 text-center">
                <History size={28} className="mb-3 text-[#777780]" />
                <p className="text-sm font-medium text-[#dedee2]">
                  {historySearch
                    ? "No matching conversations"
                    : "No conversations yet"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#85858d]">
                  Your chats will appear here automatically after you send a
                  message.
                </p>
              </div>
            ) : (
              <div className="space-y-5 pb-2">
                {groupedHistory.map((group) => (
                  <section key={group.label}>
                    <h2 className="mb-2 px-0.5 text-sm font-semibold text-[#a8a8ae]">
                      {group.label}
                    </h2>
                    <div className="space-y-1.5">
                      {group.items.map((item) => (
                        <article
                          key={item.id}
                          className={`relative rounded-xl border transition ${conversationId === item.id ? "border-[#ffdc00]/45 bg-[#ffdc00]/[0.07]" : "border-transparent bg-transparent hover:border-white/[0.08] hover:bg-white/[0.035]"}`}
                        >
                          {renamingConversationId === item.id ? (
                            <form
                              onSubmit={(event) => saveRename(event, item)}
                              className="flex items-center gap-2 p-2.5"
                            >
                              <input
                                autoFocus
                                maxLength={120}
                                value={renameDraft}
                                onChange={(event) =>
                                  setRenameDraft(event.target.value)
                                }
                                className="h-9 min-w-0 flex-1 rounded-lg border border-[#ffdc00]/40 bg-[#0e0e10] px-2.5 text-sm text-white outline-none focus:border-[#ffdc00]"
                                aria-label="New conversation title"
                              />
                              <button
                                type="submit"
                                disabled={
                                  isHistoryMutation || !renameDraft.trim()
                                }
                                title="Save title"
                                className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#ffdc00] text-black disabled:opacity-50"
                              >
                                <Check size={17} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingConversationId(null);
                                  setRenameDraft("");
                                }}
                                title="Cancel rename"
                                className="grid size-9 shrink-0 place-items-center rounded-lg text-[#a5a5ad] hover:bg-white/[0.07]"
                              >
                                <X size={17} />
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center gap-1.5 p-2">
                              <button
                                type="button"
                                onClick={() => handleLoadConversation(item)}
                                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left"
                                title={`Open ${item.title}`}
                              >
                                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.06] bg-[#171719] text-[#ffdc00]">
                                  <FileText size={18} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex min-w-0 items-center gap-2">
                                    <span className="history-conversation-title min-w-0 flex-1 truncate text-[13px] font-medium text-[#f0f0f2]">
                                      {item.title}
                                    </span>
                                    <time className="shrink-0 text-[10px] text-[#888890]">
                                      {formatConversationDate(
                                        item.lastMessageAt || item.updatedAt,
                                      )}
                                    </time>
                                  </span>
                                  <span className="mt-0.5 block truncate text-[11px] text-[#98989f]">
                                    {item.preview || "No preview available"}
                                  </span>
                                </span>
                              </button>
                              <div className="relative shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenConversationMenuId((id) =>
                                      id === item.id ? null : item.id,
                                    )
                                  }
                                  aria-label={`Actions for ${item.title}`}
                                  aria-expanded={
                                    openConversationMenuId === item.id
                                  }
                                  title="Conversation actions"
                                  className="grid size-8 place-items-center rounded-lg text-[#8d8d95] hover:bg-white/[0.07] hover:text-white"
                                >
                                  <MoreHorizontal size={18} />
                                </button>
                                {openConversationMenuId === item.id && (
                                  <div className="absolute right-0 top-9 z-50 w-36 rounded-xl border border-white/[0.12] bg-[#1a1a1d] p-1.5 shadow-2xl">
                                    <button
                                      type="button"
                                      onClick={() => startRename(item)}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#e6e6e9] hover:bg-white/[0.07]"
                                    >
                                      <Pencil size={14} /> Rename
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteConversation(item)
                                      }
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-[#ff8888] hover:bg-white/[0.07]"
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
            {isHistoryMutation && (
              <p className="py-2 text-center text-[11px] text-[#888890]">
                Updating conversation…
              </p>
            )}
          </div>
        </section>
      ) : activeSection === "tools" ? (
        <ToolsView
          onUsePrompt={(suggestedPrompt, toolName) => {
            handleQuickAction(suggestedPrompt, toolName);
          }}
          onReturnToChat={returnToMainChat}
          onSelectPdf={handlePdfSelect}
          onSelectImage={(file) => handleImageSelect(file, true)}
          isUploadingPdf={isUploadingPdf}
          isUploadingImage={isUploadingImage}
          extensionAccessEnabled={
            extensionAccessEnabled && isExtensionAccessLoaded
          }
          notice={
            isUploadingPdf
              ? "Reading your PDF…"
              : isUploadingImage
                ? "Preparing image…"
                : activeSection === "tools"
                  ? status
                  : ""
          }
        />
      ) : activeSection === "settings" ? (
        <SettingsView
          themePreference={themePreference}
          onThemeChange={onThemeChange}
          onReturnToChat={returnToMainChat}
        />
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
            {messages.length === 0 && activePromptTool ? (
              <div className="min-h-full" aria-hidden="true" />
            ) : messages.length === 0 ? (
              <div className="flex min-h-full flex-col justify-center py-1">
                <div className="mx-auto mb-2 grid size-11 place-items-center rounded-full border border-[#ffdc00]/55 bg-[#ffdc00]/[0.07] text-[#ffdc00] shadow-[0_0_40px_rgba(255,220,0,.08)]">
                  <Sparkles size={21} />
                </div>
                <h1 className="text-center text-[24px] font-bold leading-8 tracking-tight">
                  Hi there!
                </h1>
                <p className="mx-auto mt-0.5 max-w-[260px] text-center text-[12.5px] leading-5 text-[#a9a9b1]">
                  Ask, summarize, write, or research anything on this page.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map(
                    ({
                      icon: Icon,
                      title,
                      detail,
                      prompt: suggestedPrompt,
                    }) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() =>
                          handleQuickAction(
                            suggestedPrompt,
                            title === "Summarize" ? "Summarize this page" : "",
                          )
                        }
                        className={`group flex min-h-[60px] min-w-0 items-center gap-2 rounded-xl border border-white/[0.12] bg-gradient-to-br from-[#19191b] to-[#111113] p-2.5 text-left transition hover:border-[#ffdc00]/45 hover:bg-[#1b1b1b] ${title === "Find key" ? "col-span-2 mx-auto w-[calc(50%-4px)]" : ""}`}
                      >
                        <Icon
                          size={20}
                          className="shrink-0 text-[#ffdc00]"
                          strokeWidth={1.7}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-medium leading-4">
                            {title}
                          </span>
                          <span className="block text-[12px] leading-4 text-[#d0d0d4]">
                            {detail}
                          </span>
                        </span>
                        <ArrowRight
                          size={13}
                          className="shrink-0 text-[#d4d4d9] transition group-hover:translate-x-0.5"
                        />
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3 py-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-[88%] rounded-2xl rounded-br-sm border border-[#ffdc00]/20 bg-[#ffdc00]/[0.10] px-3.5 py-3 text-[13px] leading-6 text-[#f5f2dc]"
                        : "mr-auto w-full rounded-xl border border-white/[0.08] bg-[#141416] px-3.5 py-3 text-[13px] leading-6 text-[#e7e7eb]"
                    }
                  >
                    {(getToolMessageLabel(message) ||
                      message.role === "assistant") && (
                      <p
                        className={`mb-1.5 text-[10px] font-semibold tracking-wide ${message.role === "assistant" ? "text-[#ffdc00]" : "text-[#c5c5ce]"}`}
                      >
                        {getToolMessageLabel(message) || "Lurph"}
                      </p>
                    )}
                    <div
                      className={
                        message.role === "assistant"
                          ? "markdown-content break-words"
                          : "whitespace-pre-wrap break-words"
                      }
                    >
                      {message.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                          {String(message.content ?? "")}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="mr-auto flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141416] px-3.5 py-3 text-xs text-[#aaa9ad]">
                    <span className="size-2 animate-pulse rounded-full bg-[#ffdc00]" />{" "}
                    Lurph is thinking…
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
            {status && (
              <p
                className="mx-auto mt-2 max-w-[760px] rounded-lg border border-[#ffdc00]/20 bg-[#ffdc00]/[0.06] px-2.5 py-2 text-[11px] leading-4 text-[#d9d2a2]"
                role="status"
              >
                {status}
              </p>
            )}
          </div>

          <div className="shrink-0 px-3 pb-2 pt-1">
            {selectedTextContext && (
              <div className="mb-1.5 rounded-xl border border-[#ffdc00]/25 bg-[#ffdc00]/[0.055] px-3 py-2.5">
                <div className="mb-1 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#f0d94b]">
                    Selected text
                    {selectedTextContext.title
                      ? ` · ${selectedTextContext.title}`
                      : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTextContext(null);
                      setClearSelectedTextContext(true);
                      setStatus("");
                    }}
                    title="Remove selected text"
                    aria-label="Remove selected text"
                    className="grid size-6 shrink-0 place-items-center rounded-md text-[#a9a9ae] hover:bg-white/[0.08] hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="line-clamp-3 whitespace-pre-wrap break-words text-[11px] leading-[1.45] text-[#c5c5ca]">
                  {selectedTextContext.text}
                </p>
                {selectedTextContext.url && (
                  <p className="mt-1 truncate text-[10px] text-[#85858d]">
                    {selectedTextContext.url}
                  </p>
                )}
              </div>
            )}
            {imageAttachment && (
              <div className="mb-1.5 flex items-center gap-2 rounded-xl border border-[#ffdc00]/25 bg-[#ffdc00]/[0.055] px-3 py-2.5">
                <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#f0d94b]">
                  {imageAttachment.name}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setImageAttachment(null);
                    setStatus("");
                  }}
                  title="Remove image"
                  aria-label="Remove image attachment"
                  className="grid size-6 shrink-0 place-items-center rounded-md text-[#a9a9ae] hover:bg-white/[0.08] hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {pdfAttachment && (
              <div className="mb-1.5 rounded-xl border border-[#ffdc00]/25 bg-[#ffdc00]/[0.055] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="shrink-0 text-[#ffdc00]" />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#f0d94b]">
                    {pdfAttachment.name}
                  </span>
                  <span className="shrink-0 text-[10px] text-[#9999a1]">
                    PDF
                    {pdfAttachment.pageCount
                      ? ` · ${pdfAttachment.pageCount} pages`
                      : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfAttachment(null);
                      setClearPdfAttachment(true);
                      setStatus(
                        "PDF removed. Its document context will be cleared from this conversation when you send your next message.",
                      );
                    }}
                    title="Remove PDF"
                    aria-label="Remove PDF attachment"
                    className="grid size-6 shrink-0 place-items-center rounded-md text-[#a9a9ae] hover:bg-white/[0.08] hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                {pdfAttachment.truncated && (
                  <p className="mt-1 text-[10px] text-[#b6a75f]">
                    Some extracted text was omitted to fit the document context
                    limit.
                  </p>
                )}
              </div>
            )}
            {!extensionAccessEnabled && isExtensionAccessLoaded && (
              <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-[#ffdc00]/25 bg-[#ffdc00]/[0.06] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#f0d94b]">
                    Extension Access is off
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#b6b1a0]">
                    Turn it on in Settings to use Lurph on websites.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openSection("settings")}
                  className="shrink-0 rounded-lg border border-[#ffdc00]/35 px-2.5 py-1.5 text-[11px] font-medium text-[#ffdc00] transition hover:bg-[#ffdc00]/[0.08]"
                >
                  Open Settings
                </button>
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              aria-disabled={
                !extensionAccessEnabled || !isExtensionAccessLoaded
              }
              className={`rounded-xl border bg-[#121214] p-2 shadow-[0_8px_28px_rgba(0,0,0,.22)] ${extensionAccessEnabled && isExtensionAccessLoaded ? "border-[#ffdc00]/80 focus-within:border-[#ffdc00]/80" : "border-white/[0.10] opacity-65"}`}
            >
              <textarea
                ref={promptTextareaRef}
                value={prompt}
                disabled={!extensionAccessEnabled || !isExtensionAccessLoaded}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  if (status) setStatus("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                placeholder={
                  !extensionAccessEnabled || !isExtensionAccessLoaded
                    ? "Enable Extension Access in Settings to use Lurph..."
                    : activePromptTool === "Translate"
                      ? "Type or paste text to translate..."
                      : activePromptTool === "Rewrite"
                        ? "Type or paste text to rewrite..."
                        : pdfAttachment
                          ? "Ask Lurph a question about this PDF..."
                          : imageAttachment
                            ? "Ask Lurph a question about this image..."
                            : selectedTextContext
                              ? "Ask Lurph about the selected text..."
                              : "Ask Lurph anything about this page..."
                }
                className="min-h-[40px] w-full resize-none overflow-y-hidden bg-transparent px-1 py-0.5 text-[13px] leading-5 text-[#f4f4f7] outline-none placeholder:text-[#898991]"
                aria-label="Ask Lurph"
              />
              {attachedFileName && (
                <p className="truncate px-1 pb-1 text-xs text-[#d7d7dc]">
                  Attached: {attachedFileName}
                </p>
              )}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="file"
                  className="hidden"
                  id="lurph-attachment"
                  accept=".txt,.md,.csv,.json,image/*,text/plain,text/markdown,text/csv,application/json"
                  onChange={handleAttach}
                  disabled={!extensionAccessEnabled || !isExtensionAccessLoaded}
                />
                <label
                  htmlFor="lurph-attachment"
                  title="Attach an image or text file"
                  className={`grid size-7 place-items-center rounded-lg text-[#a8a8b0] transition ${extensionAccessEnabled && isExtensionAccessLoaded ? "cursor-pointer hover:bg-white/[0.06] hover:text-white" : "pointer-events-none cursor-not-allowed opacity-40"}`}
                >
                  <Paperclip size={16} />
                </label>
                <span className="flex-1 truncate text-[11px] text-[#8e8e96]">
                  {isSending ? "Generating response…" : "Ready when you are"}
                </span>
                <button
                  type="submit"
                  disabled={
                    !prompt.trim() ||
                    isSending ||
                    !extensionAccessEnabled ||
                    !isExtensionAccessLoaded
                  }
                  title="Send message"
                  aria-label="Send message"
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#ffdc00] text-[#171600] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              </div>
            </form>
            <p className="mt-1.5 truncate text-center text-[10px] leading-4 text-[#696970]">
              Lurph can make mistakes. Check important information.
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function App() {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [websiteAccessGranted, setWebsiteAccessGranted] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [themePreference, setThemePreference] = useState("system");

  // Restore the saved theme preference and keep it synchronized across
  // extension views. System mode follows the operating-system appearance.
  useEffect(() => {
    let active = true;
    const chromeApi = globalThis.chrome;

    const loadThemePreference = async () => {
      try {
        if (chromeApi?.storage?.local) {
          const stored = await chromeApi.storage.local.get(
            THEME_PREFERENCE_STORAGE_KEY,
          );
          if (active) {
            setThemePreference(
              normalizeThemePreference(stored[THEME_PREFERENCE_STORAGE_KEY]),
            );
          }
        } else {
          const saved = localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
          if (active) setThemePreference(normalizeThemePreference(saved));
        }
      } catch (error) {
        console.warn("Could not restore Lurph theme preference:", error);
      }
    };

    loadThemePreference();

    const handleStorageChange = (changes, areaName) => {
      if (areaName !== "local" || !changes[THEME_PREFERENCE_STORAGE_KEY])
        return;
      setThemePreference(
        normalizeThemePreference(
          changes[THEME_PREFERENCE_STORAGE_KEY].newValue,
        ),
      );
    };

    chromeApi?.storage?.onChanged?.addListener(handleStorageChange);
    return () => {
      active = false;
      chromeApi?.storage?.onChanged?.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme =
        themePreference === "system"
          ? mediaQuery?.matches
            ? "dark"
            : "light"
          : themePreference;
      root.dataset.lurphTheme = resolvedTheme;
      root.dataset.lurphThemePreference = themePreference;
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();
    if (themePreference !== "system" || !mediaQuery) return undefined;

    mediaQuery.addEventListener?.("change", applyTheme);
    return () => mediaQuery.removeEventListener?.("change", applyTheme);
  }, [themePreference]);

  const handleThemeChange = async (nextTheme) => {
    const normalizedTheme = normalizeThemePreference(nextTheme);
    setThemePreference(normalizedTheme);
    try {
      if (globalThis.chrome?.storage?.local) {
        await chrome.storage.local.set({
          [THEME_PREFERENCE_STORAGE_KEY]: normalizedTheme,
        });
      } else {
        localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, normalizedTheme);
      }
    } catch (error) {
      console.error("Could not save Lurph theme preference:", error);
    }
  };

  const isSignup = mode === "signup";
  const isAuthBusy = isSubmitting || isGoogleSubmitting;

  const switchMode = (nextMode) => {
    // Prevent switching between Sign in and Create account while an auth
    // request is running, including keyboard/programmatic invocations.
    if (isAuthBusy) return;
    setMode(nextMode);
    setNotice("");
  };

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        const completed = await readOnboardingCompleted();
        if (active) setHasCompletedOnboarding(completed);
        const tokens = await getTokens();
        if (!tokens?.refreshToken) return;
        const user = await getCurrentUser();
        if (active) {
          setCurrentUser(user);
          if (!completed) {
            setOnboardingStep(1);
            setShowOnboarding(true);
          }
        }
      } catch {
        // An expired/revoked session is handled by the API client; show sign-in.
        if (active) setCurrentUser(null);
      } finally {
        if (active) setIsCheckingSession(false);
      }
    }
    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    setIsSubmitting(true);
    try {
      const payload = isSignup
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };
      const result = isSignup
        ? await registerAccount(payload)
        : await loginAccount(payload);
      await setTokens(result.tokens);
      const completed = await readOnboardingCompleted();
      setHasCompletedOnboarding(completed);
      if (!completed) {
        setOnboardingStep(1);
        setWebsiteAccessGranted(null);
        setShowOnboarding(true);
      }
      setCurrentUser(result.user);
      setPassword("");
      setNotice(
        isSignup
          ? "Your account has been created successfully."
          : "You are now signed in.",
      );
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          (error.code === "ERR_NETWORK"
            ? "Unable to reach the server. Check that the backend is running and its URL is configured."
            : "Something went wrong. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setNotice("");
    setIsGoogleSubmitting(true);
    try {
      const result = await loginWithGoogle();
      await setTokens(result.tokens);
      const completed = await readOnboardingCompleted();
      setHasCompletedOnboarding(completed);
      if (!completed) {
        setOnboardingStep(1);
        setWebsiteAccessGranted(null);
        setShowOnboarding(true);
      }
      setCurrentUser(result.user);
      setNotice("You are now signed in with Google.");
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          error.message ||
          "Google sign-in failed. Please try again.",
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setNotice("");
    try {
      await logoutAccount();
    } catch {
      // Clear local credentials even if the server is unreachable.
    } finally {
      await clearTokens();
      setCurrentUser(null);
      setShowOnboarding(false);
      setMode("signin");
      setNotice("You have been signed out.");
    }
  };

  if (isCheckingSession) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#080808] text-sm text-[#bcbcbc]">
        Loading your session…
      </main>
    );
  }

  const closeOnboardingTab = () => {
    const tabs = globalThis.chrome?.tabs;
    if (!tabs?.getCurrent || !tabs?.remove) {
      setShowOnboarding(false);
      return;
    }
    tabs.getCurrent((tab) => {
      if (tab?.id === undefined) {
        setShowOnboarding(false);
        return;
      }
      tabs.remove(tab.id, () => {
        if (chrome.runtime.lastError) setShowOnboarding(false);
      });
    });
  };

  const handleContinueOnboarding = () => {
    const permissions = globalThis.chrome?.permissions;
    // The permissions API call is made directly from the Continue click so Chrome
    // can associate the prompt with an explicit user gesture.
    if (!permissions?.request) {
      setWebsiteAccessGranted(null);
      globalThis.chrome?.storage?.local
        ?.set({
          [EXTENSION_ACCESS_STORAGE_KEY]: false,
        })
        .catch(() => {});
      setOnboardingStep(3);
      return;
    }
    permissions.request({ origins: [ALL_SITES_ORIGIN] }, async (granted) => {
      const failed = Boolean(chrome.runtime.lastError);
      const websiteAccessEnabled = !failed && Boolean(granted);
      setWebsiteAccessGranted(websiteAccessEnabled);
      try {
        await chrome.storage.local.set({
          [EXTENSION_ACCESS_STORAGE_KEY]: websiteAccessEnabled,
        });
      } catch (error) {
        console.error("Could not save website access settings:", error);
      }
      setOnboardingStep(3);
    });
  };

  const handleFinishOnboarding = async () => {
    try {
      await writeOnboardingCompleted();
      // Enable toolbar-click side-panel behavior only after onboarding finishes.
      // This keeps first-time users in the planned sign-in/setup tab flow.
      if (globalThis.chrome?.sidePanel?.setPanelBehavior) {
        await chrome.sidePanel.setPanelBehavior({
          openPanelOnActionClick: true,
        });
      }
      setHasCompletedOnboarding(true);
      setShowOnboarding(false);
      closeOnboardingTab();
    } catch {
      setNotice(
        "Your setup is complete, but we could not save the setup status. It may appear again next time.",
      );
      setShowOnboarding(false);
    }
  };

  if (currentUser && showOnboarding && !hasCompletedOnboarding) {
    return (
      <OnboardingScreen
        step={onboardingStep}
        onNext={() => setOnboardingStep(2)}
        onContinue={handleContinueOnboarding}
        onFinish={handleFinishOnboarding}
        websiteAccessGranted={websiteAccessGranted}
      />
    );
  }

  if (currentUser) {
    return (
      <MainChatPanel
        currentUser={currentUser}
        onLogout={handleLogout}
        themePreference={themePreference}
        onThemeChange={handleThemeChange}
      />
    );
  }

  return (
    <main className="auth-scroll-container h-dvh min-h-0 w-full overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#080808] text-[#f7f7f7]">
      <section
        className="grid min-h-svh w-full grid-cols-1 md:h-svh md:min-h-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
        aria-label="Lurph account access"
      >
        <section
          className="relative isolate hidden min-h-svh min-w-0 items-center justify-center overflow-hidden bg-[#101018] text-[#f8f8f8] md:flex md:h-svh"
          aria-label="About Lurph"
        >
          <div
            className="pointer-events-none absolute -inset-[22%] z-0 blur-[1px]"
            style={{
              background:
                "radial-gradient(ellipse at 12% 12%, rgba(255, 227, 0, .96) 0, rgba(255, 220, 0, .78) 17%, transparent 39%), radial-gradient(ellipse at 84% 76%, rgba(255, 222, 0, .98) 0, rgba(255, 218, 0, .78) 21%, transparent 44%), radial-gradient(ellipse at 50% 49%, #15162b 0, #0e0f19 39%, #09090b 68%)",
              transform: "rotate(-7deg) scale(1.12)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-black/[0.04] via-black/[0.16] to-black/[0.07]" />
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
              maskImage:
                "linear-gradient(130deg, transparent 2%, #000 52%, transparent 100%)",
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
                  className={`relative flex items-start gap-9 px-0.5 ${index === 0 ? "pb-[18px]" : "border-t border-white/[0.09] py-[15px]"} ${index === features.length - 1 ? "pb-0" : ""}`}
                  key={title}
                >
                  <div className="grid size-[82px] shrink-0 place-items-center rounded-[15px] border border-[#ffdc00]/10 bg-[#ffdc00]/[0.09] text-[#ffdc00] max-xl:size-[64px]">
                    <Icon
                      className="size-[31px] max-xl:size-[27px]"
                      strokeWidth={2.1}
                    />
                  </div>
                  <div className="min-w-0 pt-2">
                    <h2 className="mb-[5px] text-[clamp(14px,1.15vw,18px)] font-semibold leading-[1.35] tracking-[-0.015em] text-[#f8f8f8]">
                      {title}
                    </h2>
                    <p className="m-0 max-w-[310px] text-[clamp(12px,1.08vw,17px)] leading-[1.45] text-[#aaa9ad]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="flex min-h-svh min-w-0 flex-col items-stretch bg-[#080808] px-6 py-8 sm:px-10 md:h-svh md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-10 md:py-8 xl:px-24"
          aria-label={
            isSignup ? "Create your Lurph account" : "Sign in to Lurph"
          }
        >
          <div className="mx-auto my-auto w-full max-w-[500px] shrink-0">
            <div
              className="mb-6 flex items-center justify-center gap-2 md:hidden"
              aria-hidden="true"
            >
              <span className="grid size-[34px] place-items-center rounded-lg bg-[#ffdc00] pr-1 text-[25px] font-black tracking-[-2px] text-[#171600]">
                L
              </span>
              <span className="text-base font-bold tracking-[-0.045em]">
                Lurph<span className="font-medium text-[#ffdc00]"> AI</span>
              </span>
            </div>

            <div className="mb-[22px] flex flex-col items-center text-center">
              <h1 className="m-0 text-[clamp(23px,1.9vw,29px)] font-bold leading-tight tracking-[-0.04em] text-[#f7f7f7]">
                {isSignup ? "Welcome to Lurph" : "Welcome back"}
              </h1>
              <p className="mt-[7px] text-[clamp(13px,1.18vw,18px)] leading-[1.4] text-[#a0a0a0]">
                {isSignup
                  ? "Your AI assistant for the web starts here."
                  : "Sign in to continue with Lurph"}
              </p>
            </div>

            <div className="auth-mode-tabs mb-[22px] grid grid-cols-2 gap-[3px] rounded-lg border border-[#292929] bg-[#171717] p-[3px]">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                aria-disabled={isAuthBusy}
                disabled={isAuthBusy}
                className={`auth-mode-tab min-h-[44px] min-w-0 rounded-md border px-2.5 py-1.5 text-[clamp(12px,1.05vw,15px)] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-[#a1a1a1] ${!isSignup ? "border-[#525252] bg-gradient-to-b from-[#2d2d2d] to-[#242424] text-white shadow-[0_1px_2px_#000]" : "border-transparent bg-transparent text-[#a1a1a1] hover:text-[#f3f3f3]"}`}
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                aria-disabled={isAuthBusy}
                disabled={isAuthBusy}
                className={`auth-mode-tab min-h-[44px] min-w-0 rounded-md border px-2.5 py-1.5 text-[clamp(12px,1.05vw,15px)] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-[#a1a1a1] ${isSignup ? "border-[#525252] bg-gradient-to-b from-[#2d2d2d] to-[#242424] text-white shadow-[0_1px_2px_#000]" : "border-transparent bg-transparent text-[#a1a1a1] hover:text-[#f3f3f3]"}`}
                onClick={() => switchMode("signup")}
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
              <span>
                {isGoogleSubmitting
                  ? "Connecting to Google…"
                  : "Continue with Google"}
              </span>
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
                <span className={!isSignup ? "sr-only" : ""}>
                  Email address
                </span>
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
                {isSignup && (
                  <label className="mb-2" htmlFor="password">
                    Password
                  </label>
                )}
                <div className="relative block">
                  <input
                    className={`${inputClasses} pr-11`}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignup ? "Create a password" : "Password"}
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 grid h-11 w-[42px] place-items-center border-0 bg-transparent text-[#858585] hover:text-[#e8e8e8]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {isSignup && (
                  <span className="mt-2 flex items-center gap-[5px] text-[11px] font-normal text-[#777]">
                    <KeyRound className="size-[13px] text-[#a99a16]" /> Use at
                    least 8 characters.
                  </span>
                )}
              </div>

              <button
                className="mt-[3px] flex min-h-[47px] w-full items-center justify-center rounded-md border border-[#f4d000] bg-[#ffdc00] px-3 py-[11px] text-[clamp(14px,1.1vw,16px)] font-bold text-[#171500] shadow-[0_4px_14px_rgba(255,220,0,0.09)] transition hover:-translate-y-px hover:bg-[#ffe84b] hover:shadow-[0_5px_18px_rgba(255,220,0,0.15)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-[#ffdc00]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Please wait…"
                  : isSignup
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            {notice && (
              <div
                className="mt-3.5 flex items-start gap-2 rounded-[7px] border border-[#ffdc00]/[0.22] bg-[#ffdc00]/[0.06] p-3 text-xs leading-[1.5] text-[#d9d2a2]"
                role="status"
              >
                <span className="grid size-[19px] shrink-0 place-items-center rounded-full bg-[#ffdc00]/[0.15] text-[#ffdc00]">
                  <Check size={15} />
                </span>
                {notice}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
