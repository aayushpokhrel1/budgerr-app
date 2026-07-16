# Running Budgerr on an iPhone

iOS (unlike Android) can't side-load an app freely — installing to a device is
gated behind Apple code-signing. There are two paths.

## Path A — Expo Go (free, for now)

Runs the app inside Apple's free **Expo Go** app. No Apple Developer account, no
cost. It's a dev harness (only works while the Metro dev server runs), but it's
the fastest way to use the app on the phone and the first real on-device test.

**Prerequisite — the phone must be able to reach the backend.** The backend
currently listens on `127.0.0.1` only. To reach it from the phone, either:

- **Recommended: Tailscale.** Install Tailscale on the Mac and the iPhone (same
  account). Bind the backend to all interfaces so it's reachable over the
  tailnet — in `~/Library/LaunchAgents/com.budgerr.backend.plist` change the
  uvicorn `--host` from `127.0.0.1` to `0.0.0.0`, then
  `launchctl kickstart -k gui/$(id -u)/com.budgerr.backend`. Access it at the
  Mac's tailnet name (works from anywhere, even off home wifi).
- **Home wifi only:** same `--host 0.0.0.0` change, reach it at the Mac's LAN IP
  (`192.168.1.31`). Only works while the phone is on the same wifi.

Auth is enforced (`X-API-Key`), so the exposed backend still requires a key.

**Steps:**
1. Set the mobile env so the app points at the reachable backend and sends its
   key. In `~/dev/BudgerrApp/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://<mac-tailscale-name-or-192.168.1.31>:8001
   EXPO_PUBLIC_BUDGERR_API_KEY=<the mobile key from backend/.env BUDGERR_API_KEYS>
   ```
2. Install **Expo Go** from the App Store on the iPhone.
3. From `~/dev/BudgerrApp`: `npx expo start` (add `--tunnel` if the phone can't
   see the Mac's Metro server directly).
4. Scan the QR with the iPhone Camera → opens in Expo Go.

## Path B — Standalone / TestFlight (later, needs an Apple account)

A permanent installed app. Requires an **Apple Developer account ($99/yr)**.
Scaffolding is ready: `app.json` has `ios.bundleIdentifier`
(`com.aayushpokhrel.budgerr`) and `eas.json` has build profiles.

1. `npm i -g eas-cli && eas login`
2. `eas build --platform ios --profile preview` (EAS handles signing after you
   connect your Apple account).
3. Distribute via TestFlight (`eas submit`) or an ad-hoc/internal link, install
   on the phone. Point `EXPO_PUBLIC_API_URL` at the deployed backend
   (post-deployment, its Tailscale name) so it works anywhere.
