import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FactureDetailService } from './facture-detail.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-facture-details',
  templateUrl: './facture-detail.html',
  styleUrls: ['./facture-detail.scss'],
  standalone: false,
  providers: [DatePipe]
})
export class FactureDetailComponent implements OnInit {

  @Input() factureId: number | null = null;
  @Output() retour = new EventEmitter<void>();

  facture: any = null;
  loading = false;
  
  constructor(
    private factureDetailService: FactureDetailService
  ) {}
  
  ngOnInit() {
    if (this.factureId) {
      this.loadDetails(this.factureId);
    }
  }

  goBack() {
    this.retour.emit();
  }

  loadDetails(id: number) {
    this.loading = true;

    this.factureDetailService.getFactureDetails(id).subscribe({
      next: (res: any) => {
        this.facture = res.facture;   // ✔️ IMPORTANT
        this.loading = false;
      },
      error: err => {
        console.error("Erreur détail facture:", err);
        this.loading = false;
      }
    });
  }

}
