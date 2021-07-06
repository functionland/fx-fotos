import 'text-encoding';
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { DelegationIdentity } from "@dfinity/identity";
import { AuthClient } from "@dfinity/auth-client";

export const login = async() => {
    /*const http = new HttpAgent({
        host: "https://identity.ic0.app/",
    });
    http.status().then((res)=>{console.log(res)})*/
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    console.log(identity.getPrincipal());
}