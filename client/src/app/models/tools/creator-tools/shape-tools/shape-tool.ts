import { Rectangle } from 'src/app/models/shapes/rectangle';
import { CreatorTool } from 'src/app/models/tools/creator-tools/creator-tool';
import { EditorService } from 'src/app/services/editor.service';
import { KeyboardListenerService } from 'src/app/services/event-listeners/keyboard-listener/keyboard-listener.service';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { ToolProperties } from '../../../tool-properties/tool-properties';

export abstract class ShapeTool<T = ToolProperties> extends CreatorTool<T> {
  protected previewArea: Rectangle;
  private forceEqualDimensions: boolean;
  protected initialMouseCoord: Coordinate;

  protected constructor(editorService: EditorService) {
    super(editorService);

    this.previewArea = new Rectangle();
    this.forceEqualDimensions = false;
    this.keyboardListener.addEvents([
      [
        KeyboardListenerService.getIdentifier('Shift', false, true),
        () => {
          this.setEqualDimensions(true);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('Shift', false, false, 'keyup'),
        () => {
          this.setEqualDimensions(false);
        },
      ],
    ]);
  }

  abstract resizeShape(origin: Coordinate, dimensions: Coordinate): void;

  protected startShape(): void {
    this.initialMouseCoord = this.mousePosition;
    super.startShape();
    this.updateCurrentCoord(this.mousePosition);
    this.editorService.addPreviewShape(this.previewArea);
  }

  handleMouseMove(e: MouseEvent): boolean | void {
    if (this.isActive) {
      this.updateCurrentCoord(this.mousePosition);
    }
    return super.handleMouseMove(e);
  }

  handleMouseDown(e: MouseEvent): boolean | void {
    if (!this.isActive) {
      this.startShape();
    }
    return super.handleMouseDown(e);
  }

  handleMouseUp(e: MouseEvent): boolean | void {
    if (this.isActive) {
      this.applyShape();
    }
    return super.handleMouseUp(e);
  }

  setEqualDimensions(value: boolean): void {
    this.forceEqualDimensions = value;
    if (this.isActive) {
      this.updateCurrentCoord(this.mousePosition);
    }
  }

  updateCurrentCoord(c: Coordinate): void {
    const delta = Coordinate.substract(c, this.initialMouseCoord);
    const previewDimensions = Coordinate.abs(delta);
    let dimensions = new Coordinate(previewDimensions.x, previewDimensions.y);
    let origin = Coordinate.minXYCoord(c, this.initialMouseCoord);

    if (this.forceEqualDimensions) {
      const minDimension = Math.min(dimensions.x, dimensions.y);
      dimensions = new Coordinate(minDimension, minDimension);
    }

    if (delta.y < 0) {
      origin = new Coordinate(origin.x, origin.y + previewDimensions.y - dimensions.y);
    }

    if (delta.x < 0) {
      origin = new Coordinate(origin.x + previewDimensions.x - dimensions.x, origin.y);
    }

    this.previewArea.origin = origin;
    this.previewArea.width = dimensions.x;
    this.previewArea.height = dimensions.y;
    this.previewArea.shapeProperties.fillColor = Color.TRANSPARENT;
    this.previewArea.updateProperties();

    this.resizeShape(dimensions, origin);
  }
}
