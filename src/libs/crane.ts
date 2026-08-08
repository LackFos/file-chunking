import { rm } from "node:fs/promises";
import { Contract } from "@/libs/file-upload-contract";

type CraneDriver = "public" | "s3";

export class Crane {
  constructor(driver: CraneDriver = "public") {
    switch (driver) {
      case "public":
        this.#drop = this.#dropToPublic;
        break;

      case "s3":
        this.#drop = this.#dropToS3;
        break;

      default:
        throw new Error(`Unsupported driver: ${driver}`);
    }
  }

  async liftAndDrop(contract: Contract) {
    return this.#drop(contract);
  }

  #drop: (contract: Contract) => Promise<string>;

  async #dropToPublic(contract: Contract): Promise<string> {
    const uuid = Bun.randomUUIDv7();

    const destinationPath = `./public/uploads/${uuid}.${contract.fileType?.extension || "bin"}`;
    await Bun.write(destinationPath, contract.file);

    await contract.deleteTempFile();

    return destinationPath;
  }

  async #dropToS3(contract: Contract): Promise<string> {
    throw new Error("S3 driver is not implemented yet");
  }
}
