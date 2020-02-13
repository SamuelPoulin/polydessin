import { KeyboardEventHandler } from 'src/app/utils/events/keyboard-event-handler';
import { KeyboardListener } from 'src/app/utils/events/keyboard-listener';
import { DrawingSurfaceComponent } from '../../components/pages/editor/drawing-surface/drawing-surface.component';
import { Coordinate } from '../Coordinate';

export abstract class Tool {
  protected drawingSurface: DrawingSurfaceComponent;
  protected keyboardEventHandler: KeyboardEventHandler;
  private _mousePosition: Coordinate;

  get mousePosition(): Coordinate {
    return this._mousePosition;
  }

  constructor(drawingSurface: DrawingSurfaceComponent) {
    this.drawingSurface = drawingSurface;
    this.keyboardEventHandler = {} as KeyboardEventHandler;
    this._mousePosition = new Coordinate();
  }

  abstract handleToolMouseEvent(e: MouseEvent): void;

  handleMouseEvent(e: MouseEvent): void {
    this._mousePosition = new Coordinate(e.offsetX, e.offsetY);
    this.handleToolMouseEvent(e);
  }

  handleKeyboardEvent(e: KeyboardEvent): boolean {
    return KeyboardListener.keyEvent(e, this.keyboardEventHandler);
  }
}