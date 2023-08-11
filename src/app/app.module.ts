import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './home/map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { HeaderComponent } from './home/header/header.component';
import { NgOptimizedImage } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { SidebarComponent } from './home/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapComponent,
    HeaderComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LeafletModule,
    HttpClientModule,
    NgOptimizedImage
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
