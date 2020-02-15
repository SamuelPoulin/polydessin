import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material';
import { Router } from '@angular/router';
import { ColorPickerComponent } from 'src/app/components/shared/color-picker/color-picker.component';
import { SelectedColorsService, SelectedColorType } from 'src/app/services/selected-colors.service';
import { Color } from 'src/app/utils/color/color';

import { BrushTextureType, BrushToolProperties } from 'src/app/models/tool-properties/brush-tool-properties';
import { LineJunctionType, LineToolProperties } from 'src/app/models/tool-properties/line-tool-properties';
import { PenToolProperties } from 'src/app/models/tool-properties/pen-tool-properties';
import { RectangleContourType, RectangleToolProperties } from 'src/app/models/tool-properties/rectangle-tool-properties';
import { ToolProperties } from 'src/app/models/tool-properties/tool-properties';

enum Tool {
  Pen = 'Pen',
  Brush = 'Brush',
  Rectangle = 'Rectangle',
  Line = 'Line',
  ColorPicker = 'ColorPicker',
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  static readonly TOOLBAR_WIDTH = 60;
  static readonly SLIDER_STEP = 0.1;

  @Input() stepThickness = ToolbarComponent.SLIDER_STEP;
  @Output() toolChanged = new EventEmitter<ToolProperties>();
  @Output() editorBackgroundChanged = new EventEmitter<Color>();

  tools = Tool;
  brushTextureNames = Object.values(BrushTextureType);
  rectangleContourTypes = RectangleContourType;
  rectangleContourNames = Object.values(this.rectangleContourTypes);
  lineJunctionTypes = LineJunctionType;
  lineJunctionNames = Object.values(this.lineJunctionTypes);
  showColorPicker = false;

  @ViewChild('drawer', { static: false })
  drawer: MatDrawer;

  @ViewChild('colorPicker', { static: false })
  colorPicker: ColorPickerComponent;

  penProperties = new PenToolProperties();
  brushProperties = new BrushToolProperties();
  rectangleProperties = new RectangleToolProperties();
  lineProperties = new LineToolProperties();
  selectedColor = SelectedColorType.primary;

  SelectedColorType = SelectedColorType;

  currentTool = this.tools.Pen;

  constructor(private router: Router, public selectedColors: SelectedColorsService) {}

  handleColorChanged(eventColor: Color): void {
    this.color = eventColor;
    this.showColorPicker = false;
    this.drawer.close();
  }

  selectTool(selection: Tool): void {
    this.currentTool = selection;

    switch (this.currentTool) {
      case this.tools.Pen:
        this.toolChanged.emit(this.penProperties);
        break;
      case this.tools.Brush:
        this.toolChanged.emit(this.brushProperties);
        break;
      case this.tools.Rectangle:
        this.toolChanged.emit(this.rectangleProperties);
        break;
      case this.tools.Line:
        this.toolChanged.emit(this.lineProperties);
        break;
    }
  }

  openPanel(selection: Tool): void {
    if (this.currentTool === selection) {
      this.drawer.toggle();
      this.showColorPicker = false;
    } else {
      this.currentTool = selection;
      this.drawer.open();
    }
  }

  selectColor(index: number): void {
    this.showColorPicker = true;
    this.drawer.open();
    this.selectedColor = index;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  updateBackground(color: Color): void {
    this.editorBackgroundChanged.emit(color);
  }

  get primaryColor(): Color {
    return this.selectedColors.primaryColor;
  }

  get secondaryColor(): Color {
    return this.selectedColors.secondaryColor;
  }

  set color(color: Color) {
    this.selectedColors.setColorByIndex(color, this.selectedColor);
  }

  get color(): Color {
    return this.selectedColors.colorByIndex(this.selectedColor);
  }
}
