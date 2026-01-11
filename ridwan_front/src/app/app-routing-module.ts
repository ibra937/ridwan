import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentesComponent } from './ventes/ventes';
import { AddVenteComponent } from './ventes/add-vente/add-vente';
import { FacturesComponent } from './factures/factures';
import { FactureDetailComponent } from './factures/facture-detail/facture-detail';
import { ProduitsComponent } from './produits/produits';
import { AddProduitComponent } from './produits/add-produit/add-produit';
import { DashboardComponent } from './dashboard/dashboard';
import { MouvementsComponent } from './mouvement/mouvement';

const routes: Routes = [
  { path: "", redirectTo: "ventes", pathMatch: "full" },
  { path: "ventes", component: VentesComponent },
  { path: "ventes/add", component: AddVenteComponent },
  { path: "factures", component: FacturesComponent },
  { path: "facture/:id", component: FactureDetailComponent },
  { path: "produits", component: ProduitsComponent },
  { path: "add-produit", component: AddProduitComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "mouvements", component: MouvementsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
