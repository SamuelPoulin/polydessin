import { AfterViewInit, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Coordinate } from 'src/app/models/Coordinate';
import { Color } from 'src/app/utils/color/color';

export abstract class AbstractCanvasDrawer implements OnInit, OnChanges, AfterViewInit {
  @Input()
  set color(color: Color) {
    if (!color || !this.color) {
      this._color = color;
    } else {
      this.updateColor(color);
    }
  }

  get color(): Color {
    return this._color;
  }

  private _color: Color = Color.WHITE;

  @Input() indicatorSize = 20;
  @Input() indicatorLineWidth = 3;
  canvas: ElementRef<HTMLCanvasElement>;
  renderingContext: CanvasRenderingContext2D;
  mouseIsDown = false;

  abstract calculateIndicatorPosition(): Coordinate;

  abstract draw(): void;

  abstract drawIndicator(position: Coordinate): void;

  abstract shouldRedraw(color: Color, previousColor: Color): boolean;

  abstract calculateColorFromMouseEvent(event: MouseEvent): Color;

  ngOnInit(): void {
    this.renderingContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
  }

  ngAfterViewInit(): void {
    this.drawAll();
  }

  drawAll(): void {
    if (this.renderingContext) {
      this.draw();
      this.drawIndicator(this.calculateIndicatorPosition());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const colorPropName = 'color';
    const change: SimpleChange = changes[colorPropName];

    if (change) {
      const color: Color = change.currentValue;
      const previousColor: Color = change.previousValue;
      if (!previousColor || (color && this.shouldRedraw(color, previousColor))) {
        this.drawAll();
      }
    }
  }

  updateColor(color: Color): void {
    const shouldRedraw = this.shouldRedraw(color, this.color);
    this._color = color;
    if (shouldRedraw) {
      this.drawAll();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseIsDown) {
      this.updateColor(this.calculateColorFromMouseEvent(event));
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.mouseIsDown = true;
    this.updateColor(this.calculateColorFromMouseEvent(event));
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.mouseIsDown = false;
  }
}