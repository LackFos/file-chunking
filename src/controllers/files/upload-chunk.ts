import { Context, t, Static } from "elysia";
import { ResponseHelper } from "@/libs/response-helper";
import { FileUploadContract } from "@/libs/file-upload-contract";
import { FileType } from "@/libs/file-type";

export const UploadChunkDTO = {
  params: t.Object({
    contractId: t.String(),
    chunkNumber: t.Number(),
  }),
  body: t.ArrayBuffer(),
};

export async function uploadChunk(
  context: Context<{
    params: Static<typeof UploadChunkDTO.params>;
    body: ArrayBuffer;
  }>,
) {
  const { contractId, chunkNumber } = context.params;
  const chunk = context.body;

  FileUploadContract.receive(chunk, contractId, chunkNumber);

  return ResponseHelper.NoContent(context.set);
}
