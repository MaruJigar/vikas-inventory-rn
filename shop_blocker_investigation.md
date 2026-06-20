# SHOPS MODULE BLOCKER INVESTIGATION

## 1. ROOT CAUSE ANALYSIS

The contradiction stems from a mismatch between the **Shop Creation Validation** and the **Upload Architecture**.

1. **Validation Layer:** `CreateShopDto` strictly enforces `@IsNotEmpty()` on `verification_photo_url`. Furthermore, `shop.service.ts` line 38 manually enforces: `if (!dto.verification_photo_url) throw new BadRequestException(...)`. Finally, the database entity `shop.entity.ts` defines the column without `nullable: true`, meaning PostgreSQL enforces a strict `NOT NULL` constraint.
2. **Upload Layer:** The only upload logic in the entire backend is inside `shop-image.controller.ts`. This endpoint is strictly defined as `@Post(':shopId/upload')`. 

**Root Cause:** The backend developer built the `ShopImage` feature as a *relational* upload (meaning it requires an existing parent entity ID to attach the file to). However, they simultaneously built the `Shop` creation feature requiring the photo URL upfront, creating a classic Catch-22 dead-lock.

---

## 2. ACTUAL INTENDED WORKFLOW (RECONSTRUCTED)

Based on the codebase evidence, the backend does **not** natively support creating a shop using its own multipart upload. The actual intended workflow is one of two scenarios:

**Scenario A (Client-Side Storage):**
The developer intended the React Native frontend to bypass the backend for the actual file upload.
1. Frontend captures photo.
2. Frontend uploads photo directly to Firebase Storage (or AWS S3) via client-side SDKs.
3. Frontend receives the external CDN URL.
4. Frontend submits the CDN URL to `POST /shops`.
*(Note: The `POST /shop-images/:shopId/upload` endpoint was likely built for a different feature, like adding gallery images later, and mistakenly assumed to be the primary upload route).*

**Scenario B (The "Dummy String" Hack):**
1. Frontend submits `POST /shops` with `verification_photo_url: "pending_upload"`.
2. Backend creates the shop and returns the `shopId`.
3. Frontend calls `POST /shop-images/:shopId/upload` with the image file.
4. Frontend calls `PATCH /shops/:shopId` to update `verification_photo_url` with the real URL.
*(Note: This is a hack because the `upload.service.ts` does NOT automatically patch the Shop record upon upload. It only creates an `UploadedFile` record).*

---

## 3. BACKEND DEFECT REPORT

*   **Defect 1:** Catch-22 Dependency. The upload controller requires a Shop ID, but the Shop controller requires an upload URL.
*   **Defect 2:** Orphaned Uploads. `upload.service.ts` line 19 saves an `UploadedFile` entity but completely fails to synchronize the generated URL back to the `verification_photo_url` column of the parent `Shop`.
*   **Defect 3:** Missing Global Upload. There is no generic `POST /media/upload` endpoint to stage files before entity creation.

---

## 4. RECOMMENDED BACKEND FIX

The backend must be modified to resolve this safely.

**Recommendation:** Create a Staging Upload Endpoint.
1. Add a new route: `POST /upload/staging`
2. This route accepts a multipart file, saves it to `/uploads/`, and returns `{ fileUrl: "/uploads/xyz.jpg" }`.
3. The frontend calls this endpoint first.
4. The frontend passes the returned `fileUrl` into `POST /shops`.

*Alternative (If backend cannot be touched):* We must use Scenario B (The "Dummy String" Hack) where we pass `"pending"` to bypass validation, get the ID, upload the file, and then explicitly `PATCH` the shop.

---

## 5. FINAL GO / NO-GO DECISION

**NO-GO.**

The frontend cannot proceed until a decisive architectural direction is chosen. We cannot generate the implementation blueprint without knowing whether we are using Client-Side Firebase uploads, the Dummy String hack, or waiting for a Backend Staging Endpoint fix.
