import { BunFile } from "bun";
import { rm } from "node:fs/promises";

type FileType = {
  extension: string;
  mimeType: string;
};

export class Contract {
  // ==========================================
  // PROPERTIES
  // ==========================================

  id: string;
  size: number;
  totalChunk: number;
  #receivedChunks: Set<number>;
  createdAt: Date = new Date();
  lastChunkReceivedAt: Date = new Date();

  #fileType: FileType | null;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(id: string, size: number, totalChunk: number) {
    this.id = id;
    this.size = size;
    this.totalChunk = totalChunk;
    this.#receivedChunks = new Set<number>();

    this.#fileType = null;
  }

  // ==========================================
  // GETTERS
  // ==========================================

  get file(): BunFile {
    return Bun.file(`.tmp/uploads/${this.id}/merged.bin`);
  }

  get fileType(): FileType | null {
    return this.#fileType;
  }

  get receivedChunks(): Set<number> {
    return new Set(this.#receivedChunks);
  }

  // ==========================================
  // SETTERS
  // ==========================================

  set fileType(fileType: FileType | null) {
    this.#fileType = fileType;
  }

  set receivedChunks(receivedChunks: Set<number>) {
    this.#receivedChunks = receivedChunks;
    this.lastChunkReceivedAt = new Date();
  }

  // ==========================================
  // METHODS
  // ==========================================

  async deleteTempFile(): Promise<void> {
    await rm(`.tmp/uploads/${this.id}`, { recursive: true, force: true });
  }
}
