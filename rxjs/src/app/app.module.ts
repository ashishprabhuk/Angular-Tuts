import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { BasicComponent } from './Components/basic/basic.component';
import { IntermediateComponent } from './Components/intermediate/intermediate.component';
import { AdvancedComponent } from './Components/advanced/advanced.component';

const routes: Routes = [
  { path: 'basic', component: BasicComponent },
  { path: 'intermediate', component: IntermediateComponent },
  { path: 'advanced', component: AdvancedComponent },
  { path: '', redirectTo: 'basic', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    BasicComponent,
    IntermediateComponent,
    AdvancedComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }