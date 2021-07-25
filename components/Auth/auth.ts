import 'text-encoding';
import 'react-native-get-random-values'
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-polyfill-globals/auto';
import { Actor, HttpAgent, } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { AuthClient } from "@dfinity/auth-client";
import { IDL } from '@dfinity/candid';

import { Ed25519KeyIdentity } from "@dfinity/identity";
const Buffer = require("buffer").Buffer;

export const login = async(url='https://fx.land/Web-Identity-Providers/?pubKey64=') => {
    const keyPair = Ed25519KeyIdentity.generate();
	console.log('keyPair generated');
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
				whoami: IDL.Func([IDL.Text], [IDL.Principal], ['query']),
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
		
		/*const service = idlFactory({ IDL: IDL });
		
		let arg;
		for (const [methodName, func] of service._fields) {
			console.log(func.argTypes);
			arg = IDL.encode(func.argTypes, ['ehsan']);
		}
		const queryData = {
			methodName: 'hello',
			arg: arg
		}
		console.log(queryData);

		agent.query(canisterId, queryData, ).then((res)=>{
			console.log(res);
		}).catch((e)=>{console.log(e)});*/
        actor.whoami('ehsan').then((res) => {
            console.log(res);
        }).catch((e)=>{console.log(e)});
    }

    WebBrowser.maybeCompleteAuthSession();
    Linking.canOpenURL(url).then(
        (url2) => {
            Linking.addEventListener('url', (event)=>{
                console.log(event.url);
                let { path, queryParams } = Linking.parse(event.url);
                console.log([path, queryParams]);
                test();
                WebBrowser.dismissBrowser();
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