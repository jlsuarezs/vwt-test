import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { PageNotFoundComponent } from '../pagenotfound/pagenotfound.component';

const routes: Routes = [
    {
      path: '',
      component: HomeComponent
    },
    {
      path: 'index.html',
      component: HomeComponent
    },
    {
      path: '**',
      component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { useHash: false })
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
export class AppRoutingModule {}
