import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AddProduitService } from './add-produit.service';

@Component({
  selector: 'app-add-produit',
  templateUrl: './add-produit.html',
  styleUrls: ['./add-produit.scss'],
  standalone: false
})
export class AddProduitComponent implements OnInit {

  @Input() produitId: number | null = null;
  @Output() retour = new EventEmitter<void>();

  produit = {
    code_produit: '',
    produit: '',
    prix: 0,
    quantite: 0,
    categorie: ''
  };

  constructor(private addProduitService: AddProduitService) {}

  ngOnInit() {
    console.log("Produit ID reçu:", this.produitId);
    if (this.produitId) {
      this.loadDetails(this.produitId);
    }
  }

  loadDetails(id: number) {
    this.addProduitService.getProduit(id).subscribe({
      next: (data) => {
        this.produit = data;
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors du chargement du produit");
      }
    });
  }

  ajouterProduit() {
    if (!this.produit.code_produit || !this.produit.produit) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    // mode modification
    if (this.produitId) {
      this.addProduitService.updateProduit(this.produitId, this.produit).subscribe({
        next: () => {
          alert('Produit mis à jour !');
          this.retour.emit();
        },
        error: (err) => {
          console.error(err);
          alert("Erreur lors de la modification.");
        }
      });
    }

    // mode ajout
    else {
      this.addProduitService.addProduit(this.produit).subscribe({
        next: () => {
          alert('Produit ajouté avec succès !');
          this.produit = { code_produit: '', produit: '', prix: 0, quantite: 0, categorie: '' };
          this.retour.emit();
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l\'ajout du produit.');
        }
      });
    }
  }
}
