export class FileTypeDetector {
  // ==========================================
  // CONSTANTS
  // ==========================================

  MAGIC_BYTES = [
    {
      signature: new Uint8Array([0xff, 0xd8, 0xff]),
      extension: "jpg",
      mimeType: "image/jpeg",
    },
    {
      signature: new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]),
      extension: "png",
      mimeType: "image/png",
    },
    {
      signature: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
      extension: "gif",
      mimeType: "image/gif",
    },
    {
      signature: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      extension: "pdf",
      mimeType: "application/pdf",
    },
    {
      signature: new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      extension: "zip",
      mimeType: "application/zip",
    },
  ];

  // ==========================================
  // METHODS
  // ==========================================

  fromBuffer(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);

    // Prevent docx, xlsx, pptx from being detected as zip
    const signatures = this.MAGIC_BYTES.sort(
      (a, b) => b.signature.length - a.signature.length,
    );

    for (const { signature, extension, mimeType } of signatures) {
      if (bytes.length < signature.length) continue;
      if (signature.every((byte, index) => byte === bytes[index])) {
        return { extension, mimeType };
      }
    }

    return null;
  }
}

export const FileType = new FileTypeDetector();
