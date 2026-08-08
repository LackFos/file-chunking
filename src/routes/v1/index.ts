import { Elysia } from "elysia";
import { uploadRoutes } from "@/routes/v1/upload";

export const v1Routes = new Elysia({ prefix: "/v1" }).use(uploadRoutes);
