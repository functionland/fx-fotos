import 'text-encoding';
import 'react-native-get-random-values'
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-polyfill-globals/auto';
import { Actor, HttpAgent, } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { AuthClient } from "@dfinity/auth-client";
import { IDL, blobFromUint32Array } from '@dfinity/candid';

import { Ed25519KeyIdentity } from "@dfinity/identity";
const Buffer = require("buffer").Buffer;

export const login = async(url='https://fx.land/Web-Identity-Providers/?pubKey64=') => {
    const keyPair = Ed25519KeyIdentity.generate();
    const keyPairJson = keyPair.toJSON();
    keyPairJson[1] = '';
    
    const publicKey = JSON.stringify(keyPairJson);
    const publicKey64 = new Buffer(publicKey).toString("base64");
    console.log(publicKey64);
    url = url + publicKey64;

    const test = async() => {
        console.log('here0');
        let options = {
            identity: Ed25519KeyIdentity.fromJSON(publicKey)
        };
		
        const authClient = await AuthClient.create(options);
        
        const identity = authClient.getIdentity();
		
        const idlFactory = ({ IDL }:any) => {
            return IDL.Service({
				greet: IDL.Func([], [], ['query']),
            });
		}
		
        const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
		const agent = new HttpAgent({
			host: 'http://192.168.68.113:8000/',
			identity,
		});
		
        const actor = Actor.createActor(idlFactory, {
            agent: agent,
            canisterId,
        });
		console.log('here1');
		const service = idlFactory({ IDL: IDL });
		
		for (const [methodName, func] of service._fields) {
			console.log(methodName);
			console.log(func);
			const arg = IDL.encode(func.argTypes, []);
			console.log(arg);
		}
		const queryData = {
			methodName: 'greet',
			arg: blobFromUint32Array(new Uint32Array())
		}
		console.log(queryData);

		/*agent.query(canisterId, queryData, identity, ).then((res)=>{
			console.log(res);
		});*/
        actor.greet().then((principal) => {
            console.log(principal.toText());
        });
    }

    WebBrowser.maybeCompleteAuthSession();
    Linking.canOpenURL(url).then(
        (url2) => {
            Linking.addEventListener('url', (event)=>{
                console.log(event.url);
                let { path, queryParams } = Linking.parse(event.url);
                console.log([path, queryParams]);
                test();
                //WebBrowser.dismissBrowser();
            });
            WebBrowser.openBrowserAsync(url, {
                createTask: true,
            });
        }
    )
    /*
    const identity = authClient.getIdentity();
    const agent = new HttpAgent({
        host: 'https://boundary.ic0.app/',
        identity,
    });
    
    const canisterId = Principal.fromText('4k2wq-cqaaa-aaaab-qac7q-cai');
    console.log(canisterId);
    const queryData = {
        methodName: 'createUser',
        arg: ???
    }
    agent.query(canisterId, queryData, identity, ).then((res)=>{
        console.log(res);
    })*/
}