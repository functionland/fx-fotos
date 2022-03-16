"use strict";
if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeExpiryTransform = exports.makeNonceTransform = exports.Expiry = void 0;
const cbor = __importStar(require("simple-cbor"));
const candid_1 = require("@dfinity/candid");
const NANOSECONDS_PER_MILLISECONDS = BigInt(1000000);
const REPLICA_PERMITTED_DRIFT_MILLISECONDS = BigInt(60 * 1000);
class Expiry {
    constructor(deltaInMSec) {
        // Use bigint because it can overflow the maximum number allowed in a double float.
        this._value =
            (BigInt(Date.now()) + BigInt(deltaInMSec) - REPLICA_PERMITTED_DRIFT_MILLISECONDS) *
                NANOSECONDS_PER_MILLISECONDS;
    }
    toCBOR() {
        // TODO: change this to take the minimum amount of space (it always takes 8 bytes now).
        return cbor.value.u64(this._value.toString(16), 16);
    }
    toHash() {
        return candid_1.lebEncode(this._value);
    }
}
exports.Expiry = Expiry;
/**
 * Create a Nonce transform, which takes a function that returns a Buffer, and adds it
 * as the nonce to every call requests.
 * @param nonceFn A function that returns a buffer. By default uses a semi-random method.
 */
function makeNonceTransform(nonceFn = candid_1.makeNonce) {
    return async (request) => {
        // Nonce are only useful for async calls, to prevent replay attacks. Other types of
        // calls don't need Nonce so we just skip creating one.
        if (request.endpoint === "call" /* Call */) {
            request.body.nonce = nonceFn();
        }
    };
}
exports.makeNonceTransform = makeNonceTransform;
/**
 * Create a transform that adds a delay (by default 5 minutes) to the expiry.
 *
 * @param delayInMilliseconds The delay to add to the call time, in milliseconds.
 */
function makeExpiryTransform(delayInMilliseconds) {
    return async (request) => {
        request.body.ingress_expiry = new Expiry(delayInMilliseconds);
    };
}
exports.makeExpiryTransform = makeExpiryTransform;
//# sourceMappingURL=transforms.js.map