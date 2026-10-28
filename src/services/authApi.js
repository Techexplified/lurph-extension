import axiosInstance, { API_BASE_URL } from "../lib/axiosInstance.js";

export async function registerAccount(payload) {
  const { data } = await axiosInstance.post("/api/auth/register", payload);
  return data;
}

export async function loginAccount(payload) {
  const { data } = await axiosInstance.post("/api/auth/login", payload);
  return data;
}

/**
 * Starts Passport's server-side Google OAuth flow using Chrome Identity,
 * then exchanges the short-lived one-time code for normal Lurph tokens.
 */
export async function loginWithGoogle() {
  const identity = globalThis.chrome?.identity;
  if (!identity?.launchWebAuthFlow || !identity?.getRedirectURL) {
    throw new Error(
      "Google sign-in works inside the installed Chrome extension. Build the extension and load its dist folder from chrome://extensions.",
    );
  }

  const expectedRedirectUrl = identity.getRedirectURL();
  const authUrl = new URL("/api/auth/google", API_BASE_URL);
  let callbackUrl;

  try {
    callbackUrl = await identity.launchWebAuthFlow({
      url: authUrl.toString(),
      interactive: true,
    });
  } catch (error) {
    const message = typeof error?.message === "string" ? error.message : "";
    if (/cancel|closed|user denied/i.test(message)) {
      throw new Error("Google sign-in was cancelled.");
    }
    throw new Error(
      message ||
        "Could not open Google sign-in. Check your OAuth configuration and try again.",
    );
  }

  if (!callbackUrl) {
    throw new Error(
      "Google sign-in did not return a result. Please try again.",
    );
  }

  const actualRedirect = new URL(callbackUrl);
  const expectedRedirect = new URL(expectedRedirectUrl);
  if (
    actualRedirect.origin !== expectedRedirect.origin ||
    actualRedirect.pathname !== expectedRedirect.pathname
  ) {
    throw new Error(
      "Google sign-in returned an unexpected redirect URL. Check GOOGLE_EXTENSION_REDIRECT_URL in the backend environment.",
    );
  }

  const oauthError = actualRedirect.searchParams.get("error");
  if (oauthError) {
    const messages = {
      access_denied: "Google sign-in was cancelled.",
      account_conflict:
        "This email is linked to a different Google account. Sign in using the linked account.",
      google_auth_failed:
        "Google could not authenticate this account. Please try again.",
    };
    throw new Error(
      messages[oauthError] || "Google sign-in failed. Please try again.",
    );
  }

  const code = actualRedirect.searchParams.get("code");
  if (!code) {
    throw new Error(
      "Google sign-in did not return an authorization code. Check the backend OAuth configuration.",
    );
  }

  const { data } = await axiosInstance.post("/api/auth/google/exchange", {
    code,
  });
  return data;
}

export async function getCurrentUser() {
  const { data } = await axiosInstance.get("/api/auth/me");
  return data.user;
}

export async function logoutAccount() {
  const { data } = await axiosInstance.post("/api/auth/logout");
  return data;
}
