import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Actor, HttpAgent, } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { AuthClient } from "@dfinity/auth-client";
import { DelegationIdentity, DelegationChain } from "@dfinity/identity";
import { IDL, derBlobFromBlob, blobFromUint8Array } from '@dfinity/candid';

import { Ed25519KeyIdentity } from "@dfinity/identity";
const Buffer = require("buffer").Buffer;


const afterLogin = async(params:any, keyPair:Ed25519KeyIdentity) => {
	const delegations = new Buffer(params.delegations64 || '', 'base64').toString();
	const delegationChain = DelegationChain.fromJSON(delegations);
	let identity = DelegationIdentity.fromDelegation(keyPair, delegationChain);
	console.log(identity.getPrincipal().toText());
	

	//The below line is just for local development and is creating a fixed identity
	//Because Internet-Identity cannot be used for local development
	//Remove for production
	let identity_t = Ed25519KeyIdentity.fromJSON('["302a300506032b6570032100bdb5c06a77a12f0749bd92ddda131a8a239973f9f5e37fe6556378a4c387087e","2849fd03fe5143cfc241fdd882db4470682ddbff66643343c296496daa44b83abdb5c06a77a12f0749bd92ddda131a8a239973f9f5e37fe6556378a4c387087e"]');
	
	
	let isAuthenticated = identity_t.getPrincipal().isAnonymous();
	let result = {identity: identity_t, success: !isAuthenticated, provider: 'II', userId: identity.getPrincipal().toText()};
	return result;
	
	const idlFactory = ({ IDL }:any) => {
		return IDL.Service({
			whoami: IDL.Func([IDL.Text], [IDL.Principal], ['query']),
		});
	}
	
	const canisterId = Principal.fromText('uk5da-6iaaa-aaaab-qadja-cai');
	
	const agent = new HttpAgent({
		host: 'http://192.168.68.118:8000/',
		identity,
	});
	await agent.fetchRootKey();
	const actor = Actor.createActor(idlFactory, {
		agent: agent,
		canisterId,
	});
	console.log('here1');
	
	actor.whoami('ehsan').then((res:any) => {
		console.log(res.toText());
	}).catch((e)=>{console.log(e)});
	
}
export const login = async(url='https://fx.land/Web-Identity-Providers/?pubKey64=', callback: Function=()=>{}) => {
	
    const keyPair = Ed25519KeyIdentity.generate();
	console.log('new keyPair generated');
    const keyPairJson = keyPair.toJSON();
	
	const keyPairJsonPublicOnly = [];
	keyPairJsonPublicOnly[0] = keyPairJson[0];
    keyPairJsonPublicOnly[1] = '';
    
    const publicKey = JSON.stringify(keyPairJsonPublicOnly);
    const publicKey64 = new Buffer(publicKey).toString("base64");
    url = url + publicKey64;
    WebBrowser.maybeCompleteAuthSession();
    return Linking.canOpenURL(url).then(
        async (url2) => {
            Linking.addEventListener('url', async (event)=>{
                let { path, queryParams } = Linking.parse(event.url);
				WebBrowser.dismissBrowser();
                let result = await afterLogin(queryParams, keyPair);
				callback(result);
            });
            WebBrowser.openBrowserAsync(url, {
                createTask: true,
            });
        }
    )
}