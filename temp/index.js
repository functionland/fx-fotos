"use strict";
if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDelegationValid = exports.createDelegationChainFromAccessToken = exports.getAccessTokenFromURL = exports.getAccessTokenFromWindow = exports.createAuthenticationRequestUrl = void 0;
const principal_1 = require("@dfinity/principal");
const identity_1 = require("@dfinity/identity");
const DEFAULT_IDENTITY_PROVIDER_URL = 'https://auth.ic0.app/authorize';
function _getDefaultLocation() {
    if (typeof window === 'undefined') {
        throw new Error('Could not find default location.');
    }
    return window.location.origin;
}
/**
 * Create a URL that can be used to redirect the browser to request authentication (e.g. using
 * the authentication provider). Will throw if some options are invalid.
 * @param options An option with all options for the authentication request.
 */
function createAuthenticationRequestUrl(options) {
    var _a, _b, _c;
    const url = new URL((_b = (_a = options.identityProvider) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : DEFAULT_IDENTITY_PROVIDER_URL);
    url.searchParams.set('response_type', 'token');
    url.searchParams.set('login_hint', options.publicKey.toDer().toString('hex'));
    url.searchParams.set('redirect_uri', (_c = options.redirectUri) !== null && _c !== void 0 ? _c : _getDefaultLocation());
    url.searchParams.set('scope', options.scope
        .map(p => {
        if (typeof p === 'string') {
            return principal_1.Principal.fromText(p);
        }
        else {
            return p;
        }
    })
        .map(p => p.toString())
        .join(' '));
    url.searchParams.set('state', '');
    return url;
}
exports.createAuthenticationRequestUrl = createAuthenticationRequestUrl;
/**
 * Returns an AccessToken from the Window object. This cannot be used in Node, instead use
 * the {@link getAccessTokenFromURL} function.
 *
 * An access token is needed to create a DelegationChain object.
 */
function getAccessTokenFromWindow() {
    if (typeof window === 'undefined') {
        return null;
    }
    return getAccessTokenFromURL(new URL(window.location.href));
}
exports.getAccessTokenFromWindow = getAccessTokenFromWindow;
/**
 * Analyze a URL and try to extract an AccessToken from it.
 * @param url The URL to look into.
 */
function getAccessTokenFromURL(url) {
    // Remove the `#` at the start.
    const hashParams = new URLSearchParams(new URL(url.toString()).hash.substr(1));
    return hashParams.get('access_token');
}
exports.getAccessTokenFromURL = getAccessTokenFromURL;
/**
 * Create a DelegationChain from an AccessToken extracted from a redirect URL.
 * @param accessToken The access token extracted from a redirect URL.
 */
function createDelegationChainFromAccessToken(accessToken) {
    // Transform the HEXADECIMAL string into the JSON it represents.
    if (/[^0-9a-fA-F]/.test(accessToken) || accessToken.length % 2) {
        throw new Error('Invalid hexadecimal string for accessToken.');
    }
    const chainJson = [...accessToken]
        .reduce((acc, curr, i) => {
        // tslint:disable-next-line:no-bitwise
        acc[(i / 2) | 0] = (acc[(i / 2) | 0] || '') + curr;
        return acc;
    }, [])
        .map(x => Number.parseInt(x, 16))
        .map(x => String.fromCharCode(x))
        .join('');
    return identity_1.DelegationChain.fromJSON(chainJson);
}
exports.createDelegationChainFromAccessToken = createDelegationChainFromAccessToken;
/**
 * Analyze a DelegationChain and validate that it's valid, ie. not expired and apply to the
 * scope.
 * @param chain The chain to validate.
 * @param checks Various checks to validate on the chain.
 */
function isDelegationValid(chain, checks) {
    // Verify that the no delegation is expired. If any are in the chain, returns false.
    for (const { delegation } of chain.delegations) {
        // prettier-ignore
        if (+new Date(Number(delegation.expiration / BigInt(1000000))) <= +Date.now()) {
            return false;
        }
    }
    // Check the scopes.
    const scopes = [];
    const maybeScope = checks === null || checks === void 0 ? void 0 : checks.scope;
    if (maybeScope) {
        if (Array.isArray(maybeScope)) {
            scopes.push(...maybeScope.map(s => (typeof s === 'string' ? principal_1.Principal.fromText(s) : s)));
        }
        else {
            scopes.push(typeof maybeScope === 'string' ? principal_1.Principal.fromText(maybeScope) : maybeScope);
        }
    }
    for (const s of scopes) {
        const scope = s.toText();
        for (const { delegation } of chain.delegations) {
            if (delegation.targets === undefined) {
                continue;
            }
            let none = true;
            for (const target of delegation.targets) {
                if (target.toText() === scope) {
                    none = false;
                    break;
                }
            }
            if (none) {
                return false;
            }
        }
    }
    return true;
}
exports.isDelegationValid = isDelegationValid;
//# sourceMappingURL=index.js.map