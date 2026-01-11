import { Component } from '@angular/core';
import { AddVenteService } from './add-vente.service';

@Component({
  selector: 'app-add-vente',
  templateUrl: './add-vente.html',
  standalone: false,
  styleUrls: ['./add-vente.scss'],
})
export class AddVenteComponent {
  client = '';
  lignes: any[] = [];
  produitsDisponibles: any[] = [];

  constructor(private addVenteService: AddVenteService) {}

  ngOnInit() {
    this.loadProduits();
  }

  loadProduits() {
    this.addVenteService.produits().subscribe({
      next: (res) => this.produitsDisponibles = res,
      error: (err) => console.error(err)
    });
  }

  ajouterProduit(p: any) {
    const exist = this.lignes.find(l => l.code_produit === p.code_produit);

    if (exist) {
      exist.quantite++;
      exist.total = exist.quantite * exist.prix;
      return;
    }

    this.lignes.push({
      code_produit: p.code_produit,
      produit: p.nom || p.produits,
      quantite: 1,
      prix: p.prix,
      total: p.prix
    });
  }

  changerQuantite(index: number, delta: number) {
    const l = this.lignes[index];

    l.quantite += delta;
    if (l.quantite < 1) l.quantite = 1;

    l.total = l.quantite * l.prix;
  }

  supprimer(index: number) {
    this.lignes.splice(index, 1);
  }

  recalculer() {
    this.lignes.forEach(l => l.total = l.quantite * l.prix);
  }

  get totalVente(): number {
    return this.lignes.reduce((acc, l) => acc + l.total, 0);
  }

  validerVente() {
    const venteData = {
      client: this.client,
      produits: this.lignes,
    };

    this.addVenteService.addVente(venteData).subscribe({
      next: res => {
        alert('Vente enregistrée avec succès !');
        this.client = '';
        this.lignes = [];
      },
      error: err => {
        console.error(err);
        alert('Erreur lors de l\'enregistrement de la vente.');
      }
    });
  }
}
