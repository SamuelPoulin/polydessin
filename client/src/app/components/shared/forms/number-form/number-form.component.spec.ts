import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NumberFormComponent } from './number-form.component';

describe('NumberFormComponent', () => {
    let component: NumberFormComponent;
    let fixture: ComponentFixture<NumberFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule],
            declarations: [NumberFormComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NumberFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
