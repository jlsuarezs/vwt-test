import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing/app-routing.module';

// import { environment } from '../environments/environment';
import { Web3Module, Web3Service } from './web3';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { TopComponent } from './top/top.component';
import { SanitizeHtmlPipe } from './sanitizehtml.pipe';
import { BotComponent } from './bot/bot.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    TopComponent,
    SanitizeHtmlPipe,
    BotComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    Web3Module
  ],
  providers: [Web3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
