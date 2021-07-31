"use strict";
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
exports.lookup_path = exports.lookupPathEx = exports.reconstruct = exports.Certificate = exports.hashTreeToString = exports.UnverifiedCertificateError = void 0;
const buffer_1 = require("buffer/");
const agent_1 = require("./agent");
const cbor = __importStar(require("./cbor"));
const errors_1 = require("./errors");
const request_id_1 = require("./request_id");
const candid_1 = require("@dfinity/candid");
const bls_1 = require("./utils/bls");
/**
 * A certificate needs to be verified (using {@link Certificate.prototype.verify})
 * before it can be used.
 */
class UnverifiedCertificateError extends errors_1.AgentError {
    constructor() {
        super(`Cannot lookup unverified certificate. Call 'verify()' first.`);
    }
}
exports.UnverifiedCertificateError = UnverifiedCertificateError;
/**
 * Make a human readable string out of a hash tree.
 * @param tree
 */
function hashTreeToString(tree) {
    const indent = (s) => s
        .split('\n')
        .map(x => '  ' + x)
        .join('\n');
    function labelToString(label) {
        const decoder = new TextDecoder(undefined, { fatal: true });
        try {
            return JSON.stringify(decoder.decode(label));
        }
        catch (e) {
            return `data(...${label.byteLength} bytes)`;
        }
    }
    switch (tree[0]) {
        case 0:
            return '()';
        case 1: {
            const left = hashTreeToString(tree[1]);
            const right = hashTreeToString(tree[2]);
            return `sub(\n left:\n${indent(left)}\n---\n right:\n${indent(right)}\n)`;
        }
        case 2: {
            const label = labelToString(tree[1]);
            const sub = hashTreeToString(tree[2]);
            return `label(\n label:\n${indent(label)}\n sub:\n${indent(sub)}\n)`;
        }
        case 3: {
            return `leaf(...${tree[1].byteLength} bytes)`;
        }
        case 4: {
            return `pruned(${candid_1.blobToHex(candid_1.blobFromUint8Array(new Uint8Array(tree[1])))}`;
        }
        default: {
            return `unknown(${JSON.stringify(tree[0])})`;
        }
    }
}
exports.hashTreeToString = hashTreeToString;
function isBufferEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
class Certificate {
    constructor(response, _agent = agent_1.getDefaultAgent()) {
        this._agent = _agent;
        this.verified = false;
        this._rootKey = null;
        this.cert = cbor.decode(response.certificate);
    }
    lookupEx(path) {
        this.checkState();
        return lookupPathEx(path, this.cert.tree);
    }
    lookup(path) {
        this.checkState();
        return lookup_path(path, this.cert.tree);
    }
    async verify() {
        const rootHash = await reconstruct(this.cert.tree);
        const derKey = await this._checkDelegation(this.cert.delegation);
        const sig = this.cert.signature;
        const key = extractDER(derKey);
        const msg = buffer_1.Buffer.concat([domain_sep('ic-state-root'), rootHash]);
        const res = await bls_1.blsVerify(key, sig, msg);
        this.verified = res;
        return res;
    }
    checkState() {
        if (!this.verified) {
            //throw new UnverifiedCertificateError();
        }
    }
    async _checkDelegation(d) {
        if (!d) {
            if (!this._rootKey) {
                if (this._agent.rootKey) {
                    this._rootKey = this._agent.rootKey;
                    return this._rootKey;
                }
                throw new Error(`Agent does not have a rootKey. Do you need to call 'fetchRootKey'?`);
            }
            return this._rootKey;
        }
        const cert = new Certificate(d, this._agent);
        if (!(await cert.verify())) {
            throw new Error('fail to verify delegation certificate');
        }
        const lookup = cert.lookupEx(['subnet', d.subnet_id, 'public_key']);
        if (!lookup) {
            throw new Error(`Could not find subnet key for subnet 0x${d.subnet_id.toString('hex')}`);
        }
        return buffer_1.Buffer.from(lookup);
    }
}
exports.Certificate = Certificate;
const DER_PREFIX = buffer_1.Buffer.from('308182301d060d2b0601040182dc7c0503010201060c2b0601040182dc7c05030201036100', 'hex');
const KEY_LENGTH = 96;
function extractDER(buf) {
    const expectedLength = DER_PREFIX.length + KEY_LENGTH;
    if (buf.length !== expectedLength) {
        throw new TypeError(`BLS DER-encoded public key must be ${expectedLength} bytes long`);
    }
    const prefix = buf.slice(0, DER_PREFIX.length);
    if (!isBufferEqual(prefix, DER_PREFIX)) {
        throw new TypeError(`BLS DER-encoded public key is invalid. Expect the following prefix: ${DER_PREFIX}, but get ${prefix}`);
    }
    return buf.slice(DER_PREFIX.length);
}
/**
 * @param t
 */
async function reconstruct(t) {
    switch (t[0]) {
        case 0 /* Empty */:
            return request_id_1.hash(domain_sep('ic-hashtree-empty'));
        case 4 /* Pruned */:
            return buffer_1.Buffer.from(t[1]);
        case 3 /* Leaf */:
            return request_id_1.hash(buffer_1.Buffer.concat([
                domain_sep('ic-hashtree-leaf'),
                buffer_1.Buffer.from(t[1]),
            ]));
        case 2 /* Labeled */:
            return request_id_1.hash(buffer_1.Buffer.concat([
                domain_sep('ic-hashtree-labeled'),
                buffer_1.Buffer.from(t[1]),
                buffer_1.Buffer.from(await reconstruct(t[2])),
            ]));
        case 1 /* Fork */:
            return request_id_1.hash(buffer_1.Buffer.concat([
                domain_sep('ic-hashtree-fork'),
                buffer_1.Buffer.from(await reconstruct(t[1])),
                buffer_1.Buffer.from(await reconstruct(t[2])),
            ]));
        default:
            throw new Error('unreachable');
    }
}
exports.reconstruct = reconstruct;
function domain_sep(s) {
    const buf = buffer_1.Buffer.alloc(1);
    buf.writeUInt8(s.length, 0);
    return buffer_1.Buffer.concat([buf, buffer_1.Buffer.from(s)]);
}
/**
 *
 * @param path
 * @param tree
 */
function lookupPathEx(path, tree) {
    const maybeReturn = lookup_path(path.map(p => {
        if (typeof p === 'string') {
            return candid_1.blobFromText(p);
        }
        else {
            return candid_1.blobFromUint8Array(new Uint8Array(p));
        }
    }), tree);
    return maybeReturn && candid_1.blobToUint8Array(candid_1.blobFromBuffer(maybeReturn));
}
exports.lookupPathEx = lookupPathEx;
/**
 * @param path
 * @param tree
 */
function lookup_path(path, tree) {
    if (path.length === 0) {
        switch (tree[0]) {
            case 3 /* Leaf */: {
                return buffer_1.Buffer.from(tree[1]);
            }
            default: {
                return undefined;
            }
        }
    }
    const t = find_label(path[0], flatten_forks(tree));
    if (t) {
        return lookup_path(path.slice(1), t);
    }
}
exports.lookup_path = lookup_path;
function flatten_forks(t) {
    switch (t[0]) {
        case 0 /* Empty */:
            return [];
        case 1 /* Fork */:
            return flatten_forks(t[1]).concat(flatten_forks(t[2]));
        default:
            return [t];
    }
}
function find_label(l, trees) {
    if (trees.length === 0) {
        return undefined;
    }
    for (const t of trees) {
        if (t[0] === 2 /* Labeled */) {
            const p = buffer_1.Buffer.from(t[1]);
            if (isBufferEqual(l, p)) {
                return t[2];
            }
        }
    }
}
//# sourceMappingURL=certificate.js.map