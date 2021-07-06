import 'text-encoding';
import { HttpAgent, } from "@dfinity/agent";

export const login = async() => {
    const http = new HttpAgent({
        host: "https://identity.ic0.app/",
    });
    /*http.status().then((res)=>{console.log(res)})*/
}