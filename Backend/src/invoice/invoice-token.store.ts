import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

interface TokenEntry {
  filePath: string;
  expiresAt: number; // epoch ms
}

/** TTL for temporary invoice tokens and their PDF files: 15 minutes */
const TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * In-memory store for single-use, short-lived invoice download tokens.
 *
 * Design decisions:
 * - No Redis dependency — fits the existing architecture.
 * - Tokens are UUID v4 — cryptographically random, not guessable.
 * - Each token maps to exactly one temp PDF file.
 * - `consume()` atomically returns + deletes the entry (single-use guarantee).
 * - Server restart: the in-memory store is empty after restart, but
 *   InvoiceService.cleanTempDirOnStartup() handles file cleanup.
 */
@Injectable()
export class InvoiceTokenStore {
  private readonly logger = new Logger(InvoiceTokenStore.name);
  private readonly store = new Map<string, TokenEntry>();

  /**
   * Create a new single-use token for the given temp PDF file.
   * @param filePath Absolute path to the temporary PDF file.
   * @returns The opaque download token (UUID v4).
   */
  create(filePath: string): string {
    const token = uuidv4();
    this.store.set(token, {
      filePath,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });
    return token;
  }

  /**
   * Atomically consume a token.
   * Returns the file path and removes the token so it cannot be reused.
   * Returns null if the token is not found or has expired.
   */
  consume(token: string): string | null {
    const entry = this.store.get(token);
    if (!entry) return null;

    // Remove immediately — single-use
    this.store.delete(token);

    // Reject expired tokens
    if (Date.now() > entry.expiresAt) {
      this.logger.warn(`Token expired: ${token}`);
      this.safeDeleteFile(entry.filePath);
      return null;
    }

    return entry.filePath;
  }

  /**
   * Validate that a token exists without consuming it.
   * Used only for health/debug purposes.
   */
  has(token: string): boolean {
    const entry = this.store.get(token);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(token);
      return false;
    }
    return true;
  }

  /**
   * Delete all expired in-memory entries and their corresponding temp files.
   * Called periodically by InvoiceService cron job.
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [token, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(token);
        this.safeDeleteFile(entry.filePath);
        this.logger.debug(`Cleaned expired token entry and file: ${entry.filePath}`);
      }
    }
  }

  /** Returns the number of live entries in the store (for diagnostics). */
  size(): number {
    return this.store.size;
  }

  private safeDeleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      this.logger.warn(`Failed to delete temp invoice file: ${filePath} — ${err.message}`);
    }
  }
}
