import { appendFile } from "node:fs/promises";

export interface FileMetadata {
  size: number;
}

export interface Contract {
  id: string;
  size: number;
  totalChunk: number;
  receivedChunks: Set<number>;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

class FileUploadContractManager {
  contracts = new Map<string, Contract>();

  has(contractId: string): boolean {
    return this.contracts.has(contractId);
  }

  get(contractId: string): Contract | null {
    return this.contracts.get(contractId) || null;
  }

  create(metadata: FileMetadata): Contract {
    const { size } = metadata;

    const contractId = Bun.randomUUIDv7();

    const totalChunk = Math.ceil(size / CHUNK_SIZE);

    const contract = {
      id: contractId,
      size,
      totalChunk,
      receivedChunks: new Set<number>(),
    };

    this.contracts.set(contract.id, contract);

    return contract;
  }

  async receive(chunk: ArrayBuffer, contractId: string, chunkNumber: number) {
    const contract = this.contracts.get(contractId);

    if (!contract) {
      throw new Error("Invalid contract id");
    }

    await Bun.write(`.tmp/uploads/${contractId}/chunk/${chunkNumber}`, chunk);

    contract.receivedChunks.add(chunkNumber);

    if (contract.receivedChunks.size === contract.totalChunk) {
      await this.mergeChunks(contract);
      this.contracts.delete(contractId);
    }
  }

  private async mergeChunks(contract: Contract) {
    for (let i = 1; i <= contract.totalChunk; i++) {
      try {
        const chunk = Bun.file(`.tmp/uploads/${contract.id}/chunk/${i}`);
        const bytes = await chunk.bytes();
        await appendFile(`.tmp/uploads/${contract.id}.bin`, bytes);
      } catch (error) {
        throw new Error(`Failed to merge chunk ${i}: ${error}`);
      }
    }
  }
}

export const FileUploadContract = new FileUploadContractManager();
