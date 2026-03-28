import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ProduitsService } from './produits.service';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.html',
  standalone: false,
  styleUrls: ['./produits.scss']
})
export class ProduitsComponent implements OnInit {
  @Output() addProduit = new EventEmitter<any>();

  produits: any[] = [];
  produitsFiltres: any[] = [];
  loading = false;

  search = '';
  categorieFilter = 'all';

  constructor(
    private produitsService: ProduitsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  get categories(): string[] {
    const set = new Set<string>();
    this.produits.forEach((p) => {
      if (p.categorie) set.add(p.categorie);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  get nbStockFaible(): number {
    return this.produits.filter((p) => Number(p.quantite) > 0 && Number(p.quantite) <= 10).length;
  }

  get nbRupture(): number {
    return this.produits.filter((p) => Number(p.quantite) === 0).length;
  }

  loadProduits(): void {
    this.loading = true;
    this.produitsService.getProduits().subscribe({
      next: (res) => {
        this.produits = (res || []).map((p) => ({
          ...p,
          prix: Number(p.prix) || 0,
          quantite: Number(p.quantite) || 0
        }));
        this.appliquerFiltres();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    const term = this.search.trim().toLowerCase();

    this.produitsFiltres = this.produits
      .filter((p) => {
        const matchTerm =
          !term ||
          p.produit?.toLowerCase().includes(term) ||
          p.code_produit?.toLowerCase().includes(term) ||
          p.categorie?.toLowerCase().includes(term);

        const matchCategory =
          this.categorieFilter === 'all' || p.categorie === this.categorieFilter;

        return matchTerm && matchCategory;
      })
      .sort((a, b) => a.produit.localeCompare(b.produit));
  }

  deleteProduit(id: number): void {
    if (!confirm('Supprimer ce produit ?')) return;

    this.produitsService.deleteProduit(id).subscribe({
      next: () => {
        this.produits = this.produits.filter((p) => p.id !== id);
        this.appliquerFiltres();
      },
      error: (err) => console.error(err)
    });
  }

  updateProduit(produit: any): void {
    this.addProduit.emit(produit);
  }
}
