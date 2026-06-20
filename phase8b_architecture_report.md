# PHASE 8B: SHOPS MODULE DISCOVERY & ARCHITECTURE REPORT

## PART 1: BACKEND CONTRACT AUDIT

**Endpoint 1: `POST /shops/check-duplicate`**
*   **Roles:** `DISTRIBUTOR_ADMIN`, `SALESMAN`
*   **Request DTO:** `CheckDuplicateDto` (name, phone, latitude, longitude)
*   **Response DTO:** `Array<{ shop: Shop, match_type: string, match_score: number }>`
*   **Ownership:** Open to authorized roles.
*   **Validation:** Phone, Name, Lat, Lng.

**Endpoint 2: `POST /shops`**
*   **Roles:** `DISTRIBUTOR_ADMIN`, `SALESMAN`
*   **Request DTO:** `CreateShopDto` (name, phone, address, latitude, longitude, verification_photo_url, duplicate_bypass optional)
*   **Response DTO:** `Shop` entity
*   **Ownership:** `distributor_id` is automatically inferred from the Salesman's profile.
*   **Validation:** `verification_photo_url` is explicitly validated as `@IsNotEmpty()`.

---

## PART 2: DUPLICATE DETECTION AUDIT

*   **Fields Analyzed:** `phone`, `latitude`/`longitude`, `name`.
*   **Is GST considered?** No.
*   **Is shop name fuzzy matched?** Yes, uses `ILIKE %name%` (Match Score: 60).
*   **Is GPS considered?** Yes, uses PostGIS `ST_DWithin` for a 50-meter radius check (Match Score: 80).
*   **Is Phone considered?** Yes, exact match (Match Score: 100).
*   **Override Behavior:** Duplicates *can* be overridden. `CreateShopDto` accepts a `duplicate_bypass` object containing `matched_shop_id` and `match_type`. If provided, the backend logs the bypass in `ShopDuplicateLog` and creates the shop anyway.

---

## PART 3: PHOTO & MEDIA AUDIT

*   **Does backend require `verification_photo_url`?** Yes. It is strictly mandatory. `shop.service.ts` line 39 throws a `BadRequestException` if empty.
*   **Is there an upload endpoint?** Yes, `POST /shop-images/:shopId/upload` exists and expects a multipart `Express.Multer.File`.
*   **ARCHITECTURAL CONTRADICTION (CRITICAL GAP):** The upload endpoint requires a `:shopId` in the route parameter. However, you cannot get a `shopId` until you create a shop. And you cannot create a shop without providing a `verification_photo_url` in the initial `POST /shops` request.

---

## PART 4: SHOP LIFECYCLE AUDIT

**Creation Flow:**
Create Shop (with Bypass if needed) → DB Inserted → `verification_status` automatically hardcoded to `'VERIFIED'`.
*   **Are shops pending approval?** No. The backend explicitly saves new shops as `VERIFIED` by default.
*   **Can visits start immediately?** Yes. Once the `POST /shops` succeeds, it will immediately appear in `GET /shops` queries for that Salesman.

---

## PART 5: GPS COMPLIANCE AUDIT

*   **Latitude / Longitude:** Strictly required by `CreateShopDto`.
*   **Usage:** Natively converted into a PostGIS `Point` geometry.
*   **Requirement:** The frontend *must* acquire fresh foreground coordinates at the moment of shop registration to pass validation.

---

## PART 6: UI WORKFLOW DESIGN

Based on backend realities, the following 2-screen workflow is required:
1.  **`ShopDuplicateCheckScreen`**: Collects Name, Phone, and acquires GPS. Fires `POST /shops/check-duplicate`. 
    *   *If 0 matches:* Proceed to next screen.
    *   *If >0 matches:* Display list. User can tap "Bypass & Create Anyway", carrying the highest-score match ID forward.
2.  **`ShopRegistrationScreen`**: Collects Address, City, State, GST, and handles Camera capture. Submits the final `POST /shops` payload.

---

## PART 7: STATE MANAGEMENT PLAN

*   **React Query:** Will govern `useShopMutations` (`checkDuplicateMutation` and `createShopMutation`).
*   **Zustand:** Unnecessary. State can be passed via `route.params` between the two screens (passing the `duplicateBypass` object forward if applicable).
*   **Photo Responsibilities:** Will rely on Expo Image Picker / Camera. 

---

## PART 8: RISK ANALYSIS

*   **Critical Risk:** The Photo Upload Catch-22. `CreateShopDto` demands a URL, but the native upload endpoint requires an ID.
*   **Missing Endpoints:** No pre-creation staging endpoint for media.

---

## PART 9: IMPLEMENTATION RECOMMENDATION

*   **Backend Readiness Score:** 85/100
*   **Technical Risk Score:** 60/100
*   **Business Value Score:** 100/100
*   **Go / No-Go Recommendation:** **NO-GO.**

### Blockers
Before we write any screen code, we must resolve the Photo Upload Contradiction. 

**How does the backend expect the `verification_photo_url` to be provided during `POST /shops`?**
1.  Should I pass a massive Base64 string directly in the JSON body?
2.  Should I pass a dummy string (e.g., `"pending"`) to bypass validation, get the `shopId`, and then immediately fire `POST /shop-images/:shopId/upload` in the background?

> [!WARNING]
> Please instruct me on how to handle the photo upload contradiction so I can convert this NO-GO into a GO and generate the Phase 8B Blueprint.
