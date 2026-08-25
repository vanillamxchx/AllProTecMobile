# All Pro-Tec Mobile Production Checklist

## 1. Backend

The mobile app uses the deployed Railway backend directly.

Production backend:

- `https://autoflow-production-0606.up.railway.app`

Resend OTP must stay on that backend, never in the mobile app.

Required backend environment values:

- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=...`
- `EMAIL_FROM=All Pro-Tec <noreply@allprotecph.com>`
- `MONGODB_URI=...`
- `PORT=4000`

## 2. Mobile production API URL

The production default is already set to:

- `EXPO_PUBLIC_API_URL=https://autoflow-production-0606.up.railway.app`
- `EXPO_PUBLIC_PUBLIC_CLIENT_URL=https://allprotecph.com`

Only override these if the production backend domain changes.

## 3. APK build commands

Preview APK:

`eas build -p android --profile preview`

Production APK:

`eas build -p android --profile production-apk`

Store bundle (Play Store):

`eas build -p android --profile production`

iOS production build:

`eas build -p ios --profile production`

## 4. Version history

Current release baseline:

- App version: `1.0.1`
- Android version code: `2`
- Runtime version policy: `appVersion`

Track future releases in `CHANGELOG.md` and bump:

- `EXPO_PUBLIC_APP_VERSION`
- `EXPO_PUBLIC_ANDROID_VERSION_CODE`
- `EXPO_PUBLIC_IOS_BUILD_NUMBER`
