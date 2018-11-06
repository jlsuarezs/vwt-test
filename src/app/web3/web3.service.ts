import { Injectable, Inject } from '@angular/core';
// Web3
import { WEB3 } from './web3.inject';
import Web3 from 'web3';

declare var require: any;

const contractAbi = require('./ABI.json');
const contractAddress = '0xeb5828a8c5ca41e9519af53a02681aff9cd900e4';

// RXJS
import { Observable, Subject, pipe, bindNodeCallback, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

const ethereum = window.ethereum;

const STATE_LOADED = 'LOADED';
const STATE_CONNECTED = 'CONNECTED';
const STATE_UNLOCK = 'UNLOCK ACCOUNT';
const STATE_ERROR = 'ERROR';

// Nets
// networks = {
//     1: 'mainnet',
//     3: 'ropsten',
//     4: 'rinkeby',
//     42: 'koven'
// };

@Injectable({
    providedIn: 'root'
})
export class Web3Service {

    // State
    public state = 'NOT CONNECTED';

    // Accounts
    private accounts: string[] = [];
    public accountsObservable = new Subject<any>();

    // Contract
    contract: any = null;

    constructor(@Inject(WEB3) public web3: Web3) {
    }

    // Get/Set
    get defaultAccount(): string {
        return this.web3.eth.defaultAccount;
    }

    set defaultAccount(account: string) {
        this.web3.eth.defaultAccount = account;
    }

    // MetaMask - new settings
    private async enableEthereum() {
        if (ethereum) {
            const res = await ethereum.enable();
            return res;
        }
        return false;
    }

    // Enable Metamask
    public async watchEthereum() {
        console.log(`Ethereum - watchEthereum`);
        await this.enableEthereum();
        this.state = this.web3.currentProvider && !this.web3.currentProvider['Error'] ? STATE_LOADED : STATE_ERROR;
        console.log(`Ethereum - state: ${ this.state }`);
        if (this.state === STATE_LOADED) {
            // Net
            console.log(`Ethereum - getNet`);
            const id = await this.web3.eth.net.getId();
            console.log(`Ethereum - id: ${id}`);
            if (id && id === 3) {
                // Contract
                this.contract = new this.web3.eth.Contract(contractAbi, contractAddress);
                console.log(`Ethereum - contract: ${this.contract}`);

                console.log('Watching accounts...');
                setInterval(() => this.refreshAccounts(), 1000);
            } else {
                this.state = 'SWITCH TO ROPSTEN';
            }
        } else {
            this.accountsObservable.next(this.state);
        }
    }

    private refreshAccounts() {
        this.web3.eth.getAccounts((err, accs) => {
            let localState = this.state;
            if (err != null) {
                localState = STATE_ERROR;
            }

            if (accs.length === 0) {
                localState = STATE_UNLOCK;
            }

            if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
                localState = STATE_CONNECTED;
                this.accounts = accs;
                this.defaultAccount = accs[0] || accs;
            }

            if ( this.state !== localState ) {
                this.state = localState;
                this.accountsObservable.next(this.state);
            }
        });
    }

    // Returns all accounts available
    public getAccounts(): Observable<string[]> {
        return bindNodeCallback(this.web3.eth.getAccounts)();
    }

    // Get the current account
    public getCurrentAccount(): Observable<string | Error> {
        if (this.web3.eth.defaultAccount) {
            return of(this.web3.eth.defaultAccount);
        } else {
            return this.getAccounts().pipe(
                tap((accounts: string[]) => {
                    if (accounts.length === 0) { throw new Error('No accounts available!'); }
                }),
                map((accounts: string[]) => accounts[0]),
                tap((account: string) => this.defaultAccount = account),
                catchError((err: Error) => of(err))
            );
        }
    }

    public async getGames() {
        try {
            const result = await this.contract.methods.getGames().call();
            return result;
        } catch (error) {
            console.error('getGames - error', error);
            return error;
        }
    }

    public async updateGames() {
        try {
            const result = await this.contract.methods.updateGames().send({ from: this.defaultAccount });
            return result;
        } catch (error) {
            console.error('updateGames - error', error);
            return error;
        }
    }
}
