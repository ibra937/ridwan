import { Component, ChangeDetectorRef } from '@angular/core';
import { AddVenteService } from './add-vente.service';

@Component({
  selector: 'app-add-vente',
  templateUrl: './add-vente.html',
  styleUrls: ['./add-vente.scss'],
  standalone: false
})
export class AddVenteComponent {
  
  client = '';
  lignes: any[] = [];

  produitsDisponibles: any[] = [];
  filteredProduits: any[] = [];

  search = '';
  selectedProduitId: any = '';

  popup = false;
  loading = false;

  constructor(
    private addVenteService: AddVenteService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProduits();
  }

  loadProduits() {
    this.addVenteService.produits().subscribe({
      next: (res) => {
        this.produitsDisponibles = res;
        this.filterProduits();
        this.cd.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  filterProduits() {
    const term = this.search.toLowerCase();

    this.filteredProduits = this.produitsDisponibles.filter(p =>
      p.code_produit?.toLowerCase().includes(term) ||
      p.produit?.toLowerCase().includes(term)
    );
  }

  ajouterProduitDepuisSelect() {
    if (!this.selectedProduitId) return;

    const p = this.produitsDisponibles.find(x => x.id == this.selectedProduitId);
    if (!p) return;

    this.ajouterProduit(p);

    this.selectedProduitId = '';
    this.search = '';
    this.filterProduits();
  }

  ajouterProduit(p: any) {
    const exist = this.lignes.find(l => l.code_produit === p.code_produit);

    if (exist) {
      exist.quantite++;
      exist.total = exist.quantite * exist.prix_unitaire;
      return;
    }

    this.lignes.push({
      code_produit: p.code_produit,
      produit: p.produit,
      quantite: 1,
      prix_unitaire: p.prix,
      total: p.prix
    });
  }

  changerQuantite(i: number, delta: number) {
    const l = this.lignes[i];
    l.quantite = Math.max(1, l.quantite + delta);
    l.total = l.quantite * l.prix_unitaire;
  }

  supprimer(i: number) {
    this.lignes.splice(i, 1);
  }

  recalculer() {
    this.lignes.forEach(l => {
      l.total = l.quantite * l.prix_unitaire;
    });
  }

  ouvrirConfirmation() {
    this.popup = true;
  }

  fermerPopup() {
    this.popup = false;
  }

  async validerVente() {
    this.popup = false;
    this.loading = true;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const data = {
      client: this.client,
      produits: this.lignes.map(l => ({
        code_produit: l.code_produit,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire,
        total: l.total,
      }))
    };

    this.addVenteService.addVente(data).subscribe({
      next: () => {
        alert('Vente enregistrée !');
        this.client = '';
        this.lignes = [];
      },
      error: () => alert("Erreur lors de l'enregistrement."),
      complete: () => this.loading = false
    });
  }

  get totalVente(): number {
    return this.lignes.reduce((acc, l) => acc + l.total, 0);
  }
}
