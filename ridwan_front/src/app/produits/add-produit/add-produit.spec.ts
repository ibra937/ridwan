import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProduitComponent } from './add-produit';

describe('AddProduit', () => {
  let component: AddProduitComponent;
  let fixture: ComponentFixture<AddProduitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddProduitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
