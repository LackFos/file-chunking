# File Chunking Mechanicsm

A zero-dependency experimental project built to deeply understand of file chunking mechanicsm

> ⚠️ **Educational Disclaimer**
>
> If you happen upon this project, please notes that this repository exists solely for learning purposes. The architectural patterns implemented here are **not production-ready or scalable**.

### Why this isn't production-ready:

- **State Management:** Upload states are stored directly in-memory (volatile server variables) rather than a distributed cache like Redis. A server restart or horizontal scale-up will break active uploads.

---

## Notes: What I Learned

- File magic bytes
- File chunking mechanicsm
- Elysia.js
