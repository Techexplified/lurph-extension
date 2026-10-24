import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Folder,
  KeyRound,
  MessageSquareText,
  Zap,
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
const checkboxClasses =
  "mt-[3px] size-[17px] shrink-0 cursor-pointer accent-[#ffdc00]";
const policyLinkClasses =
  "text-[#e3c900] no-underline hover:text-[#ffdc00] hover:underline";

function App() {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [productUpdates, setProductUpdates] = useState(false);
  const [notice, setNotice] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  const isSignup = mode === "signup";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setNotice("");
    setForgotOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice(
      "Your authentication UI is ready. Backend sign-in will be connected next.",
    );
  };

  const handleGoogle = () => {
    setNotice("Google sign-in will be connected when we implement OAuth.");
  };

  const handleForgot = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setNotice(
        "Enter your email address first, then request a password reset.",
      );
      return;
    }
    setForgotOpen(true);
    setNotice("");
  };

  const handlePolicyClick = (event, policy) => {
    event.preventDefault();
    setNotice(`${policy} will be added before launch.`);
  };

  return (
    <main className="min-h-svh w-full overflow-y-auto bg-[#080808] text-[#f7f7f7] md:h-svh md:overflow-hidden">
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
              <div className="mb-5 grid size-14 shrink-0 place-items-center rounded-xl bg-[#ffdc00] pb-[5px] pr-[5px] text-[43px] font-black leading-none tracking-[-3px] text-[#171600] shadow-[0_3px_14px_rgba(255,220,0,0.18)]">
                L
              </div>
              <h1 className="m-0 text-[clamp(23px,1.9vw,29px)] font-bold leading-tight tracking-[-0.04em] text-[#f7f7f7]">
                {isSignup ? "Welcome to Lurph" : "Welcome back"}
              </h1>
              <p className="mt-[7px] text-[clamp(13px,1.18vw,18px)] leading-[1.4] text-[#a0a0a0]">
                {isSignup
                  ? "Your AI assistant for the web starts here."
                  : "Sign in to continue with Lurph"}
              </p>
            </div>

            <div className="mb-[22px] grid grid-cols-2 gap-[3px] rounded-lg border border-[#292929] bg-[#171717] p-[3px]">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={`min-h-[44px] min-w-0 rounded-md border px-2.5 py-1.5 text-[clamp(12px,1.05vw,15px)] font-medium transition-colors duration-150 ${!isSignup ? "border-[#525252] bg-gradient-to-b from-[#2d2d2d] to-[#242424] text-white shadow-[0_1px_2px_#000]" : "border-transparent bg-transparent text-[#a1a1a1] hover:text-[#f3f3f3]"}`}
                onClick={() => switchMode("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={`min-h-[44px] min-w-0 rounded-md border px-2.5 py-1.5 text-[clamp(12px,1.05vw,15px)] font-medium transition-colors duration-150 ${isSignup ? "border-[#525252] bg-gradient-to-b from-[#2d2d2d] to-[#242424] text-white shadow-[0_1px_2px_#000]" : "border-transparent bg-transparent text-[#a1a1a1] hover:text-[#f3f3f3]"}`}
                onClick={() => switchMode("signup")}
              >
                Create account
              </button>
            </div>

            <button
              type="button"
              className="flex min-h-[45px] w-full items-center justify-center gap-3 rounded-md border border-[#e7e7e7] bg-[#f9f9f9] px-3 py-2.5 text-[clamp(13px,1.1vw,16px)] font-semibold text-[#171717] transition hover:-translate-y-px hover:bg-[#ededed] active:translate-y-0"
              onClick={handleGoogle}
            >
              <GoogleMark />
              <span>Continue with Google</span>
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

                {!isSignup && (
                  <div className="mt-[9px] flex justify-end">
                    <button
                      type="button"
                      className="p-0 text-xs font-medium text-[#c9b400] hover:text-[#ffdc00] hover:underline"
                      onClick={handleForgot}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
                {isSignup && (
                  <span className="mt-2 flex items-center gap-[5px] text-[11px] font-normal text-[#777]">
                    <KeyRound className="size-[13px] text-[#a99a16]" /> Use at
                    least 8 characters.
                  </span>
                )}
              </div>

              {isSignup && (
                <label className="-mt-0.5 flex items-start gap-3 text-[clamp(12px,1.08vw,15px)] font-normal leading-6 text-[#b4b4b4]">
                  <input
                    className={checkboxClasses}
                    type="checkbox"
                    checked={productUpdates}
                    onChange={(event) =>
                      setProductUpdates(event.target.checked)
                    }
                  />
                  <span>
                    Send me product updates and new features from Explified
                    Labs.
                  </span>
                </label>
              )}

              <label
                className={`flex items-start gap-3 text-[clamp(12px,1.08vw,15px)] font-normal leading-[1.5] text-[#b4b4b4] ${isSignup ? "mt-1" : "mt-1"}`}
              >
                <input
                  className={checkboxClasses}
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  required
                />
                <span>
                  By continuing, you agree to our{" "}
                  <a
                    className={policyLinkClasses}
                    href="#terms"
                    onClick={(event) =>
                      handlePolicyClick(event, "Terms of Service")
                    }
                  >
                    Terms of Service
                  </a>
                  ,{" "}
                  <a
                    className={policyLinkClasses}
                    href="#cookies"
                    onClick={(event) =>
                      handlePolicyClick(event, "Cookie Policy")
                    }
                  >
                    Cookie Policy
                  </a>{" "}
                  &amp;{" "}
                  <a
                    className={policyLinkClasses}
                    href="#privacy"
                    onClick={(event) =>
                      handlePolicyClick(event, "Privacy Policy")
                    }
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                className="mt-[3px] flex min-h-[47px] w-full items-center justify-center rounded-md border border-[#f4d000] bg-[#ffdc00] px-3 py-[11px] text-[clamp(14px,1.1vw,16px)] font-bold text-[#171500] shadow-[0_4px_14px_rgba(255,220,0,0.09)] transition hover:-translate-y-px hover:bg-[#ffe84b] hover:shadow-[0_5px_18px_rgba(255,220,0,0.15)] active:translate-y-0"
                type="submit"
              >
                {isSignup ? "Create account" : "Sign in"}
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

            {forgotOpen && (
              <div
                className="relative mt-3 rounded-[7px] border border-[#313131] bg-[#141414] py-3 pl-[13px] pr-[30px] text-xs leading-[1.5] text-[#c9c9c9]"
                role="status"
              >
                <button
                  className="absolute right-2 top-[5px] border-0 bg-transparent text-xl leading-none text-[#a6a6a6]"
                  type="button"
                  aria-label="Close password reset message"
                  onClick={() => setForgotOpen(false)}
                >
                  ×
                </button>
                <strong className="mb-[3px] block text-[13px] text-white">
                  Password reset
                </strong>
                <p className="m-0">
                  A reset link would be sent to{" "}
                  <span className="text-[#ffdc00]">{email}</span> once the
                  backend is connected.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
