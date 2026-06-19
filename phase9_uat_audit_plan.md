# PHASE 9: UAT & PRODUCTION HARDENING AUDIT

This document serves as the master test plan for the Field Sales Platform (Salesman Flow) prior to production deployment.

---

## 1. END-TO-END TEST MATRIX

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **E2E-01** | **Perfect Day Workflow** | Logged in as Salesman, 9:00 AM. | 1. Tap Check In.<br>2. Select Shop & Start Visit.<br>3. Create Order, add 2 items, submit.<br>4. Tap End Visit.<br>5. Tap Check Out. | Complete cycle succeeds without errors. Dashboards update instantly. | Pass: Backend reflects CheckIn, Visit, Order, VisitEnd, CheckOut. |
| **E2E-02** | **No-Order Visit** | Logged in, Checked In. | 1. Start Visit.<br>2. Tap No Order Reason.<br>3. Select "Shop Closed" and submit. | Visit closes successfully. Order button not required. | Pass: Backend Visit status is `COMPLETED`, No-Order Reason logged. |
| **E2E-03** | **Order Cancellation** | Logged in, Active Visit, Order Submitted. | 1. Go to Order Details.<br>2. Tap Cancel Order.<br>3. Enter reason. | Order status changes to `CANCELLED`. Visit can still be ended. | Pass: Status updates in UI and DB. |

---

## 2. NEGATIVE TEST MATRIX

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NEG-01** | **End Visit without Order** | Active Visit, no items in cart. | 1. Tap standard End Visit. | App rejects action. | Pass: Modal/Alert appears: "Cannot close visit without order." |
| **NEG-02** | **Multiple Check-Ins** | Already Checked In. | 1. Attempt to trigger Check In again. | Action disabled or blocked. | Pass: "Check In" button is replaced by "Check Out". |
| **NEG-03** | **Start Visit without Check-In** | Logged in, NOT Checked In. | 1. Navigate to Start Visit. | Action blocked. | Pass: User is forced to Check In first. |

---

## 3. SECURITY VERIFICATION MATRIX

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **JWT Expiration Handling** | Logged in, token is artificially expired. | 1. Trigger an API call (e.g., fetch shops). | Axios interceptor catches 401, attempts refresh, retries. | Pass: Seamless refresh OR graceful logout if refresh fails. |
| **SEC-02** | **Token Storage** | Logged in. | 1. Inspect local device storage. | Tokens are stored in secure AsyncStorage. | Pass: No plain-text tokens in standard `localStorage`. |
| **SEC-03** | **Distributor Data Isolation** | Salesman belongs to Distributor A. | 1. Call `GET /shops`. | Only shops belonging to Distributor A are returned. | Pass: No cross-tenant data bleed. |

---

## 4. NAVIGATION VERIFICATION MATRIX

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NAV-01** | **Hardware Back Button (Android)** | On ActiveVisitScreen. | 1. Press Android Hardware Back button. | Prevented from escaping active visit context unless through explicit End/No-Order action. | Pass: Screen focus remains locked or goes to Home while visit stays active. |
| **NAV-02** | **Admin Navigation Stack** | Logged in as Admin. | 1. Go to OrderDetails.<br>2. Tap Back. | Returns to Admin Home, NOT Salesman Home. | Pass: `navigation.goBack()` works safely. |

---

## 5. OFFLINE & NETWORK FAILURE MATRIX

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NET-01** | **Network Drop during Mutation** | Active Visit, about to submit order. | 1. Turn on Airplane Mode.<br>2. Submit Order. | App catches network error gracefully. | Pass: "Network Error" alert. App does not crash. |
| **NET-02** | **Idempotency on Retry** | Poor 3G connection. | 1. Tap Check In.<br>2. Request times out, but backend received it.<br>3. React Query retries. | Backend identifies duplicate `idempotency_key` and returns success without creating a second Check In. | Pass: Exactly ONE Check In record in database. |

---

## 6. GPS FAILURE MATRIX

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GPS-01** | **GPS Permission Denied** | App installed fresh. | 1. Tap Check In.<br>2. Deny location permission. | Graceful error. | Pass: Alert: "GPS permission required." Mutation does not fire. |
| **GPS-02** | **GPS Hang / Timeout** | In a concrete basement. | 1. Tap Check In.<br>2. Wait 10 seconds. | Location utility `Promise.race` triggers timeout. | Pass: Alert: "Failed to acquire location." Loading spinner stops. |
| **GPS-03** | **Fake GPS Mocking** | Mock Location app active. | 1. Tap Start Visit. | Backend receives coordinates. *(Note: Advanced mock detection is out of scope for Phase 9).* | Pass: App processes coordinates regardless of origin. |

---

## 7. SESSION MANAGEMENT VERIFICATION

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SES-01** | **Shared Device Data Bleed** | Salesman A logged in. | 1. Add item to cart.<br>2. Logout.<br>3. Salesman B logs in.<br>4. Check Cart. | Cart is completely empty. React Query cache is empty. | Pass: `useCartStore.clear()` and `queryClient.clear()` fire successfully on logout. |

---

## 8. ROLE-BASED ACCESS VERIFICATION

| Test ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RBA-01** | **Salesman Accessing Admin** | Logged in as `SALESMAN`. | 1. Attempt to navigate to `AdminDashboard`. | Navigation fails/Route does not exist in Salesman Stack. | Pass: Strict stack separation enforced in `RootNavigator`. |
| **RBA-02** | **Pending Approval Status** | User registered, backend status `PENDING`. | 1. Open App. | App displays `PendingApprovalScreen`. | Pass: Cannot access Salesman tools. |

---

## 9. PRODUCTION READINESS CHECKLIST

- [x] **Idempotency Keys:** UUID generated *outside* mutation functions.
- [x] **Session Isolation:** Cache clearing on logout verified.
- [x] **GPS Timeouts:** 10s maximum wait time implemented globally.
- [x] **Environment Variables:** Production backend URLs configured securely.
- [ ] **Offline DB (WatermelonDB):** *(Deferred to Post-V1)*.
- [ ] **FCM Push Notifications:** *(Deferred to Post-V1)*.
- [ ] **Shops Module:** *(Blocked - Awaiting Backend Staging Endpoint)*.

---

## 10. CRITICAL RISK ASSESSMENT

1. **Network Brittleness:** Without WatermelonDB, the app is 100% reliant on an active 4G/5G connection. A salesman entering a rural area or basement will be completely blocked from taking orders.
2. **Shop Onboarding Block:** Until Jigar implements the `POST /upload/staging` endpoint, salesmen cannot add new customers to the system, restricting business expansion.
3. **App Updates:** Expo EAS Update channels need to be configured so hotfixes (like the upcoming Shops module) can be pushed OTA without requiring Google Play Store approval delays.
