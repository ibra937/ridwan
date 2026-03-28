import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VentesService } from './ventes.service';

@Component({
  selector: 'app-ventes',
  templateUrl: './ventes.html',
  standalone: false,
  styleUrls: ['./ventes.scss'],
})
export class VentesComponent implements OnInit {
  factures: any[] = [];
  facturesFiltrees: any[] = [];
  loading = false;
  search = '';

  constructor(
    private ventesService: VentesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.loading = true;
    this.ventesService.getVentes().subscribe({
      next: (res) => {
        this.factures = (res || []).map((f: any) => ({
          ...f,
          total_prix: Number(f.total_prix) || 0
        }));
        this.appliquerFiltres();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Erreur lors du chargement des factures.');
      }
    });
  }

  appliquerFiltres(): void {
    const term = this.search.trim().toLowerCase();
    this.facturesFiltrees = this.factures.filter((f) =>
      String(f.numero_facture || '').toLowerCase().includes(term) ||
      String(f.client || '').toLowerCase().includes(term)
    );
  }

  voirFacture(facture: any): void {
    alert(`Voir la facture ${facture.numero_facture}`);
  }
}
