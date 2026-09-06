import { NativeModules, Platform } from "react-native";

const FALLBACK_DEFAULT_PORT = "4000";
const RELEASE_FALLBACK_API_BASE_URL = "https://autoflow-production-0606.up.railway.app";
const REQUEST_TIMEOUT_MS = 12000;
const PLACEHOLDER_HOSTS = new Set(["api.your-domain.com", "your-domain.com", "example.com"]);
const API_BASE_URL_STORAGE_KEY = "allprotec.apiBaseUrl";
const AUTH_TOKEN_STORAGE_KEY = "allprotec.authToken";

function getWebStorage() {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (_error) {
    return null;
  }
}

function readPersistedApiBaseUrl() {
  const storage = getWebStorage();
  if (!storage) return "";

  try {
    return normalizeConfiguredBaseUrl(storage.getItem(API_BASE_URL_STORAGE_KEY));
  } catch (_error) {
    return "";
  }
}

function persistApiBaseUrl(value) {
  const storage = getWebStorage();
  if (!storage) return;

  try {
    if (value) {
      storage.setItem(API_BASE_URL_STORAGE_KEY, value);
    } else {
      storage.removeItem(API_BASE_URL_STORAGE_KEY);
    }
  } catch (_error) {
    // Ignore storage failures and continue using the in-memory value.
  }
}

function readPersistedAuthToken() {
  const storage = getWebStorage();
  if (!storage) return "";

  try {
    return String(storage.getItem(AUTH_TOKEN_STORAGE_KEY) || "").trim();
  } catch (_error) {
    return "";
  }
}

function persistAuthToken(value) {
  const storage = getWebStorage();
  if (!storage) return;

  try {
    if (value) {
      storage.setItem(AUTH_TOKEN_STORAGE_KEY, value);
    } else {
      storage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch (_error) {
    // Ignore storage failures and continue using the in-memory value.
  }
}

function isLoopbackHostname(hostname) {
  const normalized = String(hostname || "").trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function isPrivateLanHostname(hostname) {
  const normalized = String(hostname || "").trim().toLowerCase();
  return (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalized) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(normalized) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(normalized)
  );
}

function isLocalDevHostname(hostname) {
  return isLoopbackHostname(hostname) || isPrivateLanHostname(hostname);
}

function getExpoConstants() {
  return NativeModules?.ExponentConstants || NativeModules?.ExpoConstants || {};
}

function extractPort(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;

  try {
    return new URL(normalized).port || "";
  } catch (_error) {
    const match = raw.match(/:(\d+)(?:\/|$)/);
    return match?.[1] || "";
  }
}

function extractHostname(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;

  try {
    return new URL(normalized).hostname || "";
  } catch (_error) {
    const match = raw.match(/^([^/:]+)(?::\d+)?(?:\/|$)/);
    return match?.[1] || "";
  }
}

function getMetroHost() {
  const constants = getExpoConstants();
  const sourceCodeUrl = typeof NativeModules?.SourceCode?.getConstants === "function"
    ? NativeModules.SourceCode.getConstants()?.scriptURL
    : NativeModules?.SourceCode?.scriptURL || "";
  const candidates = [
    NativeModules?.ExpoGo?.projectConfig?.debuggerHost,
    constants?.manifest2?.extra?.expoGo?.debuggerHost,
    constants?.manifest2?.extra?.expoClient?.hostUri,
    constants?.manifest?.debuggerHost,
    constants?.expoConfig?.hostUri,
    sourceCodeUrl,
  ];

  for (const candidate of candidates) {
    const hostname = extractHostname(candidate);
    if (hostname) {
      return hostname;
    }
  }

  return "";
}

function getAppConfigApiUrl() {
  const constants = getExpoConstants();
  const candidates = [
    constants?.manifest2?.extra?.expoClient?.extra?.apiUrl,
    constants?.manifest2?.extra?.apiUrl,
    constants?.expoConfig?.extra?.apiUrl,
    constants?.manifest?.extra?.apiUrl,
  ];

  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function getAppConfigPublicClientUrl() {
  const constants = getExpoConstants();
  const candidates = [
    constants?.manifest2?.extra?.expoClient?.extra?.publicClientUrl,
    constants?.manifest2?.extra?.publicClientUrl,
    constants?.expoConfig?.extra?.publicClientUrl,
    constants?.manifest?.extra?.publicClientUrl,
  ];

  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function isReleaseBuild() {
  return !__DEV__ && Platform.OS !== "web";
}

export function isReleaseBuildTarget() {
  return isReleaseBuild();
}

function getWebHost() {
  if (typeof window === "undefined" || !window.location) {
    return "";
  }

  return extractHostname(window.location.href) || window.location.hostname || "";
}

function getWebOrigin() {
  if (typeof window === "undefined" || !window.location) {
    return "";
  }

  return String(window.location.origin || "").trim().replace(/\/$/, "");
}

function getDefaultApiBaseUrl() {
  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL;
  }

  if (Platform.OS === "web") {
    const webHost = getWebHost();
    const webOrigin = getWebOrigin();

    if (webOrigin) {
      try {
        const parsed = new URL(webOrigin);
        if (parsed.port === DEFAULT_PORT) {
          return webOrigin;
        }
      } catch (_error) {
        // Ignore invalid browser origin and keep trying other candidates.
      }
    }

    if (webHost && isLocalDevHostname(webHost)) {
      return `http://${webHost}:${DEFAULT_PORT}`;
    }

    if (webOrigin) {
      return webOrigin;
    }
    return `http://localhost:${DEFAULT_PORT}`;
  }

  const metroHost = getMetroHost();
  if (metroHost && !isLoopbackHostname(metroHost)) {
    return `http://${metroHost}:${DEFAULT_PORT}`;
  }
  return "";
}

function normalizeConfiguredBaseUrl(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return "";

  const withProtocol = /^https?:\/\//i.test(value) ? value : `http://${value}`;

  try {
    const parsed = new URL(withProtocol);
    if (PLACEHOLDER_HOSTS.has(parsed.hostname.toLowerCase())) {
      return "";
    }
    const normalizedPath = parsed.pathname.replace(/\/+$/, "").replace(/\/api$/i, "");
    parsed.pathname = normalizedPath || "/";
    return parsed.toString().replace(/\/$/, "");
  } catch (_error) {
    return "";
  }
}

const RAW_CONFIGURED_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getAppConfigApiUrl() || (isReleaseBuild() ? RELEASE_FALLBACK_API_BASE_URL : "");
const DEFAULT_PORT = extractPort(RAW_CONFIGURED_API_BASE_URL) || FALLBACK_DEFAULT_PORT;
const CONFIGURED_API_BASE_URL = normalizeConfiguredBaseUrl(RAW_CONFIGURED_API_BASE_URL);
const CONFIGURED_PUBLIC_CLIENT_URL = normalizeConfiguredBaseUrl(
  process.env.EXPO_PUBLIC_PUBLIC_CLIENT_URL || getAppConfigPublicClientUrl()
);

function resolveInitialApiBaseUrl() {
  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL;
  }

  const persistedApiBaseUrl = readPersistedApiBaseUrl();

  if (!persistedApiBaseUrl) {
    return CONFIGURED_API_BASE_URL || getDefaultApiBaseUrl();
  }

  if (!CONFIGURED_API_BASE_URL) {
    return persistedApiBaseUrl;
  }

  const persistedHostname = extractHostname(persistedApiBaseUrl);
  const configuredHostname = extractHostname(CONFIGURED_API_BASE_URL);
  const persistedPort = extractPort(persistedApiBaseUrl);
  const configuredPort = extractPort(CONFIGURED_API_BASE_URL);

  // When a public configured backend exists, always prefer it over any saved
  // browser value so the app cannot stay pinned to an old manual/local URL.
  if (configuredHostname && !isLocalDevHostname(configuredHostname)) {
    return CONFIGURED_API_BASE_URL;
  }

  // When the project config changes only the API port on the same machine,
  // prefer the updated config so the app does not stay stuck on an old port.
  if (
    persistedHostname &&
    configuredHostname &&
    persistedHostname === configuredHostname &&
    persistedPort !== configuredPort
  ) {
    return CONFIGURED_API_BASE_URL;
  }

  // During local development, prefer the current configured API over a stale
  // persisted dev URL so the app follows .env / app config changes reliably.
  if (
    persistedHostname &&
    configuredHostname &&
    isLocalDevHostname(persistedHostname) &&
    isLocalDevHostname(configuredHostname) &&
    persistedApiBaseUrl !== CONFIGURED_API_BASE_URL
  ) {
    return CONFIGURED_API_BASE_URL;
  }

  return persistedApiBaseUrl;
}

let activeApiBaseUrl = resolveInitialApiBaseUrl();
let activeAuthToken = readPersistedAuthToken();
const apiBaseUrlListeners = new Set();

if (CONFIGURED_API_BASE_URL && activeApiBaseUrl !== CONFIGURED_API_BASE_URL) {
  activeApiBaseUrl = CONFIGURED_API_BASE_URL;
}

if (CONFIGURED_API_BASE_URL) {
  persistApiBaseUrl(CONFIGURED_API_BASE_URL);
}

export function getApiBaseUrl() {
  return activeApiBaseUrl;
}

export function getAuthToken() {
  return activeAuthToken;
}

export function setAuthToken(nextToken) {
  activeAuthToken = String(nextToken || "").trim();
  persistAuthToken(activeAuthToken);
  return activeAuthToken;
}

export function getSuggestedApiBaseUrl() {
  return getDefaultApiBaseUrl();
}

export function getDefaultApiPort() {
  return DEFAULT_PORT;
}

export function getLocalhostApiBaseUrl() {
  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL;
  }

  return `http://localhost:${DEFAULT_PORT}`;
}

export function getPublicClientBaseUrl() {
  if (CONFIGURED_PUBLIC_CLIENT_URL) {
    return CONFIGURED_PUBLIC_CLIENT_URL;
  }

  const apiBaseUrl = getApiBaseUrl();

  try {
    const parsed = new URL(apiBaseUrl);
    const hostname = parsed.hostname;
    const protocol = parsed.protocol || "http:";

    if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.origin) {
      return String(window.location.origin).replace(/\/$/, "");
    }

    if (isLocalDevHostname(hostname)) {
      return `${protocol}//${hostname}:3000`;
    }

    return `${protocol}//${parsed.host}`.replace(/\/$/, "");
  } catch (_error) {
    return "";
  }
}

export function buildPublicTrackingUrl(bookingId, section = "") {
  const safeId = encodeURIComponent(String(bookingId || "").trim());
  const publicClientBaseUrl = getPublicClientBaseUrl();

  if (!safeId || !publicClientBaseUrl) {
    return "";
  }

  const normalizedBaseUrl = publicClientBaseUrl.replace(/\/+$/, "");
  if (section) {
    return `${normalizedBaseUrl}/tracking/${safeId}/${encodeURIComponent(section)}`;
  }
  return `${normalizedBaseUrl}/tracking/${safeId}`;
}

function notifyApiBaseUrlListeners() {
  apiBaseUrlListeners.forEach((listener) => {
    try {
      listener(activeApiBaseUrl);
    } catch (_error) {
      // Listener errors should not block API usage.
    }
  });
}

export function subscribeToApiBaseUrl(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  apiBaseUrlListeners.add(listener);
  return () => {
    apiBaseUrlListeners.delete(listener);
  };
}

export function setApiBaseUrl(nextValue) {
  const normalizedValue = normalizeConfiguredBaseUrl(nextValue);
  activeApiBaseUrl = CONFIGURED_API_BASE_URL || normalizedValue || getDefaultApiBaseUrl();
  persistApiBaseUrl(activeApiBaseUrl);
  notifyApiBaseUrlListeners();
  return activeApiBaseUrl;
}

export function isApiReachabilityError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("could not reach the api") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed")
  );
}

function createBaseUrl(hostname) {
  const host = String(hostname || "").trim();
  if (!host) return "";
  return `http://${host}:${DEFAULT_PORT}`;
}

function shouldIncludeLoopbackFallbacks() {
  if (Platform.OS === "web") return true;

  const currentHostname = extractHostname(activeApiBaseUrl);
  const configuredHostname = extractHostname(CONFIGURED_API_BASE_URL);
  return isLoopbackHostname(currentHostname) || isLoopbackHostname(configuredHostname);
}

function expandConfiguredPublicBaseUrls(baseUrl) {
  const normalizedBaseUrl = String(baseUrl || "").trim();
  if (!normalizedBaseUrl) return [];

  try {
    const parsed = new URL(normalizedBaseUrl);
    const hostname = String(parsed.hostname || "").trim().toLowerCase();
    if (!hostname || isLocalDevHostname(hostname)) {
      return [normalizedBaseUrl];
    }

    const hostnameVariants = hostname.startsWith("www.")
      ? [hostname, hostname.slice(4)]
      : [hostname, `www.${hostname}`];

    return hostnameVariants.map((candidateHostname) => {
      const candidateUrl = new URL(parsed.toString());
      candidateUrl.hostname = candidateHostname;
      return candidateUrl.toString().replace(/\/$/, "");
    });
  } catch (_error) {
    return [normalizedBaseUrl];
  }
}

function getFallbackBaseUrls() {
  const configuredHostname = extractHostname(CONFIGURED_API_BASE_URL);
  const hasPublicConfiguredBaseUrl =
    Boolean(CONFIGURED_API_BASE_URL) && configuredHostname && !isLocalDevHostname(configuredHostname);

  if (isReleaseBuild()) {
    return [...new Set([
      ...expandConfiguredPublicBaseUrls(activeApiBaseUrl),
      ...expandConfiguredPublicBaseUrls(CONFIGURED_API_BASE_URL),
      ...expandConfiguredPublicBaseUrls(RELEASE_FALLBACK_API_BASE_URL),
    ].filter(Boolean))];
  }

  if (hasPublicConfiguredBaseUrl) {
    return [...new Set([
      ...expandConfiguredPublicBaseUrls(activeApiBaseUrl),
      ...expandConfiguredPublicBaseUrls(CONFIGURED_API_BASE_URL),
    ].filter(Boolean))];
  }

  const webHost = getWebHost();
  const webOrigin = getWebOrigin();
  const defaultBaseUrl = getDefaultApiBaseUrl();
  const includeLoopbackFallbacks = shouldIncludeLoopbackFallbacks();
  const metroHost = getMetroHost();
  const metroBaseUrl = metroHost && !isLoopbackHostname(metroHost)
    ? createBaseUrl(metroHost)
    : "";
  const candidates = [
    activeApiBaseUrl,
    CONFIGURED_API_BASE_URL,
    defaultBaseUrl,
    Platform.OS === "web" ? createBaseUrl(webHost) : "",
    metroBaseUrl,
    Platform.OS === "web" && webOrigin.endsWith(`:${DEFAULT_PORT}`) ? webOrigin : "",
    Platform.OS === "web" && !isLocalDevHostname(webHost) ? webOrigin : "",
    includeLoopbackFallbacks ? createBaseUrl("localhost") : "",
    includeLoopbackFallbacks ? createBaseUrl("127.0.0.1") : "",
  ];

  return [...new Set(candidates.filter(Boolean))];
}

function appendCacheBust(url) {
  return `${url}${url.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
}

function isHtmlDocumentResponse(contentType, data) {
  const normalizedType = String(contentType || "").toLowerCase();
  if (normalizedType.includes("text/html")) {
    return true;
  }

  const message = String(data?.message || "").trim().toLowerCase();
  return message.startsWith("<!doctype html") || message.startsWith("<html");
}

async function fetchWithTimeout(url, options) {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null;

  try {
    return await fetch(url, {
      ...options,
      ...(controller ? { signal: controller.signal } : {}),
    });
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function parseResponseData(response) {
  const contentType = String(response.headers.get("content-type") || "");
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  return { contentType, data };
}

export async function apiRequest(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const requestPath = String(path || "").trim();
  const fallbackBaseUrls = getFallbackBaseUrls();

  if (isReleaseBuild() && !fallbackBaseUrls.length) {
    throw new Error(
      "No production API URL is configured for this APK. Set EXPO_PUBLIC_API_URL or expo.extra.apiUrl to your live backend domain."
    );
  }

  const candidateUrls = /^https?:\/\//i.test(requestPath)
    ? [requestPath]
    : fallbackBaseUrls.map((baseUrl) => {
        const normalizedBase = baseUrl.replace(/\/+$/, "");
        const normalizedPath = requestPath.startsWith("/") ? requestPath : `/${requestPath}`;
        return `${normalizedBase}${normalizedPath}`;
      });

  let response;
  let lastError = null;
  let successfulBaseUrl = activeApiBaseUrl;
  let responsePayload = null;

  for (const candidateUrl of candidateUrls) {
    let requestUrl = candidateUrl;
    if (method === "GET") {
      requestUrl = appendCacheBust(requestUrl);
    }

    try {
      const nextResponse = await fetchWithTimeout(requestUrl, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          ...(activeAuthToken ? { Authorization: `Bearer ${activeAuthToken}` } : {}),
          ...(options.headers || {}),
        },
        ...(method === "GET" ? { cache: "no-store" } : {}),
        ...options,
      });
      const nextBaseUrl =
        candidateUrl.split(requestPath.startsWith("/") ? requestPath : `/${requestPath}`)[0] ||
        activeApiBaseUrl;
      const nextPayload = nextResponse.status === 204 ? null : await parseResponseData(nextResponse);

      if (nextPayload && isHtmlDocumentResponse(nextPayload.contentType, nextPayload.data)) {
        lastError = new Error(
          `API URL ${nextBaseUrl} is serving the Expo web app instead of the backend.`
        );
        continue;
      }

      response = nextResponse;
      responsePayload = nextPayload;
      successfulBaseUrl = nextBaseUrl;
      activeApiBaseUrl = successfulBaseUrl;
      persistApiBaseUrl(successfulBaseUrl);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    const attemptedBaseUrls = getFallbackBaseUrls();
    if (!attemptedBaseUrls.length) {
      throw new Error(
        "No API base URL is configured. Set it to your Railway backend URL."
      );
    }
    throw new Error(
      `Could not reach the API. Tried ${attemptedBaseUrls.join(", ")}. ${lastError?.message || ""}`.trim()
    );
  }

  if (response.status === 204) {
    return null;
  }

  const data = responsePayload?.data ?? (await parseResponseData(response)).data;

  if (!response.ok) {
    const error = new Error(data.message || `Request failed at ${successfulBaseUrl}.`);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}
