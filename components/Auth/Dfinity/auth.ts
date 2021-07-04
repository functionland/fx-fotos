import 'text-encoding-polyfill';
import { AuthClient } from "@dfinity/auth-client";

export const login = async() => {
    const authClient = await AuthClient.create();
    authClient.login({
        identityProvider: "https://identity.ic0.app/",
        onSuccess: ()=>{console.log('success');}
      });
}