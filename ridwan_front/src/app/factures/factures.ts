import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FacturesService } from './factures.service';

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

  search = '';
  triColonne = 'numero_facture';
  triAsc = false;

  constructor(
    private facturesService: FacturesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  get totalFactures(): number {
    return this.facturesFiltrees.length;
  }

  get montantTotal(): number {
    return this.facturesFiltrees.reduce((sum, f) => sum + (Number(f.total_prix) || 0), 0);
  }

  get totalClients(): number {
    const set = new Set<string>();
    this.facturesFiltrees.forEach((f) => {
      if (f.client) set.add(String(f.client).trim().toLowerCase());
    });
    return set.size;
  }

  loadFactures(): void {
    this.loading = true;

    this.facturesService.getFactures().subscribe({
      next: (res: any) => {
        this.factures = (res || []).map((f: any) => ({
          ...f,
          total_prix: Number(f.total_prix) || 0
        }));
        this.appliquerFiltres();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement factures:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  appliquerFiltres(): void {
    const q = this.search.trim().toLowerCase();

    this.facturesFiltrees = this.factures.filter((f) =>
      String(f.numero_facture || '').toLowerCase().includes(q) ||
      String(f.client || '').toLowerCase().includes(q)
    );

    this.trier(this.triColonne, false);
  }

  trier(colonne: string, toggle = true): void {
    if (toggle) {
      if (this.triColonne === colonne) {
        this.triAsc = !this.triAsc;
      } else {
        this.triColonne = colonne;
        this.triAsc = true;
      }
    }

    this.facturesFiltrees.sort((a, b) => {
      let x: any = a[colonne];
      let y: any = b[colonne];

      if (colonne === 'total_prix') {
        x = Number(x) || 0;
        y = Number(y) || 0;
      } else {
        x = String(x ?? '').toLowerCase();
        y = String(y ?? '').toLowerCase();
      }

      if (x < y) return this.triAsc ? -1 : 1;
      if (x > y) return this.triAsc ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(colonne: string): string {
    if (this.triColonne !== colonne) return 'fa-sort';
    return this.triAsc ? 'fa-arrow-up' : 'fa-arrow-down';
  }

  voirDetails(facture: any): void {
    this.openDetail.emit(facture);
  }
}
