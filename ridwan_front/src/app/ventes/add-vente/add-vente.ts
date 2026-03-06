import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { AddVenteService } from './add-vente.service';

interface Produit {
  id: number | string;
  code_produit: string;
  produit: string;
  prix: number;
}

interface LigneVente {
  code_produit: string;
  produit: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
}

@Component({
  selector: 'app-add-vente',
  templateUrl: './add-vente.html',
  styleUrls: ['./add-vente.scss'],
  standalone: false
})
export class AddVenteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  client = '';
  lignes: LigneVente[] = [];

  produitsDisponibles: Produit[] = [];
  filteredProduits: Produit[] = [];

  search = '';
  selectedProduitId: number | string = '';

  montantRecu: number | null = null;
  message = '';
  suggestionIndex = -1;
  dernierCodeAjoute = '';
  quickMontants = [500, 1000, 2000, 5000, 10000];
  modeScan = false;
  scanDelayMs = 180;
  scanInfo = '';
  fallbackOpen = false;
  private scanTimer: ReturnType<typeof setTimeout> | null = null;

  popup = false;
  loading = false;

  constructor(
    private addVenteService: AddVenteService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  ngAfterViewInit(): void {
    this.focusSearch();
  }

  ngOnDestroy(): void {
    this.clearScanTimer();
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      event.preventDefault();
      this.focusSearch(true);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'enter') {
      event.preventDefault();
      if (this.popup) {
        this.validerVente();
        return;
      }
      this.ouvrirConfirmation();
      return;
    }

    if (event.key === 'Escape' && this.popup) {
      event.preventDefault();
      this.fermerPopup();
    }
  }

  focusSearch(selectAll = false): void {
    setTimeout(() => {
      const input = this.searchInputRef?.nativeElement;
      if (!input) return;

      input.focus();
      if (selectAll) {
        input.select();
      }
    }, 0);
  }

  loadProduits(): void {
    this.addVenteService.produits().subscribe({
      next: (res) => {
        this.produitsDisponibles = (res || []).map((p) => ({
          ...p,
          prix: Number(p.prix) || 0
        }));
        this.filterProduits();
        this.cd.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  filterProduits(): void {
    const term = this.search.trim().toLowerCase();

    const base = term
      ? this.produitsDisponibles.filter((p) =>
          p.code_produit?.toLowerCase().includes(term) ||
          p.produit?.toLowerCase().includes(term)
        )
      : this.produitsDisponibles;

    this.filteredProduits = base.slice(0, 40);
    this.suggestionIndex = this.filteredProduits.length ? 0 : -1;
  }

  onSearchInput(): void {
    this.filterProduits();

    if (!this.modeScan) {
      this.scanInfo = '';
      this.clearScanTimer();
      return;
    }

    this.scheduleScan();
  }

  toggleModeScan(): void {
    this.modeScan = !this.modeScan;
    if (this.modeScan) {
      this.fallbackOpen = false;
    }
    this.scanInfo = this.modeScan
      ? 'Mode scan actif: presente le code-barres, ajout automatique.'
      : '';
    this.clearScanTimer();
    this.focusSearch(true);
  }

  toggleFallback(): void {
    this.fallbackOpen = !this.fallbackOpen;
  }

  clearScanTimer(): void {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
  }

  scheduleScan(): void {
    this.clearScanTimer();
    const terme = this.search.trim().toLowerCase();

    if (!terme) {
      this.scanInfo = '';
      return;
    }

    this.scanTimer = setTimeout(() => {
      if (!this.modeScan) return;

      const currentTerm = this.search.trim().toLowerCase();
      if (!currentTerm || currentTerm !== terme) {
        return;
      }

      this.autoAjouterDepuisCode(currentTerm);
    }, this.scanDelayMs);
  }

  autoAjouterDepuisCode(term: string): void {
    const exact = this.produitsDisponibles.find(
      (p) => (p.code_produit || '').toLowerCase() === term
    );

    if (exact) {
      this.ajouterProduit(exact);
      this.resetRecherche();
      this.scanInfo = `Ajoute: ${exact.code_produit}`;
      this.focusSearch();
      return;
    }

    const starts = this.produitsDisponibles.filter((p) =>
      (p.code_produit || '').toLowerCase().startsWith(term)
    );

    if (starts.length === 1 && term.length >= 6) {
      this.ajouterProduit(starts[0]);
      this.resetRecherche();
      this.scanInfo = `Ajoute: ${starts[0].code_produit}`;
      this.focusSearch();
      return;
    }

    if (term.length >= 3) {
      this.scanInfo = 'Code non reconnu.';
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && this.filteredProduits.length) {
      event.preventDefault();
      this.suggestionIndex = Math.min(this.suggestionIndex + 1, this.filteredProduits.length - 1);
      return;
    }

    if (event.key === 'ArrowUp' && this.filteredProduits.length) {
      event.preventDefault();
      this.suggestionIndex = Math.max(this.suggestionIndex - 1, 0);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearchEnter();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.resetRecherche();
      this.focusSearch();
    }
  }

  onSearchEnter(): void {
    this.message = '';
    this.scanInfo = '';

    if (this.selectedProduitId) {
      this.ajouterProduitDepuisSelect();
      return;
    }

    const term = this.search.trim().toLowerCase();
    if (!term) {
      return;
    }

    if (this.suggestionIndex >= 0 && this.filteredProduits[this.suggestionIndex]) {
      this.ajouterProduit(this.filteredProduits[this.suggestionIndex]);
      this.resetRecherche();
      this.focusSearch();
      return;
    }

    const exact = this.produitsDisponibles.find(
      (p) => p.code_produit?.toLowerCase() === term
    );

    if (exact) {
      this.ajouterProduit(exact);
      this.resetRecherche();
      this.focusSearch();
      return;
    }

    if (this.filteredProduits.length) {
      this.ajouterProduit(this.filteredProduits[0]);
      this.resetRecherche();
      this.focusSearch();
      return;
    }

    this.message = 'Aucun produit trouve pour cette recherche.';
  }

  ajouterProduitDepuisSelect(): void {
    if (!this.selectedProduitId) return;

    const p = this.produitsDisponibles.find((x) => x.id == this.selectedProduitId);
    if (!p) return;

    this.ajouterProduit(p);
    this.resetRecherche();
    this.focusSearch();
  }

  resetRecherche(): void {
    this.search = '';
    this.selectedProduitId = '';
    this.filterProduits();
    this.clearScanTimer();
  }

  ajouterProduit(p: Produit): void {
    this.message = '';
    this.dernierCodeAjoute = p.code_produit;
    const exist = this.lignes.find((l) => l.code_produit === p.code_produit);

    if (exist) {
      exist.quantite++;
      this.recalculerLigne(exist);
      return;
    }

    this.lignes.push({
      code_produit: p.code_produit,
      produit: p.produit,
      quantite: 1,
      prix_unitaire: Number(p.prix) || 0,
      total: Number(p.prix) || 0
    });
  }

  annulerDernierAjout(): void {
    if (!this.dernierCodeAjoute) {
      this.message = 'Aucun ajout recent a annuler.';
      return;
    }

    const index = this.lignes.findIndex((l) => l.code_produit === this.dernierCodeAjoute);
    if (index < 0) {
      this.message = 'Aucun ajout recent a annuler.';
      return;
    }

    const ligne = this.lignes[index];
    if (ligne.quantite > 1) {
      ligne.quantite -= 1;
      this.recalculerLigne(ligne);
    } else {
      this.lignes.splice(index, 1);
    }

    this.message = 'Dernier ajout annule.';
    this.scanInfo = '';
    this.focusSearch();
  }

  changerQuantite(i: number, delta: number): void {
    const l = this.lignes[i];
    if (!l) return;

    l.quantite = Math.max(1, (Number(l.quantite) || 1) + delta);
    this.recalculerLigne(l);
  }

  supprimer(i: number): void {
    this.lignes.splice(i, 1);
  }

  recalculerLigne(l: LigneVente): void {
    l.quantite = Math.max(1, Number(l.quantite) || 1);
    l.prix_unitaire = Math.max(0, Number(l.prix_unitaire) || 0);
    l.total = l.quantite * l.prix_unitaire;
  }

  recalculer(): void {
    this.lignes.forEach((l) => this.recalculerLigne(l));
  }

  viderPanier(): void {
    this.lignes = [];
    this.montantRecu = null;
    this.dernierCodeAjoute = '';
    this.message = '';
    this.scanInfo = '';
    this.clearScanTimer();
    this.focusSearch();
  }

  ajouterAuMontantRecu(montant: number): void {
    const base = Number(this.montantRecu) || 0;
    this.montantRecu = Math.max(0, base + montant);
  }

  definirMontantExact(): void {
    this.montantRecu = this.totalVente;
  }

  arrondirMontant(pas: number): void {
    if (pas <= 0) return;
    this.montantRecu = Math.ceil(this.totalVente / pas) * pas;
  }

  effacerMontantRecu(): void {
    this.montantRecu = null;
  }

  ouvrirConfirmation(): void {
    this.recalculer();

    if (!this.lignes.length) {
      this.message = 'Ajoute au moins un produit avant de valider.';
      return;
    }

    this.message = '';
    this.popup = true;
  }

  fermerPopup(): void {
    this.popup = false;
  }

  validerVente(): void {
    this.popup = false;
    this.loading = true;

    const data = {
      client: this.client?.trim() || 'Comptoir',
      produits: this.lignes.map((l) => ({
        code_produit: l.code_produit,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire,
        total: l.total,
      }))
    };

    this.addVenteService.addVente(data).subscribe({
      next: () => {
        alert('Vente enregistree !');
        this.client = '';
        this.viderPanier();
        this.loading = false;
        this.cd.detectChanges();
      },
      error: () => alert("Erreur lors de l'enregistrement."),
      complete: () => (this.loading = false)
    });
  }

  get totalVente(): number {
    return this.lignes.reduce((acc, l) => acc + (Number(l.total) || 0), 0);
  }

  get totalArticles(): number {
    return this.lignes.reduce((acc, l) => acc + (Number(l.quantite) || 0), 0);
  }

  get monnaie(): number {
    if (this.montantRecu === null || this.montantRecu === undefined) {
      return 0;
    }

    const recu = Number(this.montantRecu);
    if (!Number.isFinite(recu)) {
      return 0;
    }

    return Math.max(0, recu - this.totalVente);
  }

  get manque(): number {
    if (this.montantRecu === null || this.montantRecu === undefined) {
      return this.totalVente;
    }

    const recu = Number(this.montantRecu);
    if (!Number.isFinite(recu)) {
      return this.totalVente;
    }

    return Math.max(0, this.totalVente - recu);
  }

  trackByCode(_: number, ligne: LigneVente): string {
    return ligne.code_produit;
  }
}
