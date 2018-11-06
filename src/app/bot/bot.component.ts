import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// keyframes,
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-bot',
  templateUrl: './bot.component.html',
  styleUrls: ['./bot.component.css'],
  animations: [
    trigger('logoAnimation', [
      transition('* => *', [
        query('.row', style({ opacity: 0, transform: 'translateX(-10px)' })),
        query('.row', stagger('0ms', [
          animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
        ]))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: 'translateX(-15px)' })),
        query(':enter', stagger('0ms', [
          animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
        ]))
      ])
    ])
  ]
})
export class BotComponent implements OnInit {

  index = 0;
  bot: any = [];
  triggerAction: Subject<any> = new Subject<any>();

  @Input() initial: Array<any> = [];
  @Output() action: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.init();
  }

  async init() {
    for (const o of this.initial) {
      await this.add(o);
    }
  }

  async add(o: any) {
    if (o.command === 'actions') {
      await this.addBotActions(o.flow);
    } else if (o.command === 'input') {
      await this.addBotInput(o.flow);
    } else {
      await this.addBotMessage(o.flow, o.image || '');
    }
  }

  onAction(i: number, field: string, object: any) {
    this.triggerAction.next({ i: i, message: object });
    this.action.emit({ field: field, object: object });
    event.preventDefault();
  }

  onKeyUp(botInput: any, btnSubmit: any) {
    btnSubmit.disabled = !botInput.validity.valid;
    return true;
  }

  scrollToBottom() {
    setTimeout(() => {
      if (window.$('html, body') && (window.$('#section-end') && window.$('#section-end').offset())) {
        window.$('html, body').animate({ scrollTop: window.$('#section-end').offset().top - 60 }, 1000);
      }
    }, 300);
  }

  showTyping(message: string) {
    return this.bot.push({ message: message, typing: true, from: 'bot' }) - 1;
  }

  removeTyping(index: number) {
    this.bot[index].typing = false;
    this.index++;
    this.scrollToBottom();
  }

  async addBotMessage(message: string, image: string) {
    return new Promise((resolve) => {
      const i = this.bot.push({ message: message, image: image, typing: true, from: 'bot' }) - 1;
      setTimeout(() => {
        this.bot[i].typing = false;
        this.index++;
        this.scrollToBottom();
        resolve(i);
      }, 1000);
    });
  }

  async addBotActions(object: any) {
    return new Promise((resolve) => {
      const tmpActions = {};
      tmpActions['field'] = object.field;
      tmpActions['actions'] = object.actions;
      tmpActions['typing'] = false;
      tmpActions['from'] = 'bot';
      const i = this.bot.push(tmpActions) - 1;
      this.triggerAction.pipe(take(1)).subscribe((response: any) => {
        this.bot.splice(response.i, 1);
        this.bot.push({ message: response.message, typing: false, from: 'me' });
        this.scrollToBottom();
        resolve(response.i);
      });
    });
  }

  async addBotInput(input: any) {
    return new Promise((resolve) => {
      const tmpInput = input;
      tmpInput['typing'] = false;
      tmpInput['input'] = true;
      tmpInput['from'] = 'bot';
      const i = this.bot.push(tmpInput) - 1;
      this.triggerAction.pipe(take(1)).subscribe((response: any) => {
        this.bot.splice(response.i, 1);
        this.bot.push({ message: response.message, typing: false, from: 'me' });
        this.scrollToBottom();
        resolve(response.i);
      });
    });
  }
}
