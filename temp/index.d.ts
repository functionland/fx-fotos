import { Identity, SignIdentity } from '@dfinity/agent';
import { DelegationChain } from '@dfinity/identity';
/**
 * List of options for creating an {@link AuthClient}.
 */
export interface AuthClientCreateOptions {
    /**
     * An identity to use as the base
     */
    identity?: SignIdentity;
    /**
     * Optional storage with get, set, and remove. Uses LocalStorage by default
     */
    storage?: AuthClientStorage;
	/**
     * Optional window object with open, addEventListener, removeEventListener, history.pushState, location.href. Uses window by default
     */
    windowObj?: any;
}
export interface AuthClientLoginOptions {
    /**
     * Identity provider. By default, use the identity service.
     */
    identityProvider?: string | URL;
    /**
     * Experiation of the authentication
     */
    maxTimeToLive?: bigint;
    /**
     * Callback once login has completed
     */
    onSuccess?: () => void;
    /**
     * Callback in case authentication fails
     */
    onError?: (error?: string) => void;
}
/**
 * Interface for persisting user authentication data
 */
export interface AuthClientStorage {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
}

export declare class LocalStorage implements AuthClientStorage {
    readonly prefix: string;
    private readonly _localStorage?;
    constructor(prefix?: string, _localStorage?: Storage | undefined);
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    private _getLocalStorage;
}
export declare class AuthClient {
    private _identity;
    private _key;
    private _chain;
    private _storage;
	private _window;
    private _idpWindow?;
    private _eventHandler?;
    static create(options?: AuthClientCreateOptions): Promise<AuthClient>;
    protected constructor(_identity: Identity, _key: SignIdentity | null, _chain: DelegationChain | null, _storage: AuthClientStorage, _window:any, _idpWindow?: Window | undefined, _eventHandler?: ((event: MessageEvent) => void) | undefined);
    private _handleSuccess;
    getIdentity(): Identity;
    isAuthenticated(): Promise<boolean>;
    login(options?: AuthClientLoginOptions): Promise<void>;
    private _getEventHandler;
    private _handleFailure;
    private _removeEventListener;
    logout(options?: {
        returnTo?: string;
    }): Promise<void>;
}
