import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FacturesService } from '../factures/factures.service';
import { ProduitsService } from '../produits/produits.service';
import { VentesService } from '../ventes/ventes.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  periodeSelectionnee = 'mois';

  produits: any[] = [];
  factures: any[] = [];
  ventes: any[] = [];

  facturesFiltrees: any[] = [];
  ventesFiltrees: any[] = [];

  kpi = {
    chiffreAffaires: 0,
    totalQuantiteVendue: 0,
    panierMoyen: 0,
    indiceVentes: 0,
    croissanceAnnuelle: 0
  };

  variationCA = 0;
  meilleurJour = '-';
  categorieLeader = '-';
  alertesCritiques = 0;

  alertes: any[] = [];
  topProduits: any[] = [];

  monthlyChart: any;
  topProductsChart: any;
  stockChart: any;
  compareChart: any;
  categoryChart: any;

  sparklineCA: any;
  sparklineIndice: any;
  sparklinePanier: any;
  sparklineCroissance: any;

  private ChartCtor: any = null;
  private chartLoadPromise: Promise<void> | null = null;

  constructor(
    private factureSvc: FacturesService,
    private produitSvc: ProduitsService,
    private venteSvc: VentesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    void this.ensureChartLibrary().then(() => this.updateStats());
    this.loadData();
  }

  private ensureChartLibrary(): Promise<void> {
    if (this.ChartCtor) {
      return Promise.resolve();
    }

    if (!this.chartLoadPromise) {
      this.chartLoadPromise = import('chart.js/auto').then((mod) => {
        this.ChartCtor = mod.Chart;
      });
    }

    return this.chartLoadPromise;
  }

  loadData(): void {
    this.produitSvc.getProduits().subscribe((p) => {
      this.produits = p || [];
      this.analyserProduits();
      this.updateStats();
      this.cd.detectChanges();
    });

    this.factureSvc.getFactures().subscribe((f) => {
      this.factures = f || [];
      this.updateStats();
      this.cd.detectChanges();
    });

    this.venteSvc.getVentes().subscribe((v) => {
      this.ventes = v || [];
      this.updateStats();
      this.cd.detectChanges();
    });
  }

  changerPeriode(): void {
    this.updateStats();
  }

  updateStats(): void {
    if (!this.factures.length) return;

    this.filtrerDonnees();
    this.calculerKpi();
    this.calculerVariation();
    this.calculerCroissanceAnnuelle();
    this.calculerJourPerformant();
    this.genererTopProduits();
    this.genererCAParCategorie();
    this.genererGraphique();
    this.genererComparaisonMois();
    this.genererRepartitionStock();
    this.genererSparklines();
    this.genererResumeExecutif();
  }

  filtrerDonnees(): void {
    const now = new Date();
    this.facturesFiltrees = this.factures.filter((f) =>
      this.estDansPeriode(new Date(f.created_at), now)
    );
    this.ventesFiltrees = this.ventes.filter((v) =>
      this.estDansPeriode(new Date(v.created_at), now)
    );
  }

  estDansPeriode(date: Date, now: Date): boolean {
    if (this.periodeSelectionnee === 'mois') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    if (this.periodeSelectionnee === 'annee') {
      return date.getFullYear() === now.getFullYear();
    }

    return true;
  }

  calculerKpi(): void {
    this.kpi.chiffreAffaires = this.facturesFiltrees.reduce((s, f) => s + Number(f.total_prix), 0);
    this.kpi.totalQuantiteVendue = this.ventesFiltrees.reduce((s, v) => s + Number(v.quantite), 0);
    this.kpi.panierMoyen = this.facturesFiltrees.length
      ? Math.round(this.kpi.chiffreAffaires / this.facturesFiltrees.length)
      : 0;
    this.kpi.indiceVentes = this.kpi.totalQuantiteVendue;
  }

  calculerVariation(): void {
    const now = new Date();
    const moisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1);

    const precedent = this.factures.filter((f) => {
      const d = new Date(f.created_at);
      return d.getMonth() === moisPrecedent.getMonth() && d.getFullYear() === moisPrecedent.getFullYear();
    });

    const totalPrec = precedent.reduce((s, f) => s + Number(f.total_prix), 0);
    this.variationCA = totalPrec === 0
      ? 0
      : Math.round(((this.kpi.chiffreAffaires - totalPrec) / totalPrec) * 100);
  }

  calculerCroissanceAnnuelle(): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const prevYear = currentYear - 1;

    const totalActuel = this.factures
      .filter((f) => new Date(f.created_at).getFullYear() === currentYear)
      .reduce((s, f) => s + Number(f.total_prix), 0);

    const totalPrec = this.factures
      .filter((f) => new Date(f.created_at).getFullYear() === prevYear)
      .reduce((s, f) => s + Number(f.total_prix), 0);

    this.kpi.croissanceAnnuelle = totalPrec === 0
      ? 0
      : Math.round(((totalActuel - totalPrec) / totalPrec) * 100);
  }

  calculerJourPerformant(): void {
    const map: Record<string, number> = {};
    this.facturesFiltrees.forEach((f) => {
      const jour = new Date(f.created_at).getDate();
      map[jour] = (map[jour] || 0) + Number(f.total_prix);
    });

    let max = 0;
    let best = '-';
    Object.keys(map).forEach((j) => {
      if (map[j] > max) {
        max = map[j];
        best = j;
      }
    });

    this.meilleurJour = best !== '-' ? `Jour ${best}` : '-';
  }

  analyserProduits(): void {
    this.alertes = this.produits
      .filter((p) => Number(p.quantite) <= 15)
      .map((p) => ({
        produit: p.produit,
        stock: Number(p.quantite),
        critique: Number(p.quantite) === 0
      }));
  }

  genererResumeExecutif(): void {
    this.alertesCritiques = this.alertes.filter((a) => a.critique).length;
  }

  genererGraphique(): void {
    const Chart = this.ChartCtor;
    if (!Chart) return;

    if (this.monthlyChart) this.monthlyChart.destroy();

    const data: Record<string, number> = {};
    this.facturesFiltrees.forEach((f) => {
      const jour = new Date(f.created_at).getDate();
      data[jour] = (data[jour] || 0) + Number(f.total_prix);
    });

    this.monthlyChart = new Chart('monthlyChart', {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          borderColor: '#2563eb',
          backgroundColor: '#2563eb33',
          fill: true,
          tension: 0.4
        }]
      }
    });
  }

  genererComparaisonMois(): void {
    const Chart = this.ChartCtor;
    if (!Chart) return;

    if (this.compareChart) this.compareChart.destroy();

    const now = new Date();
    const moisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1);
    const actuel = this.kpi.chiffreAffaires;

    const precedent = this.factures
      .filter((f) => {
        const d = new Date(f.created_at);
        return d.getMonth() === moisPrecedent.getMonth() && d.getFullYear() === moisPrecedent.getFullYear();
      })
      .reduce((s, f) => s + Number(f.total_prix), 0);

    this.compareChart = new Chart('compareChart', {
      type: 'bar',
      data: {
        labels: ['Mois precedent', 'Mois actuel'],
        datasets: [{
          data: [precedent, actuel],
          backgroundColor: ['#94a3b8', '#2563eb']
        }]
      }
    });
  }

  genererCAParCategorie(): void {
    const Chart = this.ChartCtor;
    if (!Chart) return;

    if (this.categoryChart) this.categoryChart.destroy();

    const map: Record<string, number> = {};
    this.ventesFiltrees.forEach((v) => {
      const produit = this.produits.find((p) => p.produit === v.produit);
      if (!produit) return;
      const categorie = produit.categorie || 'Sans categorie';
      map[categorie] = (map[categorie] || 0) + Number(v.quantite) * Number(produit.prix);
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    this.categoryChart = new Chart('categoryChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: "Chiffre d'affaires",
          data,
          backgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    let max = 0;
    let leader = '-';
    labels.forEach((l) => {
      if (map[l] > max) {
        max = map[l];
        leader = l;
      }
    });
    this.categorieLeader = leader;
  }

  genererTopProduits(): void {
    const Chart = this.ChartCtor;
    if (!Chart) return;

    const compteur: Record<string, number> = {};
    this.ventesFiltrees.forEach((v) => {
      compteur[v.produit] = (compteur[v.produit] || 0) + Number(v.quantite);
    });

    const arr = Object.keys(compteur).map((nom) => ({
      nom,
      quantite: compteur[nom]
    }));
    arr.sort((a, b) => b.quantite - a.quantite);
    this.topProduits = arr.slice(0, 5);

    if (this.topProductsChart) this.topProductsChart.destroy();

    this.topProductsChart = new Chart('topProductsChart', {
      type: 'bar',
      data: {
        labels: this.topProduits.map((p) => p.nom),
        datasets: [{
          data: this.topProduits.map((p) => p.quantite),
          backgroundColor: '#16a34a'
        }]
      }
    });
  }

  genererRepartitionStock(): void {
    const Chart = this.ChartCtor;
    if (!Chart) return;

    if (this.stockChart) this.stockChart.destroy();

    const map: Record<string, number> = {};
    this.produits.forEach((p) => {
      const categorie = p.categorie || 'Sans categorie';
      map[categorie] = (map[categorie] || 0) + Number(p.quantite);
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    this.stockChart = new Chart('stockChart', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#0ea5e9', '#9333ea']
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = context.parsed;
                const percent = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }

  genererSparklines(): void {
    const Chart = this.ChartCtor;
    if (!Chart) return;

    const caData = this.facturesFiltrees.map((f) => Number(f.total_prix));
    const quantiteData = this.ventesFiltrees.map((v) => Number(v.quantite));
    const panierData = caData.map((v, i) => v / (i + 1));
    const croissanceData = caData.map((v, i) => (i > 0 ? v - caData[i - 1] : 0));

    if (this.sparklineCA) this.sparklineCA.destroy();
    if (this.sparklineIndice) this.sparklineIndice.destroy();
    if (this.sparklinePanier) this.sparklinePanier.destroy();
    if (this.sparklineCroissance) this.sparklineCroissance.destroy();

    this.sparklineCA = this.spark('sparkCA', caData);
    this.sparklineIndice = this.spark('sparkIndice', quantiteData);
    this.sparklinePanier = this.spark('sparkPanier', panierData);
    this.sparklineCroissance = this.spark('sparkCroissance', croissanceData);
  }

  spark(id: string, data: number[]): any {
    const Chart = this.ChartCtor;
    if (!Chart) return null;

    return new Chart(id, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: '#ffffff',
          backgroundColor: '#ffffff33',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });
  }
}
