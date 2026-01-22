"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LakipayError = void 0;
class LakipayError extends Error {
    constructor(message, opts) {
        super(message);
        this.name = "LakipayError";
        this.status = opts === null || opts === void 0 ? void 0 : opts.status;
        this.code = opts === null || opts === void 0 ? void 0 : opts.code;
        this.details = opts === null || opts === void 0 ? void 0 : opts.details;
    }
}
exports.LakipayError = LakipayError;
