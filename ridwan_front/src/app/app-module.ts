import { NgModule, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing-module';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app';
import { VentesComponent } from './ventes/ventes';
import { AddVenteComponent } from './ventes/add-vente/add-vente';
import { FacturesComponent } from './factures/factures';
import { FactureDetailComponent } from './factures/facture-detail/facture-detail';
import { ProduitsComponent } from './produits/produits';
import { AddProduitComponent } from './produits/add-produit/add-produit';
import { DashboardComponent } from './dashboard/dashboard';
import { MouvementsComponent } from './mouvement/mouvement';

@NgModule({
  declarations: [
    AppComponent,
    VentesComponent,
    AddVenteComponent,
    FacturesComponent,
    FactureDetailComponent,
    ProduitsComponent,
    AddProduitComponent,
    DashboardComponent,
    MouvementsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
