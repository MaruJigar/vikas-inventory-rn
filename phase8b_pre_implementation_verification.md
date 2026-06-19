# PHASE 8B PRE-IMPLEMENTATION VERIFICATION

## PART 1 — Verify Backend Alignment

Based on the inspection of the current backend codebase:

1. `verification_photo_url` is no longer required: **FAIL** 
   *(Evidence: `create-shop.dto.ts` uses `@IsNotEmpty()`; `shop.service.ts` throws `BadRequestException` if falsy)*
2. Shop creation succeeds without image: **FAIL** 
   *(Evidence: Fails service-level and DTO validation)*
3. Entity allows null: **FAIL** 
   *(Evidence: `shop.entity.ts` lacks `nullable: true` on the `verification_photo_url` column)*
4. Upload endpoint remains operational: **PASS** 
   *(Evidence: `POST /shop-images/:shopId/upload` exists in `shop-image.controller.ts`)*

**OVERALL BACKEND ALIGNMENT: FAIL**
*Note: The backend owner states the backend "is being updated", but those updates are **not yet present** in the current repository code.*

---

## PART 2 — Shops Module Readiness

**Frontend Dependencies Status:**
- `expo-image-picker`: ❌ NOT INSTALLED
- `expo-camera`: ❌ NOT INSTALLED
- React Query mutation support: ❌ MISSING (`useShopMutations` needs to be created)
- Navigation integration: ❌ MISSING (Shop screens not in `RootNavigator`)

**Frontend Readiness Score: 0 / 100**
*The frontend lacks the core native libraries required to interact with the device camera or photo gallery.*

---

## PART 3 — Final Shops Blueprint (Based on New Architecture)

Once the backend updates are pulled, the frontend will execute the following architecture:

### 1. Duplicate Check Flow
- **Screen:** `ShopDuplicateCheckScreen.js` (Step 1)
- **Action:** User enters Shop Name, Phone, and GPS Location.
- **Hook:** `useCheckDuplicateMutation` calls `POST /shops/check-duplicate`.
- **Result:** If duplicate found, show warning modal. User can cancel or proceed with `duplicate_bypass` flag.

### 2. Shop Registration Flow
- **Screen:** `ShopRegistrationScreen.js` (Step 2)
- **Action:** User fills remaining details (Address, City, State, GST).
- **Hook:** `useCreateShopMutation` calls `POST /shops` (sending NO photo).
- **Result:** Backend successfully creates the shop and returns the `shop.id`.

### 3. Image Capture Flow
- **Screen:** `ShopRegistrationScreen.js` (Step 3 - immediately following successful creation)
- **Action:** Launch `expo-image-picker` to capture the shop verification photo.
- **Service:** Compress image locally using `expo-image-manipulator` (optional but recommended) or directly prepare `FormData`.

### 4. Upload Flow
- **Action:** Send `FormData` to `POST /shop-images/:shopId/upload` using the newly acquired `shop.id`.
- **Result:** Image is uploaded and the backend securely associates it with the Shop entity.

### 5. Success Flow
- **Query Invalidation:** Call `queryClient.invalidateQueries(['shops'])` and `['dashboardAnalytics']`.
- **Navigation:** Alert success and execute `navigation.navigate('SalesmanHome')`.

---

## PART 4 — File Action Matrix

| Action | File Path | Purpose |
|:---|:---|:---|
| **MODIFY** | `Frontend/package.json` | Install `expo-image-picker`. |
| **CREATE** | `Frontend/src/modules/shop/services/shopService.js` | Axios calls for duplicate check, create shop, and image upload. |
| **CREATE** | `Frontend/src/modules/shop/hooks/useShopMutations.js` | React Query mutations for the 3-step sequence. |
| **CREATE** | `Frontend/src/modules/shop/screens/ShopRegistrationScreen.js` | Multi-step form handling duplicate check → creation → image capture → upload. |
| **MODIFY** | `Frontend/src/navigation/RootNavigator.js` | Register `ShopRegistrationScreen` in `SalesmanNavigator`. |
| **MODIFY** | `Frontend/src/modules/salesman/screens/SalesmanHomeScreen.js` | Wire the "Add Shop" button to navigate to `ShopRegistrationScreen`. |
