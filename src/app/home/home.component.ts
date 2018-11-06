import { Component, OnInit, ViewChild } from '@angular/core';
import { BotComponent } from '../bot/bot.component';

import { Web3Service } from '../web3';

import findIndex from 'lodash/findIndex';

const ACTION_METAMASK = 'INSTALL METAMASK';
const ACTION_GET_GAMES = 'GET GAMES';
const ACTION_UPDATE_GAMES = 'UPDATE GAMES';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('bot') bot: BotComponent;

  initial: any = [
    { flow: ' ', image: 'https://media.giphy.com/media/DwXOS8RqHocEM/200w_d.gif', command: 'message' }
  ];

  games: Array<any> = [];

  constructor(public web3: Web3Service) {
  }

  ngOnInit() {
    this.web3.watchEthereum();
    this.web3.accountsObservable.subscribe(async (state) => {
      // console.log(`accountsObservable: ${ state }`);
      if ( state === 'ERROR' || state === 'UNLOCK ACCOUNT' ) {
        await this.bot.add({ flow: 'Couldn\'t get any accounts! Make sure you have MetaMask installed and unlocked.', command: 'message' });
        await this.bot.add({
          flow: {
            field: 'state', actions: [
              { caption: ACTION_METAMASK, type: 'button', icon: 'ti-list', hideCaption: false },
            ]
          }, command: 'actions'
        });
      } else {
        await this.next();
      }
    });
  }

  initialState() {
    return {
      flow: {
        field: 'state', actions: [
          { caption: ACTION_GET_GAMES, type: 'button', icon: 'ti-list', hideCaption: false },
          { caption: ACTION_UPDATE_GAMES, type: 'button', icon: 'ti-game', hideCaption: false },
        ]
      }, command: 'actions'
    };
  }

  async next() {
    await this.bot.add({ flow: 'What would you like to do? 👍🏻👏🏻', command: 'message' });
    await this.bot.add(this.initialState());
  }

  async onAction(event: any) {
    if (event.object === ACTION_GET_GAMES) {
      await this.bot.add({ flow: 'Ok, no problem.', command: 'message' });
      const res = await this.web3.getGames();
      await this.bot.add({ flow: 'Here\'s our list of games:', command: 'message' });
      this.games = JSON.parse(res).map((item) => {
        return { caption: item, type: 'button', hideCaption: false };
      });
      await this.bot.add({
        flow: {
          field: 'state', actions: this.games
        }, command: 'actions'
      });
    } else if (event.object === ACTION_UPDATE_GAMES) {
      const i = this.bot.showTyping('Transaction information:');
      const res = await this.web3.updateGames();
      this.bot.removeTyping(i);
      await this.bot.add({ flow: res, command: 'message' });
      await this.next();
    } else if (event.object === ACTION_METAMASK) {
      window.open('https://www.metamask.io', '_blank');
    } else if (findIndex(this.games, { caption: event.object }) !== -1) {
      await this.bot.add({ flow: `Great!, initialising ${event.object}...`, command: 'message' });
      await this.next();
    } else {
      await this.next();
    }
  }

}
