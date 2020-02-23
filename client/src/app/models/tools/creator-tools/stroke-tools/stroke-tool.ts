import { Path } from '../../../shapes/path';
import { ToolProperties } from '../../../tool-properties/tool-properties';
import { CreatorTool } from '../creator-tool';

export abstract class StrokeTool<T = ToolProperties> extends CreatorTool<T> {
  shape: Path;
  abstract createShape(): Path;

  protected updateProperties(): void {
    if (!this.shape) {
      this.shape = this.createShape();
    }
    this.shape.shapeProperties.strokeColor = this.editorService.colorsService.primaryColor;
    this.shape.shapeProperties.strokeOpacity = this.editorService.colorsService.primaryColor.a;
  }

  handleMouseEvent(e: MouseEvent): void {
    super.handleMouseEvent(e);
    if (this.isActive) {
      if (e.type === 'mouseup' || e.type === 'mouseleave') {
        this.applyShape();
      } else if (e.type === 'mousemove') {
        this.shape.addPoint(this.mousePosition);
      }
    } else if (e.type === 'mousedown') {
      this.isActive = true;
      this.updateProperties();
      this.addShape();
      this.shape.addPoint(this.mousePosition);
    }
  }
}