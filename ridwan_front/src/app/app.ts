import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.scss']
})
export class AppComponent {

  /** Onglet actif */
  currentTab:
    | 'dashboard'
    | 'produits'
    | 'add-vente'
    | 'factures'
    | 'facture-detail'
    | 'add-produit'
    | 'stats'
    | 'mouvements'
    = 'dashboard';

  /** État du menu burger */
  menuOpen: boolean = false;

  /** Pour les détails */
  factureSelectionnee: any = null;
  produitSelectionnee: any = null;

  /** Ouvrir détail d'une facture */
  ouvrirFactureDetail(facture: any) {
    this.factureSelectionnee = facture;
    this.currentTab = 'facture-detail';
    this.menuOpen = false;
  }

  /** Modifier un produit */
  modifierProduit(produit: any) {
    this.produitSelectionnee = produit;
    this.currentTab = 'add-produit';
    this.menuOpen = false;
  }

  /** Navigation depuis la navbar */
  goTo(tab: any) {
    this.currentTab = tab;
    this.menuOpen = false;
  }
}
