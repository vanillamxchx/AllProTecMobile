import { NativeModules, Platform } from "react-native";

const DEFAULT_PORT = "4000";
const REQUEST_TIMEOUT_MS = 12000;
const PLACEHOLDER_HOSTS = new Set(["api.your-domain.com", "your-domain.com", "example.com"]);

function getExpoConstants() {
  return NativeModules?.ExponentConstants || NativeModules?.ExpoConstants || {};
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

function isReleaseBuild() {
  return !__DEV__ && Platform.OS !== "web";
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
  if (Platform.OS === "web") {
    const webOrigin = getWebOrigin();
    if (webOrigin) {
      return webOrigin;
    }
    return `http://localhost:${DEFAULT_PORT}`;
  }

  const metroHost = getMetroHost();
  const isLoopbackHost = ["localhost", "127.0.0.1", "::1"].includes(metroHost);

  if (metroHost && !(Platform.OS === "android" && isLoopbackHost)) {
    return `http://${metroHost}:${DEFAULT_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }
  return `http://127.0.0.1:${DEFAULT_PORT}`;
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
    return parsed.toString().replace(/\/$/, "");
  } catch (_error) {
    return "";
  }
}

const CONFIGURED_API_BASE_URL = normalizeConfiguredBaseUrl(
  process.env.EXPO_PUBLIC_API_URL || getAppConfigApiUrl()
);
let activeApiBaseUrl = CONFIGURED_API_BASE_URL || getDefaultApiBaseUrl();

export function getApiBaseUrl() {
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

function getFallbackBaseUrls() {
  if (isReleaseBuild()) {
    return [...new Set([activeApiBaseUrl, CONFIGURED_API_BASE_URL].filter(Boolean))];
  }

  const defaultBaseUrl = getDefaultApiBaseUrl();
  const candidates = [
    activeApiBaseUrl,
    defaultBaseUrl,
    Platform.OS === "web" ? getWebOrigin() : "",
    createBaseUrl(getMetroHost()),
    createBaseUrl(getWebHost()),
    CONFIGURED_API_BASE_URL,
    Platform.OS === "android" ? createBaseUrl("10.0.2.2") : "",
    createBaseUrl("localhost"),
    createBaseUrl("127.0.0.1"),
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
          ...(options.headers || {}),
        },
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
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    const attemptedBaseUrls = getFallbackBaseUrls();
    throw new Error(
      `Could not reach the API. Tried ${attemptedBaseUrls.join(", ")}. ${lastError?.message || ""}`.trim()
    );
  }

  if (response.status === 204) {
    return null;
  }

  const data = responsePayload?.data ?? (await parseResponseData(response)).data;

  if (!response.ok) {
    throw new Error(data.message || `Request failed at ${successfulBaseUrl}.`);
  }

  return data;
}
