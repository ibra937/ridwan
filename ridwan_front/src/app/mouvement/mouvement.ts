import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MouvementsService } from './mouvement.service';

@Component({
  selector: 'app-mouvements',
  templateUrl: './mouvement.html',
  styleUrls: ['./mouvement.scss'],
  standalone: false
})
export class MouvementsComponent implements OnInit {
  loading = false;
  mouvements: any[] = [];
  mouvementsFiltres: any[] = [];

  search = '';
  typeFilter = 'all';

  constructor(
    private svc: MouvementsService,
    private changeDetection: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMouvements();
  }

  get totalEntrees(): number {
    return this.mouvementsFiltres.filter((m) => m.type_mouvement === 'ENTREE').length;
  }

  get totalSorties(): number {
    return this.mouvementsFiltres.filter((m) => m.type_mouvement === 'SORTIE').length;
  }

  loadMouvements(): void {
    this.loading = true;

    this.svc.getMouvements().subscribe({
      next: (data) => {
        this.mouvements = (data || []).map((m: any) => ({
          ...m,
          quantite: Number(m.quantite) || 0
        }));
        this.appliquerFiltres();
        this.loading = false;
        this.changeDetection.detectChanges();
      },
      error: () => {
        alert('Erreur lors du chargement des mouvements');
        this.loading = false;
        this.changeDetection.detectChanges();
      }
    });
  }

  appliquerFiltres(): void {
    const term = this.search.trim().toLowerCase();

    this.mouvementsFiltres = this.mouvements.filter((m) => {
      const matchType = this.typeFilter === 'all' || m.type_mouvement === this.typeFilter;
      const matchTerm =
        !term ||
        String(m.produit || '').toLowerCase().includes(term) ||
        String(m.categorie || '').toLowerCase().includes(term) ||
        String(m.description || '').toLowerCase().includes(term);

      return matchType && matchTerm;
    });
  }
}
