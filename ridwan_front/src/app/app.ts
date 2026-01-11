import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.scss']
})
export class AppComponent {
  currentTab: 'produits' | 'add-vente' | 'factures' | 'facture-detail' | 'add-produit' = 'add-vente';

  factureSelectionnee: any = null;
  produitSelectionnee: any = null;

  ouvrirFactureDetail(facture: any) {
    this.factureSelectionnee = facture;
    this.currentTab = 'facture-detail';
  }

  modifierProduit(produit: any) {
    this.produitSelectionnee = produit;
    this.currentTab = 'add-produit';
  }

}
