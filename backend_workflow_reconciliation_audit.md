# BACKEND WORKFLOW RECONCILIATION AUDIT

## PART 1 — Reconcile Previous Findings

The backend owner has stated the official workflow is:
1. `POST /shops/check-duplicate`
2. `POST /shops`
3. Receive `shop.id`
4. `POST /shop-images/:shopId/upload`

**Backend Owner Constraints:**
- Frontend must NOT generate `verification_photo_url`
- Frontend must NOT create temporary URLs
- Frontend must NOT upload before shop creation
- Image upload occurs AFTER shop creation

**Reconciliation against Current Backend Code:**
There is a direct and fatal contradiction between the stated workflow and the actual backend codebase. The backend code enforces that a shop **cannot** be created without a photo URL already existing.

## PART 2 — Verify DTO Reality

**Question:** Can a shop be successfully created WITHOUT `verification_photo_url`?
**Answer: NO**

**Evidence 1: DTO Validation**
[`Backend/src/shop/dto/create-shop.dto.ts:L69-L72`](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Backend/src/shop/dto/create-shop.dto.ts#L69-L72)
```typescript
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Verification photo url' })
  verification_photo_url: string;
```
*Result:* The NestJS validation pipe will immediately reject any request where `verification_photo_url` is missing, null, or an empty string.

**Evidence 2: Service Validation**
[`Backend/src/shop/shop.service.ts:L49-L51`](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Backend/src/shop/shop.service.ts#L49-L51)
```typescript
    if (!dto.verification_photo_url) {
      throw new BadRequestException('Shop verification photo is mandatory');
    }
```
*Result:* Even if the DTO validation were bypassed, the service explicitly throws a 400 Bad Request if the field is falsy.

**Evidence 3: Database Constraint**
[`Backend/src/shop/shop.entity.ts:L66-L68`](file:///c:/Users/WELCOME/Desktop/vikas-inventory-rn/Backend/src/shop/shop.entity.ts#L66-L68)
```typescript
  @Column({ type: 'text' })
  @ApiProperty({ description: 'Verification photo url' })
  verification_photo_url: string;
```
*Result:* The database schema does not allow `NULL` values for this column.

**Conclusion on Execution Path:**
The backend owner claims step 2 is `POST /shops` and step 4 is `POST /shop-images/:shopId/upload`. However, `POST /shops` will fail with HTTP 400 because it strictly demands the `verification_photo_url` which the frontend is explicitly forbidden from generating or acquiring via staging.

## PART 3 — Determine True Blocker Status

**Status: A. BLOCKED**

**Explanation:**
The frontend cannot build the `ShopRegistrationScreen` API sequence because the sequence demanded by the backend owner is physically impossible to execute against their own backend code. 
- If the frontend calls `POST /shops` first, it crashes on validation.
- If the frontend calls `POST /shop-images/:shopId/upload` first, it crashes because it lacks a `shopId`.

## PART 4 — Shops Module Readiness Score

- **Backend Readiness Score:** 0 / 100 (Contract contradicts implementation)
- **Frontend Readiness Score:** 0 / 100 (Development frozen pending contract resolution)
- **Integration Readiness Score:** 0 / 100 (Impossible API sequence)

## PART 5 — Recommended Next Action

**Recommendation: 2. Request backend change**

**Evidence-Based Justification:**
The backend owner is requesting a workflow (create entity -> upload media) that their own DTOs, Services, and Database strictly prohibit. 

To make the backend owner's workflow possible, the backend owner MUST implement one of the following:
1. **Drop the constraints:** Remove `@IsNotEmpty()` from `CreateShopDto`, remove the `BadRequestException` from `shop.service.ts`, and make `verification_photo_url` nullable in `shop.entity.ts` so `POST /shops` can succeed.
2. **Implement the staging endpoint:** Add `POST /upload/staging` so the frontend can retrieve the URL *before* calling `POST /shops`, satisfying the existing strict constraints.

Until the backend developer aligns their code with their stated workflow, the frontend Shops module cannot be implemented.
