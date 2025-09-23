import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { productsReducer } from './state/products.reducer';
import { ProductsEffects } from './state/products.effects';
import { ProductsPageComponent } from './products/products-page.component';

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule, CommonModule, HttpClientModule, ReactiveFormsModule, AppRoutingModule,
    ProductsPageComponent,
    StoreModule.forRoot({ products: productsReducer }, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: false,
        strictActionSerializability: false,
      }
    }),
    EffectsModule.forRoot([ProductsEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 })
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule {}
