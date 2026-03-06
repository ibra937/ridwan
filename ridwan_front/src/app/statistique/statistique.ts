import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { FacturesService } from '../factures/factures.service';
import { ProduitsService } from '../produits/produits.service';
import { VentesService } from '../ventes/ventes.service';

@Component({
  selector: 'app-stats',
  templateUrl: './statistique.html',
  styleUrls: ['./statistique.scss'],
  standalone: false,
})
export class StatsComponent implements OnInit {

  factures: any[] = [];
  ventes: any[] = [];

  facturesFiltrees: any[] = [];
  ventesFiltrees: any[] = [];

  periodeSelectionnee: string = 'mois';

  kpi = {
    chiffreAffaires: 0,
    totalFactures: 0,
    totalQuantiteVendue: 0
  };

  variationCA: number = 0;
  topProduits: any[] = [];

  monthlyChart: any;
  topProductsChart: any;

  constructor(
    private factureSvc: FacturesService,
    private venteSvc: VentesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ===============================
  // LOAD DATA
  // ===============================

  loadData() {
    this.factureSvc.getFactures().subscribe(f => {
      this.factures = f;
      this.updateStats();
      this.cd.detectChanges();
    });

    this.venteSvc.getVentes().subscribe(v => {
      this.ventes = v;
      this.updateStats();
      this.cd.detectChanges();
    });

  }

  changerPeriode() {
    this.updateStats();
  }

  updateStats() {
    if (!this.factures.length || !this.ventes.length) return;

    this.filtrerDonnees();
    this.calculerKpi();
    this.calculerVariation();
    this.genererGraphique();
    this.genererTopProduits();
  }

  // ===============================
  // FILTRAGE
  // ===============================

  filtrerDonnees() {
    const now = new Date();

    this.facturesFiltrees = this.factures.filter(f => {
      const d = new Date(f.created_at);
      return this.estDansPeriode(d, now);
    });

    this.ventesFiltrees = this.ventes.filter(v => {
      const d = new Date(v.created_at);
      return this.estDansPeriode(d, now);
    });
  }

  estDansPeriode(date: Date, now: Date): boolean {

    if (this.periodeSelectionnee === 'mois') {
      return date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear();
    }

    if (this.periodeSelectionnee === 'trimestre') {
      const tNow = Math.floor(now.getMonth() / 3);
      const tDate = Math.floor(date.getMonth() / 3);
      return tNow === tDate &&
             date.getFullYear() === now.getFullYear();
    }

    if (this.periodeSelectionnee === 'annee') {
      return date.getFullYear() === now.getFullYear();
    }

    return true;
  }

  // ===============================
  // KPI
  // ===============================

  calculerKpi() {
    this.kpi.totalFactures = this.facturesFiltrees.length;

    this.kpi.chiffreAffaires =
    this.facturesFiltrees.reduce((s, f) =>
      s + Number(f.total_prix), 0);
    
    this.kpi.totalQuantiteVendue =
      this.ventesFiltrees.reduce((s, v) =>
        s + Number(v.quantite), 0);
  }

  // ===============================
  // VARIATION CA
  // ===============================

  calculerVariation() {

    const now = new Date();
    let facturesPrecedentes: any[] = [];

    if (this.periodeSelectionnee === 'mois') {

      const moisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1);

      facturesPrecedentes = this.factures.filter(f => {
        const d = new Date(f.created_at);
        return d.getMonth() === moisPrecedent.getMonth() &&
               d.getFullYear() === moisPrecedent.getFullYear();
      });
    }

    if (this.periodeSelectionnee === 'trimestre') {

      const trimestreActuel = Math.floor(now.getMonth() / 3);
      const trimestrePrecedent = trimestreActuel - 1;

      facturesPrecedentes = this.factures.filter(f => {
        const d = new Date(f.created_at);
        return Math.floor(d.getMonth() / 3) === trimestrePrecedent &&
               d.getFullYear() === now.getFullYear();
      });
    }

    if (this.periodeSelectionnee === 'annee') {

      const anneePrecedente = now.getFullYear() - 1;

      facturesPrecedentes = this.factures.filter(f => {
        const d = new Date(f.created_at);
        return d.getFullYear() === anneePrecedente;
      });
    }

    const totalPrecedent =
      facturesPrecedentes.reduce((s, f) =>
        s + Number(f.total_prix), 0);

    const totalActuel = this.kpi.chiffreAffaires;

    if (totalPrecedent === 0) {
      this.variationCA = totalActuel > 0 ? 100 : 0;
    } else {
      this.variationCA =
        Math.round(((totalActuel - totalPrecedent) / totalPrecedent) * 100);
    }
  }

  // ===============================
  // GRAPHIQUE CA PAR JOUR
  // ===============================

  genererGraphique() {

    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }

    const ventesParJour: any = {};

    this.facturesFiltrees.forEach(f => {
      const jour = new Date(f.created_at).getDate();
      ventesParJour[jour] =
        (ventesParJour[jour] || 0) + Number(f.total_prix);
    });

    this.monthlyChart = new Chart("monthlyChart", {
      type: 'line',
      data: {
        labels: Object.keys(ventesParJour),
        datasets: [{
          label: 'Chiffre d\'affaires',
          data: Object.values(ventesParJour),
          tension: 0.4,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.2)',
          fill: true
        }]
      }
    });
  }

  // ===============================
  // TOP PRODUITS
  // ===============================

  genererTopProduits() {

    const compteur: any = {};

    this.ventesFiltrees.forEach(v => {
      if (!compteur[v.produit]) {
        compteur[v.produit] = 0;
      }
      compteur[v.produit] += Number(v.quantite);
    });

    const arr = Object.keys(compteur).map(nom => ({
      nom: nom,
      quantite: compteur[nom]
    }));

    arr.sort((a, b) => b.quantite - a.quantite);

    this.topProduits = arr.slice(0, 5);

    this.genererGraphiqueTopProduits();
  }

  genererGraphiqueTopProduits() {

    if (this.topProductsChart) {
      this.topProductsChart.destroy();
    }

    this.topProductsChart = new Chart("topProductsChart", {
      type: 'bar',
      data: {
        labels: this.topProduits.map(p => p.nom),
        datasets: [{
          label: 'Quantité vendue',
          data: this.topProduits.map(p => p.quantite),
          backgroundColor: '#16a34a'
        }]
      }
    });
  }

}