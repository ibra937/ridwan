import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MouvementsComponent } from './mouvement';

describe('MouvementsComponent', () => {
  let component: MouvementsComponent;
  let fixture: ComponentFixture<MouvementsComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MouvementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MouvementsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
