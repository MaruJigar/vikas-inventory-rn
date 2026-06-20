# BACKEND CHANGE SPECIFICATION: SHOP PHOTO UPLOAD CONTRACT

## 1. ANALYSIS OF ALTERNATIVES

### Alternative A: Create `POST /upload/staging`
Create an endpoint that uploads a file and returns a temporary URL *without* requiring an entity ID.
*   **Complexity:** Low.
*   **Risk:** Low. (Only risk is orphaned files if the user abandons the form, which can be cleaned via a cron job).
*   **Backend Effort:** Low (Add one route to `shop-image.controller.ts`).
*   **Frontend Effort:** Medium (Frontend must sequence two calls: Upload → Create Shop).
*   **Production Suitability:** **High.** Preserves strict database validation and decouples media hosting from entity state.

### Alternative B: Make `verification_photo_url` nullable
Change the DB and DTO to allow shops without photos, then upload later.
*   **Complexity:** High (Requires DB migration).
*   **Risk:** High. If the app crashes between Shop Creation and Upload, a "zombie shop" without a photo exists permanently, violating business rules.
*   **Backend Effort:** High (TypeORM Migration, DTO modifications, Service modifications).
*   **Frontend Effort:** High (Create Shop → Check Success → Upload → Patch Shop).
*   **Production Suitability:** **Low.** Corrupts the core business rule that verification photos are strictly mandatory.

### Alternative C: Automatically patch Shop on Upload
Shop is created (requires making photo nullable), then `POST /shop-images/:shopId/upload` automatically patches the Shop entity.
*   **Complexity:** High (Requires DB migration + Circular dependencies in services).
*   **Risk:** High. Same zombie shop risk as Alternative B.
*   **Backend Effort:** High (DB migration, modify `upload.service.ts` to sync with `Shop` repo).
*   **Frontend Effort:** Medium (Create Shop → Upload).
*   **Production Suitability:** **Low.** Couples the generic `UploadService` directly to the `Shop` entity domain, causing architectural spaghetti.

### Alternative D: Direct-to-Cloud Upload (Firebase/S3)
Frontend uploads directly to a CDN and passes the URL to `POST /shops`.
*   **Complexity:** High for Frontend, Zero for Backend.
*   **Risk:** Medium (Requires secure presigned URLs or Firebase Auth configuration).
*   **Backend Effort:** Zero.
*   **Frontend Effort:** High (Implementing Native Firebase/AWS SDKs).
*   **Production Suitability:** **Very High.** Industry standard for enterprise mobile apps, bypassing Node.js memory limits.

---

## 2. ARCHITECTURE RECOMMENDATION

**Recommendation: Alternative A (`POST /upload/staging`)**

**Justification:** 
We must preserve the strict database domain rule that a Shop *cannot* exist without a verification photo. Alternatives B and C require database migrations that weaken data integrity. Alternative D requires extensive frontend DevOps (Firebase setup). Alternative A perfectly resolves the Catch-22 with minimal backend code while maintaining strict data integrity.

---

## 3. EXACT BACKEND TICKET SPECIFICATION

### Ticket Name:
**Feature:** Implement Global Staging Upload Endpoint

### Description:
The current `POST /shops` endpoint requires a `verification_photo_url`. However, the only upload endpoint is `POST /shop-images/:shopId/upload`, which requires a `shopId` to exist first. We need a staging endpoint to generate the URL before the shop is created.

### Acceptance Criteria:
1.  **New Endpoint:** Create `POST /upload/staging` inside a generic media/upload controller.
2.  **Request:** Accepts `multipart/form-data` with key `file`.
3.  **Processing:** Utilizes the existing `uploadService.processAndCompressImage`. Since there is no `entityId` yet, allow passing `null` or `'STAGING'` as the `entityId`.
4.  **Response:** Returns `{ url: string, id: string }` representing the CDN/local path to the compressed file.
5.  **No Schema Changes:** The `Shop` entity and `CreateShopDto` must remain exactly as they are (`verification_photo_url` remains strictly required).

---

## 4. FINAL GO / NO-GO DECISION

**Frontend Status: NO-GO.**

The frontend development of the Shops Module remains frozen. We cannot build the `ShopRegistrationScreen` API sequence until this backend staging endpoint is implemented and deployed.
