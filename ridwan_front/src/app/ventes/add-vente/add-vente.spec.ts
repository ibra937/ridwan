import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVenteComponent } from './add-vente';

describe('AddVente', () => {
  let component: AddVenteComponent;
  let fixture: ComponentFixture<AddVenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddVenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
