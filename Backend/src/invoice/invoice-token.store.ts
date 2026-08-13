import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

interface TokenEntry {
  filePath: string;
  expiresAt: number; // epoch ms
}

/** TTL for temporary invoice tokens and their PDF files: 15 minutes */
const TOKEN_TTL_MS = 15 * 60 * 1000;
const tempDir = process.env.TEMP_INVOICE_DIR || path.join(tmpdir(), 'vikas-invoices');

/**
 * File-backed store for single-use, short-lived invoice download tokens.
 *
 * Design decisions:
 * - Uses the filesystem instead of an in-memory map to support PM2 cluster mode
 *   where multiple processes handle requests in round-robin fashion.
 * - Tokens are UUID v4 — cryptographically random, not guessable.
 * - Each token maps to exactly one temp PDF file.
 * - `consume()` atomically returns + deletes the entry (single-use guarantee).
 */
@Injectable()
export class InvoiceTokenStore {
  private readonly logger = new Logger(InvoiceTokenStore.name);

  constructor() {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  }

  private getTokenFilePath(token: string): string {
    // Ensure token is just a uuid, prevent path traversal
    const safeToken = token.replace(/[^a-zA-Z0-9-]/g, '');
    return path.join(tempDir, `${safeToken}.json`);
  }

  /**
   * Create a new single-use token for the given temp PDF file.
   * @param filePath Absolute path to the temporary PDF file.
   * @returns The opaque download token (UUID v4).
   */
  create(filePath: string): string {
    const token = uuidv4();
    const tokenPath = this.getTokenFilePath(token);
    
    const entry: TokenEntry = {
      filePath,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    };
    
    fs.writeFileSync(tokenPath, JSON.stringify(entry), 'utf8');
    return token;
  }

  /**
   * Atomically consume a token.
   * Returns the file path and removes the token so it cannot be reused.
   * Returns null if the token is not found or has expired.
   */
  consume(token: string): string | null {
    const tokenPath = this.getTokenFilePath(token);
    
    if (!fs.existsSync(tokenPath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(tokenPath, 'utf8');
      const entry: TokenEntry = JSON.parse(data);

      // Remove immediately — single-use
      fs.unlinkSync(tokenPath);

      // Reject expired tokens
      if (Date.now() > entry.expiresAt) {
        this.logger.warn(`Token expired: ${token}`);
        this.safeDeleteFile(entry.filePath);
        return null;
      }

      return entry.filePath;
    } catch (err) {
      this.logger.error(`Failed to consume token: ${err.message}`);
      // Try to clean up corrupted token file
      try { fs.unlinkSync(tokenPath); } catch {}
      return null;
    }
  }

  /**
   * Validate that a token exists without consuming it.
   * Used only for health/debug purposes.
   */
  has(token: string): boolean {
    const tokenPath = this.getTokenFilePath(token);
    if (!fs.existsSync(tokenPath)) return false;
    
    try {
      const data = fs.readFileSync(tokenPath, 'utf8');
      const entry: TokenEntry = JSON.parse(data);
      if (Date.now() > entry.expiresAt) {
        fs.unlinkSync(tokenPath);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete all expired token files and their corresponding temp files.
   * Called periodically by InvoiceService cron job.
   */
  cleanExpired(): void {
    const now = Date.now();
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const tokenPath = path.join(tempDir, file);
          try {
            const data = fs.readFileSync(tokenPath, 'utf8');
            const entry: TokenEntry = JSON.parse(data);
            if (now > entry.expiresAt) {
              fs.unlinkSync(tokenPath);
              this.safeDeleteFile(entry.filePath);
              this.logger.debug(`Cleaned expired token entry and file: ${entry.filePath}`);
            }
          } catch (err) {
            // Corrupted JSON or read error, just delete it
            try { fs.unlinkSync(tokenPath); } catch {}
          }
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to clean expired tokens: ${err.message}`);
    }
  }

  /** Returns the number of live entries in the store (for diagnostics). */
  size(): number {
    try {
      const files = fs.readdirSync(tempDir);
      return files.filter(f => f.endsWith('.json')).length;
    } catch {
      return 0;
    }
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
