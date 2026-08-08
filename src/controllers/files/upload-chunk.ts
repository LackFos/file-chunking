import { Context, t, Static } from "elysia";
import { ResponseHelper } from "@/libs/response-helper";
import {
  FileUploadContract,
  UploadContractError,
} from "@/libs/file-upload-contract";

export const UploadChunkDTO = {
  params: t.Object({
    contractId: t.String(),
    chunkNumber: t.Number({ minimum: 1 }),
  }),
  body: t.ArrayBuffer(),
};

export async function uploadChunk(
  context: Context<{
    params: Static<typeof UploadChunkDTO.params>;
    body: ArrayBuffer;
  }>,
) {
  try {
    const { contractId, chunkNumber } = context.params;
    const chunk = context.body;

    await FileUploadContract.receive(chunk, contractId, chunkNumber);

    return ResponseHelper.NoContent(context.set);
  } catch (error) {
    if (error instanceof UploadContractError) {
      return error.toResponse(context.set);
    }

    return ResponseHelper.InternalServerError(context.set, error);
  }
}
