import { appendFile } from "node:fs/promises";
import { Crane } from "./crane";
import { FileType } from "./file-type";
import { BunFile } from "bun";
import { rm } from "node:fs/promises";

export interface FileMetadata {
  size: number;
}

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
  receivedChunks: Set<number>;

  #fileType: FileType | null;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(id: string, size: number, totalChunk: number) {
    this.id = id;
    this.size = size;
    this.totalChunk = totalChunk;
    this.receivedChunks = new Set<number>();

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

  // ==========================================
  // SETTERS
  // ==========================================

  set fileType(fileType: FileType | null) {
    this.#fileType = fileType;
  }

  // ==========================================
  // METHODS
  // ==========================================

  async deleteTempFile(): Promise<void> {
    await rm(`.tmp/uploads/${this.id}`, { recursive: true, force: true });
  }
}

class FileUploadContractManager {
  // ==========================================
  // PROPERTIES
  // ==========================================

  contracts = new Map<string, Contract>();

  // ==========================================
  // CONFIGURATIONS
  // ==========================================

  CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  // ==========================================
  // METHODS
  // ==========================================

  create(metadata: FileMetadata): Contract {
    const { size } = metadata;

    const contractId = Bun.randomUUIDv7();
    const totalChunk = Math.ceil(size / this.CHUNK_SIZE);
    const contract = new Contract(contractId, size, totalChunk);

    this.contracts.set(contract.id, contract);

    return contract;
  }

  async receive(chunk: ArrayBuffer, contractId: string, chunkNumber: number) {
    const contract = this.contracts.get(contractId);

    if (!contract) {
      throw new Error("Invalid contract id");
    }

    if (chunkNumber === 1) {
      contract.fileType = FileType.fromBuffer(chunk);
    }

    await Bun.write(`.tmp/uploads/${contractId}/chunk/${chunkNumber}`, chunk);

    contract.receivedChunks.add(chunkNumber);

    if (contract.receivedChunks.size === contract.totalChunk) {
      await this.#mergeChunks(contract);
      this.contracts.delete(contractId);
    }
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  async #mergeChunks(contract: Contract): Promise<string | null> {
    const crane = new Crane("public");

    for (let i = 1; i <= contract.totalChunk; i++) {
      try {
        const chunk = Bun.file(`.tmp/uploads/${contract.id}/chunk/${i}`);
        const bytes = await chunk.bytes();
        await appendFile(`.tmp/uploads/${contract.id}/merged.bin`, bytes);
      } catch (error) {
        throw new Error(`Failed to merge chunk ${i}: ${error}`);
      }
    }

    return await crane.liftAndDrop(contract);
  }
}

export const FileUploadContract = new FileUploadContractManager();
