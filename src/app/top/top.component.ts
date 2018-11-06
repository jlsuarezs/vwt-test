import { Component, OnInit } from '@angular/core';

import { Web3Service } from '../web3';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class TopComponent implements OnInit {

  constructor(public web3: Web3Service) { }

  ngOnInit() {
  }
}
