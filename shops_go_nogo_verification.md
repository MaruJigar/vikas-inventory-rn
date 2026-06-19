# SHOPS GO/NO-GO VERIFICATION (FINAL)

## PART 1 — DTO VERIFICATION

1. **Does `verification_photo_url` still exist?** YES
2. **Is `@IsNotEmpty()` removed?** NO
3. **Is `@IsOptional()` present?** NO
4. **Can `POST /shops` succeed without `verification_photo_url`?** NO

**Exact Code Snippet:** (`Backend/src/shop/dto/create-shop.dto.ts` lines 69-72)
```typescript
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Verification photo url' })
  verification_photo_url: string;
```

---

## PART 2 — SERVICE VERIFICATION

1. **Is the validation removed?** NO
2. **Does `createShop` still reject missing photo?** YES
3. **Does `createShop` allow creation without image?** NO

**Exact Code Snippet:** (`Backend/src/shop/shop.service.ts` lines 49-51)
```typescript
    if (!dto.verification_photo_url) {
      throw new BadRequestException('Shop verification photo is mandatory');
    }
```

---

## PART 3 — ENTITY VERIFICATION

1. **Is `verification_photo_url` nullable?** NO
2. **Exact column definition:** `@Column({ type: 'text' })`
3. **Migration present?** NO

**Exact Code Snippet:** (`Backend/src/shop/shop.entity.ts` lines 66-68)
```typescript
  @Column({ type: 'text' })
  @ApiProperty({ description: 'Verification photo url' })
  verification_photo_url: string;
```

---

## PART 4 — SHOP IMAGE UPLOAD VERIFICATION

1. **Upload field name:** `file`
2. **Accepted mime types:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp` (mapped via `mimeToExt`)
3. **Max file size:** Fallback to NestJS defaults.
4. **Response structure:** Returns the created `UploadedFile` JSON entity.
5. **Does upload automatically update `shop.verification_photo_url`?** **NO**
6. **Exact code path proving the update:** The update does not exist. The service exclusively saves to `fileRepo` and never queries or patches the `Shop` repository.

**Exact Code Snippet:** (`Backend/src/shop-image/upload.service.ts` lines 69-83)
```typescript
    const uploaded = this.fileRepo.create({
      uploaded_by_user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      file_type: 'IMAGE',
      original_file_name: file.originalname,
      file_url: fileUrl,
      // ...
    });
    await this.fileRepo.save(uploaded);
    return uploaded;
```

---

## PART 5 — FRONTEND READINESS

- `expo-image-picker`: **MISSING** (Not in `package.json`)
- `shop service`: **PARTIAL** (`shopService.js` exists but is a stub)
- `shop hooks`: **PARTIAL** (`useShopQueries.js` exists, `useShopMutations.js` missing)
- `shop screens`: **MISSING** (`ShopRegistrationScreen` does not exist)
- `navigator entries`: **MISSING** (No screens registered in `RootNavigator.js`)

---

## PART 6 — FINAL DECISION

# NO-GO

**Evidence Summary:** 
The Shops Module cannot be started. The required workflow is strictly forbidden by the backend codebase. `@IsNotEmpty()` remains in the DTO, `BadRequestException` remains in the Service, and the Entity column remains `NOT NULL`. Furthermore, the upload service physically does not update the Shop entity as claimed. Development on the frontend Shops Module remains fundamentally impossible under the current codebase.
