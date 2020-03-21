import { EditorService } from 'src/app/services/editor.service';
import { KeyboardListenerService } from 'src/app/services/event-listeners/keyboard-listener/keyboard-listener.service';
import { MouseHandler } from 'src/app/services/event-listeners/mouse-listener/mouse-handler';
import { MouseEventAction, MouseListenerService } from 'src/app/services/event-listeners/mouse-listener/mouse-listener.service';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { ToolProperties } from '../tool-properties/tool-properties';

export abstract class Tool<T = ToolProperties> implements MouseHandler {
  get mousePosition(): Coordinate {
    return this._mousePosition;
  }

  protected constructor(editorService: EditorService) {
    this.editorService = editorService;
    this._mousePosition = new Coordinate();
    this.keyboardListener = new KeyboardListenerService();
    if (this.initMouseHandler) {
      this.initMouseHandler();
    }
    this.mouseListener = MouseListenerService.defaultMouseListener(this);
  }
  toolProperties: T;

  protected keyboardListener: KeyboardListenerService;
  private readonly mouseListener: MouseListenerService;

  private _mousePosition: Coordinate;
  protected editorService: EditorService;
  protected isActive: boolean;

  handleClick: MouseEventAction;
  handleDblClick: MouseEventAction;
  handleMouseDown: MouseEventAction;
  handleMouseLeave: MouseEventAction;
  handleMouseMove: MouseEventAction;
  handleMouseUp: MouseEventAction;
  afterViewChange(): void {
    return;
  }

  initMouseHandler?(): void;

  handleContextMenu(): boolean {
    return true;
  }

  handleMouseEvent(e: MouseEvent): boolean {
    this._mousePosition = new Coordinate(e.offsetX, e.offsetY);
    return this.mouseListener.handle(e);
  }

  handleKeyboardEvent(e: KeyboardEvent): boolean {
    return this.keyboardListener.handle(e);
  }

  cancel(): void {
    this.isActive = false;
    this.editorService.clearShapesBuffer();
  }
}
