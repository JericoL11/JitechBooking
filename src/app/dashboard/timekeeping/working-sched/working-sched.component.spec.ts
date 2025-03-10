import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingSchedComponent } from './working-sched.component';

describe('WorkingSchedComponent', () => {
  let component: WorkingSchedComponent;
  let fixture: ComponentFixture<WorkingSchedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkingSchedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkingSchedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
