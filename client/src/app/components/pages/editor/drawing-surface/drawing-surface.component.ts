import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Color } from 'src/app/utils/color/color';

@Component({
  selector: 'app-drawing-surface',
  templateUrl: './drawing-surface.component.html',
  styleUrls: ['./drawing-surface.component.scss'],
})
export class DrawingSurfaceComponent implements OnInit {
  @Input() width: number;
  @Input() height: number;
  @Input() color = Color.WHITE;

  @ViewChild('svg', { static: false })
  svg: ElementRef;

  ngOnInit() {
    console.log(2);
  }
}
