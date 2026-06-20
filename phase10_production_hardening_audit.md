# PHASE 10: MOBILE PRODUCTION HARDENING AUDIT

---

## 1. ENVIRONMENT CONFIGURATION

### FINDING ENV-01 — Hardcoded API URL (CRITICAL)

**Evidence:** [client.js L5](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/api/client.js#L5)
```
export const API_BASE_URL = 'http://localhost:3000/api/v1';
```

**Impact:** The app is physically incapable of communicating with any backend other than `localhost`. On a real Android device, this resolves to the device's own loopback adapter, meaning **every single API call will fail on production hardware**.

**Required Fix:** Replace with environment-aware configuration using `expo-constants` and `app.json` extras, or a `.env` + `react-native-dotenv` approach keyed to EAS build profiles.

---

### FINDING ENV-02 — No Staging/Production Build Profiles (HIGH)

**Evidence:** [eas.json](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/eas.json) — defines only `preview` (APK) and `production` (AAB) build types. Neither profile specifies environment variables or channel-specific API URLs.

**Impact:** Impossible to run separate staging vs. production builds with distinct backends.

**Required Fix:** Add `env` blocks or `extra` overrides per EAS build profile.

---

### FINDING ENV-03 — No EAS Update Channel Configured (MEDIUM)

**Evidence:** [app.json](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/app.json) — has `runtimeVersion: "1.0.0"` but no `updates` block with `url` or `channel` configuration.

**Impact:** Cannot push OTA hotfixes without requiring a full Play Store build submission.

---

## 2. NETWORK RESILIENCE

### FINDING NET-01 — No Axios Request Timeout (HIGH)

**Evidence:** [client.js L7-12](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/api/client.js#L7-L12) — `axios.create()` has no `timeout` property.

**Impact:** If the backend hangs or the network is degraded, HTTP requests will wait **indefinitely**. Combined with loading spinners on every screen, this creates permanent app lockups in field conditions.

**Required Fix:** Add `timeout: 15000` (15 seconds) to the Axios instance.

---

### FINDING NET-02 — React Query Retry Limited to 1 (LOW)

**Evidence:** [App.js L16-23](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/App.js#L16-L23) — `retry: 1`.

**Impact:** On a poor 3G connection, a single retry may be insufficient. However, increasing too aggressively risks hammering the server.

**Assessment:** Acceptable for V1. Consider `retry: 2` with exponential backoff for V2.

---

### FINDING NET-03 — No Network Awareness (HIGH)

**Evidence:** Zero `NetInfo` usage found in the entire codebase.

**Impact:** Salesmen in rural India will tap "Check In" or "Submit Order" with no cellular signal and receive cryptic Axios errors instead of a clear "You are offline" message. No offline banner, no connectivity listener, no preemptive blocking.

**Required Fix:** Install `@react-native-community/netinfo`, add a global `NetInfo.addEventListener` listener, and display an offline banner when disconnected.

---

## 3. SESSION SECURITY

### FINDING SEC-01 — Tokens in AsyncStorage (Not Encrypted) (MEDIUM)

**Evidence:** [useAuthStore.js L39](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/store/useAuthStore.js#L39) — `AsyncStorage.setItem('accessToken', accessToken)`

**Impact:** AsyncStorage on Android writes to an unencrypted SQLite database in the app's data directory. A rooted device or a physical attacker can extract JWT tokens directly from disk.

**Required Fix:** Migrate to `expo-secure-store` for token storage. Keep AsyncStorage for non-sensitive user preferences only.

---

### FINDING SEC-02 — Logout Cleanup is Sound (PASS)

**Evidence:** [useAuthMutations.js L53-57](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/modules/auth/hooks/useAuthMutations.js#L53-L57) — `logout()` + `clearCart()` + `queryClient.clear()`.

**Assessment:** Complete. No data bleed risk remains.

---

## 4. NAVIGATION STABILITY

### FINDING NAV-01 — Legacy `AppContext` Still Mounted (MEDIUM)

**Evidence:** [App.js L89](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/App.js#L89) — `<AppProvider>` wraps the entire app. 14 legacy screens in `src/screens/` still import and consume `AppContext`.

**Impact:** The legacy `AppProvider` consumes memory and performs its own `AsyncStorage` load/save cycle (confirmed in `AppContext.js` L36-45) independently of the modern Zustand stores. While the legacy screens are only reachable from the `AdminNavigator`, the Provider is always mounted, adding unnecessary overhead for Salesman sessions.

---

### FINDING NAV-02 — Admin Stack Uses Conflicting Screen Name (MEDIUM)

**Evidence:** [RootNavigator.js L61](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/navigation/RootNavigator.js#L61) — Admin stack registers `OrderDetailsScreen` as `name="OrderDetails"`. [RootNavigator.js L45](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/navigation/RootNavigator.js#L45) — Salesman stack registers same component as `name="OrderDetailsScreen"`.

**Impact:** Different route names for the same component across stacks creates confusion and means shared navigation logic (like `goBack()` fallback) must account for both names.

---

### FINDING NAV-03 — Remaining Placeholder Actions (LOW)

**Evidence:** [SalesmanHomeScreen.js L220, L227, L236](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/modules/salesman/screens/SalesmanHomeScreen.js#L220) — "Create Order" (from dashboard, outside of a visit), "Add Shop", and "View All Orders" buttons still call `handlePlaceholderAction()`.

**Impact:** User-facing dead ends. "Create Order" from the dashboard is architecturally intentional (orders must be created within a visit context), but the button misleadingly exists.

---

## 5. ERROR HANDLING

### FINDING ERR-01 — No Global Error Boundary (HIGH)

**Evidence:** Zero `ErrorBoundary` components found. Zero Sentry/Crashlytics integrations found.

**Impact:** Any unhandled JS exception (e.g., a `null` reference in a rendering cycle) will produce a white screen with no recovery path. In production, these errors will be invisible — no crash reports, no telemetry, no diagnostics.

**Required Fix:** Implement a React `ErrorBoundary` class component wrapping `<MainApp />`. Consider integrating `sentry-expo` for crash reporting.

---

### FINDING ERR-02 — Missing Error States on Core Screens (HIGH)

**Evidence:**

| Screen | `isLoading` handled? | `isError` handled? |
|:---|:---|:---|
| SalesmanHomeScreen | ✅ | ❌ |
| StartVisitScreen | ✅ | ❌ |
| ActiveVisitScreen | ✅ | ❌ |
| ProductCatalogueScreen | ✅ | ❌ |
| OrderDetailsScreen | ✅ | ❌ |
| OrderRevisionsScreen | ✅ | ❌ |
| CartReviewScreen | ✅ | ❌ |

The `Pending` module screens (CatalogueScreen, DerivedManufacturerScreen) **do** handle `isError`. But all 7 core Salesman workflow screens silently swallow query errors and display an eternal loading spinner or blank content.

**Impact:** If the backend is down or returns a 500, the user sees a perpetual loading spinner with no actionable feedback.

---

### FINDING ERR-03 — Console Statements in Production Code (LOW)

**Evidence:** 7 `console.error`/`console.warn` statements found across `useAuthStore.js`, `useAuthMutations.js`, `AppContext.js`, `ProductListingScreen.js`.

**Impact:** Minor performance overhead. These should be stripped in production builds or routed through a logging service.

---

## 6. LOCATION SERVICES

### FINDING LOC-01 — GPS Implementation is Sound (PASS)

**Evidence:** [locationUtils.js](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/src/utils/locationUtils.js) — 10s `Promise.race` timeout, permission denial throws with clear message, all 5 mutation screens consume the utility.

**Assessment:** Fully compliant. No issues found.

---

## 7. BUILD & RELEASE READINESS

### FINDING BUILD-01 — Critical Dependencies Missing from package.json (CRITICAL)

**Evidence:** [package.json](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/package.json) — The following runtime imports are used throughout the codebase but are **not listed** in `dependencies`:

| Package | Used In | Listed? |
|:---|:---|:---|
| `axios` | `client.js` | ❌ |
| `zustand` | `useAuthStore.js`, `useCartStore.js` | ❌ |
| `@tanstack/react-query` | `App.js`, all hooks | ❌ |
| `expo-crypto` | 4 screens | ❌ |

**Impact:** A fresh `npm install` on a CI/CD pipeline or a new developer machine will **fail to build**. These packages are likely installed in `node_modules` via a prior manual `npm install` but were never added to `package.json`. This is a **deployment-blocking** issue for any automated build pipeline (including EAS Build).

---

### FINDING BUILD-02 — Expo SDK Version is Outdated (HIGH)

**Evidence:** [package.json L18](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/package.json#L18) — `"expo": "^49.0.0"`.

**Impact:** Expo SDK 49 reached end-of-life. EAS Build servers may deprecate support. Critical security patches and performance improvements in SDKs 50-52 are not available. `expo-location` and `expo-crypto` compatibility may drift.

---

### FINDING BUILD-03 — Missing `expo-updates` Configuration (MEDIUM)

**Evidence:** No `expo-updates` in `package.json`. No `updates` block in `app.json`.

**Impact:** Cannot deliver OTA hotfixes. Every bug fix requires a full EAS Build + Play Store submission cycle (1-3 day review).

---

### FINDING BUILD-04 — Android `edgeToEdgeEnabled` Without SafeArea Handling (LOW)

**Evidence:** [app.json L14](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Frontend/app.json#L14) — `"edgeToEdgeEnabled": true`. All screens use `SafeAreaView` so this is likely fine, but should be verified on physical devices with notches/navigation bars.

---

## ISSUE CLASSIFICATION SUMMARY

| Severity | Count | IDs |
|:---|:---|:---|
| **CRITICAL** | 2 | ENV-01, BUILD-01 |
| **HIGH** | 5 | ENV-02, NET-01, NET-03, ERR-01, ERR-02, BUILD-02 |
| **MEDIUM** | 4 | ENV-03, SEC-01, NAV-01, NAV-02, BUILD-03 |
| **LOW** | 4 | NET-02, NAV-03, ERR-03, BUILD-04 |
| **PASS** | 2 | SEC-02, LOC-01 |

---

## FILE ACTION MATRIX

| File | Action | Priority | Issue |
|:---|:---|:---|:---|
| `src/api/client.js` | Add env-based URL + request timeout | CRITICAL | ENV-01, NET-01 |
| `package.json` | Add missing dependencies (axios, zustand, @tanstack/react-query, expo-crypto) | CRITICAL | BUILD-01 |
| `app.json` | Add updates channel + bump SDK consideration | HIGH | ENV-03, BUILD-02, BUILD-03 |
| `eas.json` | Add env-specific build profiles | HIGH | ENV-02 |
| `App.js` | Add ErrorBoundary wrapper + consider removing AppProvider | HIGH | ERR-01, NAV-01 |
| `src/store/useAuthStore.js` | Migrate token storage to expo-secure-store | MEDIUM | SEC-01 |
| `src/navigation/RootNavigator.js` | Standardize OrderDetails screen name | MEDIUM | NAV-02 |
| All 7 Salesman screens | Add `isError` state handling | HIGH | ERR-02 |
| *New file* `src/components/OfflineBanner.js` | Network awareness UI | HIGH | NET-03 |
| `SalesmanHomeScreen.js` | Clean up misleading placeholder buttons | LOW | NAV-03 |

---

## PRODUCTION READINESS SCORE

# 58 / 100

**Breakdown:**

| Area | Score | Weight | Weighted |
|:---|:---|:---|:---|
| Environment Config | 10/100 | 20% | 2.0 |
| Network Resilience | 50/100 | 15% | 7.5 |
| Session Security | 85/100 | 15% | 12.75 |
| Navigation Stability | 80/100 | 10% | 8.0 |
| Error Handling | 30/100 | 15% | 4.5 |
| Location Services | 100/100 | 10% | 10.0 |
| Build Readiness | 25/100 | 15% | 3.75 |
| | | **Total** | **58/100** |

> [!CAUTION]
> The two CRITICAL findings (hardcoded localhost URL and missing package.json dependencies) are **absolute deployment blockers**. The app literally cannot function on a real device or build on a CI pipeline in its current state. These must be resolved before any staging or production deployment.

---

## RECOMMENDED FRONTEND-ONLY ROADMAP

### Phase 10A — Deployment Blockers (CRITICAL)
1. Add `axios`, `zustand`, `@tanstack/react-query`, `expo-crypto` to `package.json`
2. Replace hardcoded `localhost` URL with environment-aware configuration
3. Add `timeout: 15000` to Axios instance

### Phase 10B — Production Safety (HIGH)
4. Add global React `ErrorBoundary` component
5. Add `isError` handling to all 7 core Salesman screens
6. Install `@react-native-community/netinfo` + implement offline banner
7. Add EAS environment-specific build profiles

### Phase 10C — Security & Polish (MEDIUM)
8. Migrate token storage to `expo-secure-store`
9. Clean up or remove legacy `AppProvider` from Salesman sessions
10. Standardize Admin/Salesman route naming
11. Configure `expo-updates` for OTA delivery

### Phase 10D — Operational Excellence (LOW)
12. Strip `console.*` statements or route through logging service
13. Evaluate Expo SDK upgrade path (49 → 52)
14. Integrate `sentry-expo` for crash reporting
15. Clean up placeholder buttons on dashboard
