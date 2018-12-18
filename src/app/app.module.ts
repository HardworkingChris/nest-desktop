import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


// modules
import { AppRoutingModule } from './modules/app-routing.module';
import { ConfigModule } from './config/config.module';
import { MainModule } from './main/main.module';
import { MaterialModule } from './modules/material.module';
import { ModelModule } from './model/model.module';
import { NavigationModule } from './navigation/navigation.module';
import { SimulationModule } from './simulation/simulation.module';

// components
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    // NoopAnimationsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ConfigModule,
    FontAwesomeModule,
    MainModule,
    MaterialModule,
    ModelModule,
    NavigationModule,
    SimulationModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }