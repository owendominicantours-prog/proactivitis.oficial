# Proactivitis Mobile Security Notes

## Protections applied locally

- Android release builds run with R8/minify and resource shrinking enabled.
- Android cleartext HTTP traffic is blocked in release.
- App data backup is disabled, and SecureStore data is excluded from backup rules.
- Session, checkout draft, transfer draft, privacy consent, and language preferences use `expo-secure-store`.
- Native Android log calls are stripped from minified release builds.
- The app only requests `INTERNET` and `VIBRATE` in Expo config.
- API calls from the app include mobile client headers so the server can separate mobile traffic.
- Native production builds reject non-HTTPS API base URLs.

## Still required before Play Store production

Play Integrity must be validated on the server. The app can request an integrity token only after Play Console is configured, but the decision must happen in the API before creating payments, sessions, saved cards, or e-tickets.

Recommended server policy:

- Reject checkout/payment/session endpoints when Play Integrity says the app is not recognized.
- Reject or step-up verify installs not sourced from Google Play.
- Rate-limit repeated failed integrity checks by device/user/IP.
- Never trust client-side price, passenger counts, offer data, or product availability. Recalculate on the server.
- Keep Stripe secret keys, JWT secrets, database URLs, and admin tokens only on the server.

## Reality check

No Android app can fully prevent APK decompilation, repackaging, screen scraping, or runtime hooking. The correct model is defense in depth: reduce useful data in the APK, obfuscate release builds, keep secrets server-side, and require server-side integrity checks for actions that matter.
