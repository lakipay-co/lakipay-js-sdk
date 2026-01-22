export class LakipayError extends Error {
    status?: number;
    code?: string;
    details?: unknown;
  
    constructor(message: string, opts?: { status?: number; code?: string; details?: unknown }) {
      super(message);
      this.name = "LakipayError";
      this.status = opts?.status;
      this.code = opts?.code;
      this.details = opts?.details;
    }
  }