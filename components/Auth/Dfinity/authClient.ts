import { Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';

// Where the IDP should be serviced from
const IDENTITY_URL = 'https://identity.ic0.app';

/*
 * A simple wrapper for the official auth client to initialize it and wrap
 * some of the methods in promises
 */
class AuthClientWrapper {
    public authClient?: AuthClient;
    public ready = false;
    constructor() {
      return this;
    }
  
    // Create a new auth client and update it's ready state
    async create() {
      this.authClient = await AuthClient.create();
      await this.authClient?.isAuthenticated();
      this.ready = true;
    }
  
    async login(): Promise<Identity | undefined> {
      return new Promise(async (resolve) => {
        await this.authClient?.login({
          identityProvider: IDENTITY_URL,
          onSuccess: async () => {
            resolve(this.authClient?.getIdentity());
          },
        });
      });
    }
  
    async logout() {
      return this.authClient?.logout({ returnTo: '/' });
    }
  
    async getIdentity() {
      return this.authClient?.getIdentity();
    }
  
    async isAuthenticated() {
      return this.authClient?.isAuthenticated();
    }
  }
  
  export const authClient = new AuthClientWrapper();