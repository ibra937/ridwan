import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
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

  periodeSelectionnee: string = 'mois';

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

  variationCA: number = 0;
  meilleurJour: string = '-';
  categorieLeader: string = '-';
  alertesCritiques: number = 0;

  alertes: any[] = [];
  stockCategories: any[] = [];
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

  constructor(
    private factureSvc: FacturesService,
    private produitSvc: ProduitsService,
    private venteSvc: VentesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.produitSvc.getProduits().subscribe(p => {
      this.produits = p;
      this.analyserProduits();
      this.updateStats();
      this.cd.detectChanges();
    });

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

  filtrerDonnees() {
    const now = new Date();

    this.facturesFiltrees = this.factures.filter(f =>
      this.estDansPeriode(new Date(f.created_at), now)
    );

    this.ventesFiltrees = this.ventes.filter(v =>
      this.estDansPeriode(new Date(v.created_at), now)
    );
  }

  estDansPeriode(date: Date, now: Date): boolean {
    if (this.periodeSelectionnee === 'mois')
      return date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear();

    if (this.periodeSelectionnee === 'annee')
      return date.getFullYear() === now.getFullYear();

    return true;
  }

  calculerKpi() {
    this.kpi.chiffreAffaires =
      this.facturesFiltrees.reduce((s, f) => s + Number(f.total_prix), 0);

    this.kpi.totalQuantiteVendue =
      this.ventesFiltrees.reduce((s, v) => s + Number(v.quantite), 0);

    this.kpi.panierMoyen =
      this.facturesFiltrees.length > 0
        ? Math.round(this.kpi.chiffreAffaires / this.facturesFiltrees.length)
        : 0;

    this.kpi.indiceVentes = this.kpi.totalQuantiteVendue;
  }

  calculerVariation() {
    const now = new Date();
    const moisPrecedent = new Date(now.getFullYear(), now.getMonth()-1);

    const precedent = this.factures.filter(f => {
      const d = new Date(f.created_at);
      return d.getMonth() === moisPrecedent.getMonth() &&
             d.getFullYear() === moisPrecedent.getFullYear();
    });

    const totalPrec = precedent.reduce((s,f)=>s+Number(f.total_prix),0);

    this.variationCA = totalPrec === 0
      ? 0
      : Math.round(((this.kpi.chiffreAffaires-totalPrec)/totalPrec)*100);
  }

  calculerCroissanceAnnuelle() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const prevYear = currentYear - 1;

    const totalActuel = this.factures
      .filter(f => new Date(f.created_at).getFullYear() === currentYear)
      .reduce((s,f)=>s+Number(f.total_prix),0);

    const totalPrec = this.factures
      .filter(f => new Date(f.created_at).getFullYear() === prevYear)
      .reduce((s,f)=>s+Number(f.total_prix),0);

    this.kpi.croissanceAnnuelle =
      totalPrec === 0 ? 0 :
      Math.round(((totalActuel-totalPrec)/totalPrec)*100);
  }

  calculerJourPerformant() {
    const map: any = {};

    this.facturesFiltrees.forEach(f => {
      const jour = new Date(f.created_at).getDate();
      map[jour] = (map[jour] || 0) + Number(f.total_prix);
    });

    let max = 0;
    let best = '-';

    Object.keys(map).forEach(j => {
      if (map[j] > max) {
        max = map[j];
        best = j;
      }
    });

    this.meilleurJour = best !== '-' ? `Jour ${best}` : '-';
  }

  analyserProduits() {
    this.alertes = this.produits
      .filter(p => p.quantite <= 15)
      .map(p => ({
        produit: p.produit,
        stock: p.quantite,
        critique: p.quantite === 0
      }));
  }

  genererResumeExecutif() {
    this.alertesCritiques =
      this.alertes.filter(a => a.critique).length;
  }

  genererGraphique() {
    if(this.monthlyChart) this.monthlyChart.destroy();

    const data:any={};
    this.facturesFiltrees.forEach(f=>{
      const jour=new Date(f.created_at).getDate();
      data[jour]=(data[jour]||0)+Number(f.total_prix);
    });

    this.monthlyChart=new Chart("monthlyChart",{
      type:'line',
      data:{
        labels:Object.keys(data),
        datasets:[{
          data:Object.values(data),
          borderColor:'#2563eb',
          backgroundColor:'#2563eb33',
          fill:true,
          tension:0.4
        }]
      }
    });
  }

  genererComparaisonMois() {
    if (this.compareChart) this.compareChart.destroy();

    const now = new Date();
    const moisPrecedent = new Date(now.getFullYear(), now.getMonth()-1);

    const actuel = this.kpi.chiffreAffaires;

    const precedent = this.factures
      .filter(f=>{
        const d=new Date(f.created_at);
        return d.getMonth()===moisPrecedent.getMonth()
        && d.getFullYear()===moisPrecedent.getFullYear();
      })
      .reduce((s,f)=>s+Number(f.total_prix),0);

    this.compareChart=new Chart("compareChart",{
      type:'bar',
      data:{
        labels:['Mois Précédent','Mois Actuel'],
        datasets:[{
          data:[precedent,actuel],
          backgroundColor:['#94a3b8','#2563eb']
        }]
      }
    });
  }

  genererCAParCategorie() {
    if (this.categoryChart) this.categoryChart.destroy();
    
    const map: any = {};
    
    this.ventesFiltrees.forEach(v => {
      const produit = this.produits.find(p => p.produit === v.produit);
      if (!produit) return;
    
      if (!map[produit.categorie]) map[produit.categorie] = 0;
      map[produit.categorie] += Number(v.quantite) * Number(produit.prix);
    });
  
    const labels = Object.keys(map);
    const data = Object.values(map);
  
    this.categoryChart = new Chart("categoryChart", {
      type: 'bar', // 🔥 changé ici
      data: {
        labels: labels,
        datasets: [{
          label: 'Chiffre d\'affaires (€)',
          data: data,
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
            beginAtZero: true,
            title: {
              display: true,
              text: 'CA (€)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Catégories'
            }
          }
        }
      }
    });
  
    let max = 0;
    let leader = '-';
    labels.forEach((l: any) => {
      if (map[l] > max) {
        max = map[l];
        leader = l;
      }
    });
  
    this.categorieLeader = leader;
  }

  genererTopProduits() {
    const compteur:any={};

    this.ventesFiltrees.forEach(v=>{
      compteur[v.produit]=(compteur[v.produit]||0)+Number(v.quantite);
    });

    const arr=Object.keys(compteur).map(nom=>({
      nom,quantite:compteur[nom]
    }));

    arr.sort((a,b)=>b.quantite-a.quantite);
    this.topProduits=arr.slice(0,5);

    if(this.topProductsChart) this.topProductsChart.destroy();

    this.topProductsChart=new Chart("topProductsChart",{
      type:'bar',
      data:{
        labels:this.topProduits.map(p=>p.nom),
        datasets:[{
          data:this.topProduits.map(p=>p.quantite),
          backgroundColor:'#16a34a'
        }]
      }
    });
  }

  genererRepartitionStock() {

    if (this.stockChart) this.stockChart.destroy();

    const map: any = {};

    // Regrouper le stock par catégorie
    this.produits.forEach(p => {
      if (!map[p.categorie]) {
        map[p.categorie] = 0;
      }
      map[p.categorie] += Number(p.quantite);
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    this.stockChart = new Chart("stockChart", {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#2563eb',
            '#16a34a',
            '#f59e0b',
            '#dc2626',
            '#0ea5e9',
            '#9333ea'
          ]
        }]
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data
                  .reduce((a:any,b:any)=>a+b,0);
                const value = context.parsed;
                const percent = ((value/total)*100).toFixed(1);
                return `${context.label}: ${value} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }

  genererSparklines() {

    const caData = this.facturesFiltrees.map(f => Number(f.total_prix));
    const quantiteData = this.ventesFiltrees.map(v => Number(v.quantite));
    const panierData = caData.map((v,i)=> v/(i+1));
    const croissanceData = caData.map((v,i)=> i>0?v-caData[i-1]:0);

    if (this.sparklineCA) this.sparklineCA.destroy();
    if (this.sparklineIndice) this.sparklineIndice.destroy();
    if (this.sparklinePanier) this.sparklinePanier.destroy();
    if (this.sparklineCroissance) this.sparklineCroissance.destroy();

    this.sparklineCA = this.spark("sparkCA", caData);
    this.sparklineIndice = this.spark("sparkIndice", quantiteData);
    this.sparklinePanier = this.spark("sparkPanier", panierData);
    this.sparklineCroissance = this.spark("sparkCroissance", croissanceData);
  }

  spark(id:string,data:number[]){
    return new Chart(id,{
      type:'line',
      data:{
        labels:data.map((_,i)=>i),
        datasets:[{
          data:data,
          borderColor:'#ffffff',
          backgroundColor:'#ffffff33',
          fill:true,
          tension:0.4,
          pointRadius:0
        }]
      },
      options:{
        responsive:true,
        plugins:{ legend:{ display:false }},
        scales:{ x:{ display:false }, y:{ display:false }}
      }
    });
  }
}