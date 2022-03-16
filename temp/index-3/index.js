"use strict";
global.Buffer = global.Buffer || require('buffer').Buffer;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Principal = void 0;
const base32_1 = require("./utils/base32");
const getCrc_1 = require("./utils/getCrc");
const sha224_1 = require("./utils/sha224");
const SELF_AUTHENTICATING_SUFFIX = 2;
const ANONYMOUS_SUFFIX = 4;
const fromHexString = (hexString) => { var _a; return new Uint8Array(((_a = hexString.match(/.{1,2}/g)) !== null && _a !== void 0 ? _a : []).map(byte => parseInt(byte, 16))); };
const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
class Principal {
    constructor(_arr) {
        this._arr = _arr;
        this._isPrincipal = true;
    }
    static anonymous() {
        return new this(new Uint8Array([ANONYMOUS_SUFFIX]));
    }
    static selfAuthenticating(publicKey) {
        const sha = sha224_1.sha224(publicKey);
        return new this(new Uint8Array([...sha, SELF_AUTHENTICATING_SUFFIX]));
    }
    static from(other) {
        if (typeof other === 'string') {
            return Principal.fromText(other);
        }
        else if (typeof other === 'object' &&
            other !== null &&
            other._isPrincipal === true) {
            return new Principal(other._arr);
        }
        throw new Error(`Impossible to convert ${JSON.stringify(other)} to Principal.`);
    }
    static fromHex(hex) {
        return new this(fromHexString(hex));
    }
    static fromText(text) {
        const canisterIdNoDash = text.toLowerCase().replace(/-/g, '');
        let arr = base32_1.decode(canisterIdNoDash);
        arr = arr.slice(4, arr.length);
        const principal = new this(arr);
        if (principal.toText() !== text) {
            throw new Error(`Principal "${principal.toText()}" does not have a valid checksum.`);
        }
        return principal;
    }
    static fromUint8Array(arr) {
        return new this(arr);
    }
    isAnonymous() {
        return this._arr.byteLength === 1 && this._arr[0] === ANONYMOUS_SUFFIX;
    }
    toUint8Array() {
        return this._arr;
    }
    toHex() {
        return toHexString(this._arr).toUpperCase();
    }
    toText() {
        const checksumArrayBuf = new ArrayBuffer(4);
        const view = new DataView(checksumArrayBuf);
        view.setUint32(0, getCrc_1.getCrc32(this._arr));
        const checksum = Uint8Array.from(Buffer.from(checksumArrayBuf));
        const bytes = Uint8Array.from(this._arr);
        const array = new Uint8Array([...checksum, ...bytes]);
        const result = base32_1.encode(array);
        const matches = result.match(/.{1,5}/g);
        if (!matches) {
            // This should only happen if there's no character, which is unreachable.
            throw new Error();
        }
        return matches.join('-');
    }
    toString() {
        return this.toText();
    }
}
exports.Principal = Principal;
//# sourceMappingURL=index.js.map