# PHASE 10A DISCOVERY REPORT (BACKEND-ALIGNED)

## PART 1 — Dependency Reality Audit

Based on a strict inspection of `Frontend/package.json` and imports across the `src/` directory:

| Package | Imported in Code | Present in package.json | Required Action |
| :--- | :--- | :--- | :--- |
| `axios` | **YES** (`client.js`, `*Service.js`) | ❌ NO | `npm i axios` |
| `zustand` | **YES** (`useAuthStore`, `useCartStore`) | ❌ NO | `npm i zustand` |
| `@tanstack/react-query` | **YES** (All hooks, `App.js`) | ❌ NO | `npm i @tanstack/react-query` |
| `expo-crypto` | **YES** (4 UI Screens for UUIDs) | ❌ NO | `npx expo install expo-crypto` |
| `expo-secure-store` | ❌ NO | ❌ NO | `npx expo install expo-secure-store` |
| `@react-native-community/netinfo` | ❌ NO | ❌ NO | `npx expo install @react-native-community/netinfo` |
| `expo-image-picker` | ❌ NO | ❌ NO | `npx expo install expo-image-picker` |
| `expo-camera` | ❌ NO | ❌ NO | (Deferred until Shop requirements finalize) |

**Conclusion:** The project is missing 4 critical runtime dependencies.

---

## PART 2 — API Configuration Audit

**File:** `src/api/client.js`

- **Current API URL:** `http://localhost:3000/api/v1`
- **Localhost usage:** YES.
- **Environment variable support:** NO.
- **Staging/Production support:** NO.

**Evidence:**
```javascript
// Adjust this URL to match the backend running environment
export const API_BASE_URL = 'http://localhost:3000/api/v1';
```

---

## PART 3 — Network Layer Audit

**File:** `src/api/client.js`

- **Timeout configured:** ❌ NO. (If backend drops the connection, the app spins forever).
- **Retry handling:** ❌ NO at Axios level. (React Query provides 1 retry in `App.js`).
- **Cancellation handling:** ❌ NO.
- **Offline detection:** ❌ NO. (No `NetInfo` implementation).
- **Interceptors:** ✅ YES. (Attaches Bearer token).
- **Auth Refresh Flow:** ✅ YES. (401 triggers `/auth/refresh` and queues pending requests).

---

## PART 4 — Error Handling Audit

- **Error Boundary exists:** ❌ NO. (No `ErrorBoundary` component found anywhere in the codebase).
- **Global fallback UI exists:** ❌ NO. (If a screen crashes, the app goes white).
- **React Query global error handling:** ❌ NO. (Individual screens must handle `isError`, but Phase 10 audit showed all 7 Salesman screens ignore it).

---

## PART 5 — Security Audit

**File:** `src/store/useAuthStore.js`

- **AsyncStorage usage:** ✅ YES. (Tokens are written to unencrypted disk).
- **SecureStore usage:** ❌ NO.
- **Logout cleanup:** ✅ YES. (Properly wipes Zustand store and React Query cache).
- **Token refresh flow:** ✅ YES. (Saves new tokens correctly).

**Evidence:**
```javascript
AsyncStorage.setItem('accessToken', accessToken);
AsyncStorage.setItem('refreshToken', refreshToken);
```

---

## PART 6 — Build Verification

**Question:** Can a completely new developer execute `npm install` and `npx expo start` without modifications?

**Answer: NO.**

**Blockers:**
The `package.json` does not contain `axios`, `zustand`, `@tanstack/react-query`, or `expo-crypto`. Running `npm install` will not download these. Running `npx expo start` will immediately trigger fatal "Module not found" bundler errors because `App.js` and `client.js` attempt to import them. The repository cannot be built.

---

## PART 7 — Production Hardening Roadmap

Based **only** on repository evidence, here is the prioritized roadmap to make the frontend deployable:

| Rank | Issue | Impact | Files Affected | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | **Missing Dependencies** | Fatal Build Failure | `package.json` | `npx expo start` launches successfully |
| **P0** | **Hardcoded `localhost` URL** | App fails on physical devices | `src/api/client.js` | App connects to staging server |
| **P1** | **No Error Boundary** | Unhandled exceptions cause irreversible white screens | `App.js`, `src/components/ErrorBoundary.js` | Force an error, see fallback UI |
| **P1** | **No Network Timeouts/Offline UX** | App freezes indefinitely if connection drops | `src/api/client.js`, `src/components/OfflineBanner.js` | Turn off WiFi, see banner |
| **P2** | **Unencrypted Token Storage** | Auth tokens can be extracted from disk | `src/store/useAuthStore.js` | Tokens stored securely |
