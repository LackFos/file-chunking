import { appendFile } from "node:fs/promises";
import { Crane } from "@/libs/crane";
import { Contract } from "@/libs/file-upload-contract/contract";
import { UploadContractError } from "@/libs/file-upload-contract/file-contract-error";
import { FileType } from "@/libs/file-type";
import { FileMetadata } from "@/libs/file-upload-contract/types/file-meta-data";

export { Contract } from "@/libs/file-upload-contract/contract";
export { UploadContractError } from "@/libs/file-upload-contract/file-contract-error";

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
      throw UploadContractError.InvalidContractId;
    }

    if (contract.receivedChunks.has(chunkNumber)) {
      throw UploadContractError.ChunkReceived;
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
