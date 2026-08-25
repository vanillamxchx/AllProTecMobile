const APP_VARIANT = String(
  process.env.APP_VARIANT || process.env.EAS_BUILD_PROFILE || process.env.NODE_ENV || "development"
)
  .trim()
  .toLowerCase();

const PLACEHOLDER_HOSTS = new Set(["api.your-domain.com", "your-domain.com", "example.com"]);
const DEFAULT_PRODUCTION_API_URL = "https://autoflow-production-0606.up.railway.app";
const DEFAULT_PRODUCTION_PUBLIC_CLIENT_URL = "https://allprotecph.com";

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    parsed.pathname = normalizedPath || "/";
    return parsed.toString().replace(/\/$/, "");
  } catch (_error) {
    return "";
  }
}

function isLoopbackHost(hostname) {
  const host = String(hostname || "").trim().toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isPrivateLanHost(hostname) {
  const host = String(hostname || "").trim().toLowerCase();
  return (
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)
  );
}

function sanitizeApiUrl(value, { allowLocal = false } = {}) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "";

  try {
    const parsed = new URL(normalized);
    const hostname = String(parsed.hostname || "").trim().toLowerCase();
    if (!hostname || PLACEHOLDER_HOSTS.has(hostname)) {
      return "";
    }

    if (!allowLocal && (isLoopbackHost(hostname) || isPrivateLanHost(hostname))) {
      return "";
    }

    return parsed.toString().replace(/\/$/, "");
  } catch (_error) {
    return "";
  }
}

const isDevelopmentVariant = ["development", "dev"].includes(APP_VARIANT);
const isPreviewVariant = APP_VARIANT === "preview";
const allowLocalNetwork = isDevelopmentVariant || isPreviewVariant;
const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL || DEFAULT_PRODUCTION_API_URL;
const configuredPublicClientUrl =
  process.env.EXPO_PUBLIC_PUBLIC_CLIENT_URL || DEFAULT_PRODUCTION_PUBLIC_CLIENT_URL;

const apiUrl = sanitizeApiUrl(configuredApiUrl, {
  allowLocal: allowLocalNetwork,
});
const publicClientUrl = sanitizeApiUrl(configuredPublicClientUrl, {
  allowLocal: allowLocalNetwork,
});

const appVersion = String(process.env.EXPO_PUBLIC_APP_VERSION || "1.0.1").trim();
const androidVersionCode = Number(process.env.EXPO_PUBLIC_ANDROID_VERSION_CODE || "2") || 2;

export default {
  expo: {
    name: "All Pro-Tec",
    slug: "all-pro-tec-mobile",
    scheme: "allprotec",
    version: appVersion,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER || "com.allprotec.mobile",
      buildNumber: process.env.EXPO_PUBLIC_IOS_BUILD_NUMBER || appVersion,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || "com.allprotec.mobile",
      versionCode: androidVersionCode,
      usesCleartextTraffic: allowLocalNetwork && apiUrl.startsWith("http://"),
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      apiUrl,
      publicClientUrl,
      appVariant: APP_VARIANT,
      allowLocalNetwork,
      eas: {
        projectId: "28ccf282-e734-4b16-b9da-f50763c3c485",
      },
    },
    plugins: [
      "expo-font",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "15.5",
          },
        },
      ],
    ],
  },
};
