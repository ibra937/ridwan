import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProduitsService } from '../produits/produits.service';
import { FacturesService } from '../factures/factures.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit {

  loading = false;

  // 🔵 KPIs
  stats = {
    totalProduits: 0,
    valeurStock: 0,
    ventesAujourdHui: 0,
    totalFactures: 0,
    seuilBas: 0
  };

  // 📊 Graphique ventes 7 jours
  ventes7Jours: any[] = [];

  // 🟣 Stock par catégorie
  stockCategories: any[] = [];

  // 🟡 Activité récente (dérivée des factures)
  mouvements: any[] = [];

  // 🔴 Alertes stock bas
  alertes: any[] = [];

  constructor(
    private produitsSvc: ProduitsService,
    private facturesSvc: FacturesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerDashboard();
  }

  /** CHARGEMENT GLOBAL */
  chargerDashboard() {
    this.loading = true;

    this.produitsSvc.getProduits().subscribe({
      next: (produits) => {
        this.analyserProduits(produits);

        // Ensuite on charge les factures
        this.facturesSvc.getFactures().subscribe({
          next: (factures) => {
            this.analyserFactures(factures);
            this.loading = false;
            this.cd.detectChanges();
          },
          error: () => {
            console.error("Erreur API factures");
            this.loading = false;
          }
        });
      },
      error: () => {
        console.error("Erreur API produits");
        this.loading = false;
      }
    });
  }

  /** 🔍 Analyse Produits */
  analyserProduits(produits: any[]) {
    // Total
    this.stats.totalProduits = produits.length;

    // Valeur totale stock
    this.stats.valeurStock = produits.reduce(
      (sum: number, p: any) => sum + (p.prix * p.quantite || 0),
      0
    );

    // Seuil bas (stock <= 5 par exemple)
    this.alertes = produits
      .filter(p => p.quantite <= 5)
      .map(p => ({ produit: p.nom, stock: p.quantite }));

    // Répartition par catégorie
    const mapCat: any = {};
    produits.forEach((p) => {
      if (!mapCat[p.categorie]) mapCat[p.categorie] = 0;
      mapCat[p.categorie] += p.quantite;
    });

    this.stockCategories = Object.entries(mapCat).map(
      ([cat, qty]: any) => ({ cat, qty })
    );
  }

  /** 🔍 Analyse Factures */
  analyserFactures(factures: any[]) {
    this.stats.totalFactures = factures.length;

    // Ventes du jour
    const today = new Date().toISOString().slice(0, 10);
    this.stats.ventesAujourdHui = factures.filter(f => f.created_at.slice(0, 10) === today).length;

    // Graphique 7 jours
    const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const map: any = {};

    // Initialise à zéro
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }

    // Comptage réel
    factures.forEach(f => {
      if (map[f.created_at.slice(0, 10)] !== undefined) {
        map[f.created_at.slice(0, 10)] += 1;
      }
    });

    // Construction du tableau
    this.ventes7Jours = Object.entries(map).map(([date, valeur]: any) => {
      const d = new Date(date);
      return {
        jour: jours[d.getDay()],
        valeur
      };
    }).reverse();

    // Activité récente (on prend les 5 dernières factures)
    this.mouvements = factures
      .slice(-5)
      .map(f => ({
        type: 'Vente',
        produit: f.client || 'Client',
        qty: f.total || '--',
        date: f.date
      }))
      .reverse();
  }
}
