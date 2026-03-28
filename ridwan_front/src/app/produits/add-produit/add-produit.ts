import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  saving = false;

  produit = {
    code_produit: '',
    produit: '',
    prix: 0,
    quantite: 0,
    categorie: ''
  };

  constructor(
    private addProduitService: AddProduitService,
    private cd: ChangeDetectorRef
  ) {}

  get isEdit(): boolean {
    return !!this.produitId;
  }

  ngOnInit(): void {
    if (this.produitId) {
      this.loadDetails(this.produitId);
    }
  }

  loadDetails(id: number): void {
    this.addProduitService.getProduit(id).subscribe({
      next: (data) => {
        this.produit = {
          code_produit: data.code_produit || '',
          produit: data.produit || '',
          prix: Number(data.prix) || 0,
          quantite: Number(data.quantite) || 0,
          categorie: data.categorie || ''
        };
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors du chargement du produit.');
      }
    });
  }

  ajouterProduit(): void {
    if (!this.produit.produit || !this.produit.categorie || !this.produit.code_produit) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    this.saving = true;

    if (this.isEdit && this.produitId) {
      this.addProduitService.updateProduit(this.produitId, this.produit).subscribe({
        next: () => {
          alert('Produit mis a jour.');
          this.saving = false;
          this.retour.emit();
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la modification.');
          this.saving = false;
        }
      });
      return;
    }

    this.addProduitService.addProduit(this.produit).subscribe({
      next: () => {
        alert('Produit ajoute avec succes.');
        this.saving = false;
        this.retour.emit();
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout du produit.");
        this.saving = false;
      }
    });
  }
}
