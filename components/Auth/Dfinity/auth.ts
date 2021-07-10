import 'text-encoding';
import 'react-native-get-random-values'
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { DelegationIdentity } from "@dfinity/identity";
import { AuthClient } from '@dfinity/auth-client';


export const login = async(url='https://fx.land/Internet-Identity/') => {
    WebBrowser.maybeCompleteAuthSession();
    Linking.canOpenURL(url).then(
        (url2) => {
            Linking.addEventListener('url', (event)=>{
                console.log(event);
                let { path, queryParams } = Linking.parse(event.url);
                //WebBrowser.dismissBrowser();
                console.log([path, queryParams]);
            });
            WebBrowser.openBrowserAsync(url);
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