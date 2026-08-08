import { Elysia } from "elysia";
import {
  requestUpload,
  RequestUploadDTO,
} from "@/controllers/files/request-upload";
import { uploadChunk, UploadChunkDTO } from "@/controllers/files/upload-chunk";

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .post("/request", requestUpload, RequestUploadDTO)
  .post("/:contractId/chunk/:chunkNumber", uploadChunk, UploadChunkDTO);
