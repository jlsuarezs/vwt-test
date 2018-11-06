import { InjectionToken } from '@angular/core';
import Web3 from 'web3';

const ethereum = window.ethereum;
export const factoryProvider = () => {
    if (ethereum) {
        console.log(`factoryProvider - ethereum: ${ ethereum }`);
        return new Web3(ethereum);
    } else if ( window.web3 ) {
        console.log(`factoryProvider - givenProvider: ${ window.web3 }`);
        return new Web3( Web3.givenProvider || 'ws://localhost:8546' );
    } else {
        console.log(`factoryProvider - Error: NOT CONNECTED.`);
        return { Error: 'Install https://metamask.io/ and/or unlock your wallet!' };
    }
};

export const WEB3 = new InjectionToken<Web3>('web3', {
    providedIn: 'root',
    factory: () => new Web3( factoryProvider() )
});
