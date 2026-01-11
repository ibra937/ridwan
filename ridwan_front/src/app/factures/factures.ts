import { Component, OnInit } from '@angular/core';
import { FacturesService } from './factures.service';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';



@Component({
  selector: 'app-factures',
  templateUrl: './factures.html',
  styleUrls: ['./factures.scss'],
  standalone: false
})
export class FacturesComponent implements OnInit {
  
  @Output() openDetail = new EventEmitter<any>();

  factures: any[] = [];
  facturesFiltrees: any[] = [];
  loading = false;

  search: string = '';

  triColonne: string = '';
  triAsc: boolean = true;

  constructor(
    private facturesService: FacturesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFactures();
  }

  /** Charger les factures depuis l'API */
  loadFactures() {
    this.loading = true;

    this.facturesService.getFactures().subscribe({
      next: (res: any) => {
        this.factures = res;
        this.facturesFiltrees = [...this.factures];
        this.loading = false;
      },
      error: err => {
        console.error("Erreur chargement factures:", err);
        this.loading = false;
      }
    });
  }

  /** Filtrer les factures en fonction de la recherche */
  filtrerFactures() {
    const q = this.search.trim().toLowerCase();

    this.facturesFiltrees = this.factures.filter(f =>
      f.numero_facture.toString().includes(q) ||
      (f.client && f.client.toLowerCase().includes(q))
    );
  }

  /** Trier les colonnes */
  trier(colonne: string) {
    if (this.triColonne === colonne) {
      this.triAsc = !this.triAsc;
    } else {
      this.triColonne = colonne;
      this.triAsc = true;
    }

    this.facturesFiltrees.sort((a, b) => {
      const x = (a[colonne] ?? '').toString().toLowerCase();
      const y = (b[colonne] ?? '').toString().toLowerCase();

      if (x < y) return this.triAsc ? -1 : 1;
      if (x > y) return this.triAsc ? 1 : -1;
      return 0;
    });
  }

  /** Retourner l’icône à afficher */
  getSortIcon(colonne: string) {
    if (this.triColonne !== colonne) return 'fa-sort';
    return this.triAsc ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  /** Ouvrir les détails d'une facture */
  voirDetails(facture: any) {
    this.openDetail.emit(facture);
  }

}
