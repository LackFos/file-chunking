import { Context } from "elysia";
import { ResponseHelper } from "@/libs/response-helper";

export class UploadContractError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }

  static readonly InvalidContractId = new UploadContractError(
    "INVALID_CONTRACT_ID",
    "Provided contract id does not exist",
  );

  static readonly ChunkReceived = new UploadContractError(
    "CHUNK_RECEIVED",
    "Provided chunk number was already filled in the contract",
  );

  toResponse(set: Context["set"]) {
    if (this === UploadContractError.InvalidContractId) {
      return ResponseHelper.NotFound(set, this.message);
    }

    if (this === UploadContractError.ChunkReceived) {
      return ResponseHelper.Conflict(set, this.message);
    }
  }
}
