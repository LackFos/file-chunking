import { Elysia } from "elysia";

const PORT = process.env.PORT || 3000;

const app = new Elysia().get("/", () => "Hello Sekai").listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
