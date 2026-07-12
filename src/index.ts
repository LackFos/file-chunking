import { Elysia } from "elysia";
import { v1Routes } from "./routes/v1";
import openapi from "@elysia/openapi";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(openapi())
  .group("/api", (app) => app.use(v1Routes))
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
