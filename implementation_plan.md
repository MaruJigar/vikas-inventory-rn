# Phase 8B: Shops Module Implementation Plan

This plan details the exact steps to implement the verified Shops Module contract (Create Shop → Upload Image) inside the React Native frontend.

> [!WARNING]
> **Dependency Blocker Warning**
> The current repository is missing `axios`, `zustand`, `@tanstack/react-query`, and `expo-crypto` from `package.json`, along with the `expo-image-picker` required for this feature. I will run the required `npx expo install` commands to resolve these missing dependencies before writing the code.
> 
> Furthermore, the hardcoded API URL is `http://localhost:3000/api/v1` which will return a 404 for all requests (since the backend does not use `/api/v1`). I will fix this in `client.js` by removing the `/api/v1` suffix so that you can actually test this implementation.

## User Review Required
Please review the proposed UI flow below. If the exact separation of the "Duplicate Check" screen and the "Registration" screen is acceptable, approve this plan so I can begin execution.

## Proposed Changes

### 1. Dependencies and API Configuration
- Install `expo-image-picker`.
- Install missing core dependencies (`axios`, `zustand`, `@tanstack/react-query`, `expo-crypto`).
- Fix the `API_BASE_URL` in `src/api/client.js` to point to `http://localhost:3000` (removing the invalid `/api/v1` suffix) to prevent 404 errors.

---

### 2. Services and Hooks

#### [NEW] `src/modules/shop/services/shopService.js`
Define the required REST API calls:
- `checkDuplicate(data)`: `POST /shops/check-duplicate`
- `createShop(data)`: `POST /shops`
- `uploadShopImage(shopId, fileUri)`: `POST /shop-images/:shopId/upload` using `FormData`.
- `getShops(params)`: `GET /shops`
- `getShopById(id)`: `GET /shops/:id`

#### [NEW] `src/modules/shop/hooks/useShopMutations.js`
Create React Query wrappers:
- `useCheckDuplicateMutation`
- `useCreateShopMutation`
- `useUploadShopImageMutation`
Configure `onSuccess` on the upload mutation to `queryClient.invalidateQueries({ queryKey: ['shops'] })`.

---

### 3. UI Screens

#### [NEW] `src/modules/shop/screens/ShopDuplicateCheckScreen.js`
**Purpose:** Initial data entry to prevent duplicate shops.
- Form fields: Name, Phone.
- Action: Fetch GPS coordinates on load via `getSafeLocation`.
- On Submit: Call `checkDuplicate`.
- If matches found: Display a list of matches with `match_score` and `match_type`. Show buttons for "Cancel" and "Create Anyway".
- On "Create Anyway" (or if no matches): Navigate to `ShopRegistrationScreen` passing the collected details and the `duplicate_bypass` object.

#### [NEW] `src/modules/shop/screens/ShopRegistrationScreen.js`
**Purpose:** Finalizing shop data and capturing the photo.
- Form fields: Address (required), Owner Name, City, State, GST Number.
- Action: Button to launch `expo-image-picker` and capture/select an image.
- Validation: Prevent submission unless an image is captured and address is provided.
- On Submit: 
  1. Call `createShop` (without image).
  2. Receive `shop.id`.
  3. Call `uploadShopImage` using the received ID and image URI.
  4. Navigate back to `SalesmanHomeScreen` (or `ShopsListScreen` if available).

---

### 4. Navigation & Integration

#### [MODIFY] `src/navigation/SalesmanNavigator.js`
- Register `ShopDuplicateCheckScreen` and `ShopRegistrationScreen` into the stack.

#### [MODIFY] `src/modules/salesman/screens/SalesmanHomeScreen.js`
- Add a "Register Shop" action button in the Quick Actions grid to route to `ShopDuplicateCheckScreen`.

## Verification Plan
1. **Dependency Verification:** Ensure `npm start` executes successfully without "Module not found" errors.
2. **Duplicate Check Verification:** Attempt to register a shop with an existing phone number to trigger the duplicate modal.
3. **Creation & Upload Verification:** Complete the "Create Anyway" flow, capture an image, submit, and verify the backend database receives the shop with `verification_status: 'VERIFIED'`.
