import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VentesService } from './ventes.service';

@Component({
  selector: 'app-ventes',
  templateUrl: './ventes.html',
  standalone: false,
  styleUrls: ['./ventes.scss'],
})
export class VentesComponent implements OnInit {
  factures: any[] = [];
  loading = false;

  constructor(
    private ventesService: VentesService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures() {
    this.loading = true;
    this.ventesService.getVentes().subscribe({
      next: (res) => {
        this.factures = res;
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

  voirFacture(facture: any) {
    // redirection vers facture details, par exemple via un routeur Angular
    // this.router.navigate(['/facture', facture.id]);
    alert(`Voir la facture ${facture.numero_facture}`);
  }
}
