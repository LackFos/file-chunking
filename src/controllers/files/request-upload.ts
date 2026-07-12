import { FileUploadContract } from "@/libs/file-upload-contract";
import { ResponseHelper } from "@/libs/response-helper";
import { t } from "elysia";
import type { Context, Static } from "elysia";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const RequestUploadDTO = {
  body: t.Object({
    size: t.Number({ maximum: MAX_FILE_SIZE }),
  }),
};

export const requestUpload = async (
  context: Context<{ body: Static<typeof RequestUploadDTO.body> }>,
) => {
  const metadata = {
    size: context.body.size,
  };

  const contract = FileUploadContract.create(metadata);

  return ResponseHelper.Ok(context.set, "Contract created", contract);
};
