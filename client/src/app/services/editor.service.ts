import { Injectable } from '@angular/core';
import { CommandReceiver } from '@models/commands/command-receiver';
import { AddShapesCommand } from '@models/commands/shape-commands/add-shapes-command';
import { RemoveShapesCommand } from '@models/commands/shape-commands/remove-shapes-command';
import { ShapeStates } from '@models/shapes/shape-states.enum';
import { Selection } from '@models/tools/editing-tools/selection-tool/selection';
import { GridProperties } from '@tool-properties/grid-properties/grid-properties';
import { LineTool } from '@tools/creator-tools/line-tool/line-tool';
import { EllipseTool } from '@tools/creator-tools/shape-tools/ellipse-tool';
import { PolygonTool } from '@tools/creator-tools/shape-tools/polygon-tool';
import { RectangleTool } from '@tools/creator-tools/shape-tools/rectangle-tool';
import { SprayTool } from '@tools/creator-tools/spray-tool/spray-tool';
import { BrushTool } from '@tools/creator-tools/stroke-tools/brush-tool/brush-tool';
import { PenTool } from '@tools/creator-tools/stroke-tools/pen-tool/pen-tool';
import { ColorApplicatorTool } from '@tools/editing-tools/color-applicator-tool';
import { ColorFillTool } from '@tools/editing-tools/color-fill-tool/color-fill-tool';
import { EraserTool } from '@tools/editing-tools/eraser-tool/eraser-tool';
import { SelectionTool } from '@tools/editing-tools/selection-tool/selection-tool';
import { PipetteTool } from '@tools/other-tools/pipette-tool';
import { Tool } from '@tools/tool';
import { ToolType } from '@tools/tool-type.enum';
import { EditorUtils } from '@utils/color/editor-utils';
import { Coordinate } from '@utils/math/coordinate';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { ColorsService } from 'src/app/services/colors.service';
import { APIService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  readonly tools: Map<ToolType, Tool>;
  readonly shapes: BaseShape[];
  private shapesBuffer: BaseShape[];
  private previewShapes: BaseShape[];
  private readonly _commandReceiver: CommandReceiver;

  readonly selection: Selection;
  private selectionTool: SelectionTool;

  readonly clipboard: BaseShape[];
  private pasteOffset: number;

  readonly gridProperties: GridProperties;
  view: DrawingSurfaceComponent;
  loading: boolean;

  get commandReceiver(): CommandReceiver {
    return this._commandReceiver;
  }

  constructor(public colorsService: ColorsService) {
    this._commandReceiver = new CommandReceiver();

    this.tools = new Map<ToolType, Tool>();
    this.initTools();

    this.shapesBuffer = new Array<BaseShape>();
    this.shapes = new Array<BaseShape>();
    this.previewShapes = new Array<BaseShape>();
    this.selectionTool = this.tools.get(ToolType.Select) as SelectionTool;
    this.selection = new Selection();
    this.gridProperties = new GridProperties();

    this.clipboard = new Array<BaseShape>();
    this.pasteOffset = SelectionTool.PASTED_OFFSET;
    this.loading = false;
  }

  exportDrawing(): string {
    return JSON.stringify(this.shapes, BaseShape.jsonReplacer);
  }

  importDrawing(drawingId: string, apiService: APIService): void {
    apiService.getDrawingById(drawingId).then((drawing) => {
      Object.values(JSON.parse(drawing.data)).forEach((shapeData) => {
        const shape = EditorUtils.createShape(shapeData as BaseShape);
        this.addShapeToBuffer(shape);
      });
      this.applyShapesBuffer();
    });
  }

  private initTools(): void {
    this.tools.set(ToolType.Pen, new PenTool(this));
    this.tools.set(ToolType.Brush, new BrushTool(this));
    this.tools.set(ToolType.Rectangle, new RectangleTool(this));
    this.tools.set(ToolType.Line, new LineTool(this));
    this.tools.set(ToolType.Select, new SelectionTool(this));
    this.tools.set(ToolType.Ellipse, new EllipseTool(this));
    this.tools.set(ToolType.Pipette, new PipetteTool(this));
    this.tools.set(ToolType.Polygon, new PolygonTool(this));
    this.tools.set(ToolType.Spray, new SprayTool(this));
    this.tools.set(ToolType.ColorApplicator, new ColorApplicatorTool(this));
    this.tools.set(ToolType.Eraser, new EraserTool(this));
    this.tools.set(ToolType.ColorFill, new ColorFillTool(this));
  }

  // todo : refactor
  private offsetCopies(buffer: BaseShape[]): BaseShape[] {
    const copies = new Array<BaseShape>();
    buffer.forEach((shape: BaseShape) => {
      const copy = EditorUtils.createShape(shape, false);
      copy.state = ShapeStates.PASTED;
      copy.origin = Coordinate.add(copy.origin, new Coordinate(this.pasteOffset, this.pasteOffset));
      if (copy.origin.x > this.view.width || copy.origin.y > this.view.height) {
        copy.origin = Coordinate.copy(this.clipboard[0].origin);    // todo - check if right
        this.pasteOffset = 0;
      }
      copies.push(copy);
    });
    return copies;
  }
  pasteClipboard(buffer: BaseShape[] = this.clipboard): void {
    if (buffer.length > 0) {
      const copies = this.offsetCopies(buffer);
      this.commandReceiver.add(new AddShapesCommand(copies, this));
      this.selection.clear();
      for (let i = copies.length - buffer.length; i < copies.length; i++) {
        this.selectionTool.addSelectedShape(copies[i]);
      }
      this.pasteOffset += SelectionTool.PASTED_OFFSET;
      this.selectionTool.updateBoundingBox();
      this.selectionTool.applyBoundingBox();
    }
  }
  cutSelectedShapes(): void {
    if (this.selection.shapes.length > 0) {
      this.pasteOffset = SelectionTool.PASTED_OFFSET;
      this.clearClipboard();
      this.selection.shapes.forEach((shape: BaseShape) => {
        this.clipboard.push(shape);
        this.commandReceiver.add(new RemoveShapesCommand(shape, this));
      });
      this.selection.clear();
      this.selectionTool.updateBoundingBox();
    }
  }
  copySelectedShapes(buffer: BaseShape[] = this.clipboard): void {
    if (this.selection.shapes.length > 0) {
      this.pasteOffset = SelectionTool.PASTED_OFFSET;
      buffer.length = 0;
      this.selection.shapes.forEach((shape: BaseShape) => {
        buffer.push(EditorUtils.createShape(shape, false));
      });
    }
  }
  duplicateSelectedShapes(): void {
    this.pasteClipboard(this.selection.shapes);
  }
  deleteSelectedShapes(): void {
    if (this.selection.shapes.length > 0) {
      const deletedShapes = new Array<BaseShape>();
      deletedShapes.push(...this.selection.shapes);
      this.commandReceiver.add(new RemoveShapesCommand(deletedShapes, this));
      this.selection.clear();
      this.selectionTool.updateBoundingBox();
      this.selectionTool.applyBoundingBox();
    }
  }
  selectAll(): void {
    this.selectionTool.selectAll();
  }

  applyShapesBuffer(): void {
    this.shapes.push(...this.shapesBuffer);
    this.shapesBuffer = [];
    this.clearShapesBuffer();
  }

  clearShapesBuffer(): void {
    const removeShapes = (shape: BaseShape): void => {
      if (this.view) {
        this.view.removeShape(shape);
      }
    };
    this.shapesBuffer.forEach(removeShapes);
    this.previewShapes.forEach(removeShapes);
    this.shapesBuffer = [];
    this.previewShapes = [];
  }

  clearSelection(): void {
    this.selection.shapes.length = 0;
  }

  clearClipboard(): void {
    this.clipboard.length = 0;
  }

  addPreviewShape(shape: BaseShape): void {
    this.previewShapes.push(shape);
    if (this.view) {
      this.view.addShape(shape);
    }
  }

  addShapeToBuffer(shapes: BaseShape | BaseShape[]): void {
    shapes = Array.isArray(shapes) ? shapes : [shapes];
    shapes.forEach((shape) => {
      if (!this.view) {
        this.shapesBuffer.push(shape);
      } else if (!this.view.svg.contains(shape.svgNode)) {
        this.shapesBuffer.push(shape);
        this.view.addShape(shape);
      }
    });
  }

  removeShapes(shapes: BaseShape[]): void {
    if (shapes.findIndex((shape: BaseShape) => shape.state !== ShapeStates.PASTED) === -1) {
      this.pasteOffset -= SelectionTool.PASTED_OFFSET;
    }
    shapes.forEach(this.removeShape, this);
  }

  removeShapeFromView(shape: BaseShape): void {
    this.view.removeShape(shape);
  }

  removeShape(shape: BaseShape): void {
    const index = this.shapes.findIndex((s) => s === shape);
    if (index !== -1) {
      this.shapes.splice(index, 1);
      this.removeShapeFromView(shape);
    }
  }

  findShapeById(id: number): BaseShape | undefined {
    const matchingShapes = this.shapes.filter((shape) => shape.id === id);
    if (matchingShapes.length > 1) {
      throw new Error('Shape Id collision error');
    }
    return matchingShapes.length ? matchingShapes[0] : undefined;
  }
}
