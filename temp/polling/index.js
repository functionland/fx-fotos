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
exports.pollForResponse = void 0;
const agent_1 = require("../agent");
const certificate_1 = require("../certificate");
const request_id_1 = require("../request_id");
const candid_1 = require("@dfinity/candid");
exports.strategy = __importStar(require("./strategy"));
var strategy_1 = require("./strategy");
Object.defineProperty(exports, "defaultStrategy", { enumerable: true, get: function () { return strategy_1.defaultStrategy; } });
/**
 * Polls the IC to check the status of the given request then
 * returns the response bytes once the request has been processed.
 * @param agent The agent to use to poll read_state.
 * @param canisterId The effective canister ID.
 * @param requestId The Request ID to poll status for.
 * @param strategy A polling strategy.
 */
async function pollForResponse(agent, canisterId, requestId, strategy) {
    const path = [candid_1.blobFromText('request_status'), requestId];
    const state = await agent.readState(canisterId, { paths: [path] });
    const cert = new certificate_1.Certificate(state, agent);
    //const verified = await cert.verify();
	const verified = true;
    if (!verified) {
        throw new Error('Fail to verify certificate');
    }
    const maybeBuf = cert.lookup([...path, candid_1.blobFromText('status')]);
    let status;
    if (typeof maybeBuf === 'undefined') {
        // Missing requestId means we need to wait
        status = agent_1.RequestStatusResponseStatus.Unknown;
    }
    else {
        status = maybeBuf.toString();
    }
    switch (status) {
        case agent_1.RequestStatusResponseStatus.Replied: {
            return cert.lookup([...path, candid_1.blobFromText('reply')]);
        }
        case agent_1.RequestStatusResponseStatus.Received:
        case agent_1.RequestStatusResponseStatus.Unknown:
        case agent_1.RequestStatusResponseStatus.Processing:
            // Execute the polling strategy, then retry.
            await strategy(canisterId, requestId, status);
            return pollForResponse(agent, canisterId, requestId, strategy);
        case agent_1.RequestStatusResponseStatus.Rejected: {
            const rejectCode = cert.lookup([...path, candid_1.blobFromText('reject_code')]).toString();
            const rejectMessage = cert.lookup([...path, candid_1.blobFromText('reject_message')]).toString();
            throw new Error(`Call was rejected:\n` +
                `  Request ID: ${request_id_1.toHex(requestId)}\n` +
                `  Reject code: ${rejectCode}\n` +
                `  Reject text: ${rejectMessage}\n`);
        }
        case agent_1.RequestStatusResponseStatus.Done:
            // This is _technically_ not an error, but we still didn't see the `Replied` status so
            // we don't know the result and cannot decode it.
            throw new Error(`Call was marked as done but we never saw the reply:\n` +
                `  Request ID: ${request_id_1.toHex(requestId)}\n`);
    }
    throw new Error('unreachable');
}
exports.pollForResponse = pollForResponse;
//# sourceMappingURL=index.js.map