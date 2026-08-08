import { rm } from "node:fs/promises";
import { Elysia } from "elysia";
import { v1Routes } from "@/routes/v1";
import openapi from "@elysia/openapi";
import { FileUploadContract } from "./libs/file-upload-contract";

const PORT = process.env.PORT || 3000;

const app = new Elysia()
  .use(openapi())
  .group("/api", (app) => app.use(v1Routes))
  .listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

async function cleanupContract() {
  const contracts = FileUploadContract.contracts;

  for (const [contractId, contract] of contracts) {
    const absoluteTTL = Number(process.env.CONTRACT_ABSOLUTE_TTL);
    const staleTTL = Number(process.env.CONTRACT_STALE_TTL);
    const now = Date.now();

    if (!absoluteTTL || !staleTTL) {
      return;
    }
    const absoluteExpiration = contract.createdAt.getTime() + absoluteTTL;
    const staleExpiration = contract.lastChunkReceivedAt.getTime() + staleTTL;

    if (now > absoluteExpiration || now > staleExpiration) {
      console.log("---");
      console.log(`Contract ${contractId} has expired. Removing...`);
      await FileUploadContract.remove(contractId);
      console.log("---");
    }
  }
}

setInterval(cleanupContract, 1000);
