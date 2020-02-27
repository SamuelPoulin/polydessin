/*tslint:disable:no-string-literal*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BrushToolbarComponent } from 'src/app/components/pages/editor/toolbar/brush-toolbar/brush-toolbar.component';
import { LineToolbarComponent } from 'src/app/components/pages/editor/toolbar/line-toolbar/line-toolbar.component';
import { PenToolbarComponent } from 'src/app/components/pages/editor/toolbar/pen-toolbar/pen-toolbar.component';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { mouseDown } from 'src/app/models/tools/creator-tools/stroke-tools/stroke-tool.spec';
import { Tool } from 'src/app/models/tools/tool';
import { ToolType } from 'src/app/models/tools/tool-type';
import { EditorService } from 'src/app/services/editor.service';
import { Color } from 'src/app/utils/color/color';
import { KeyboardListener } from 'src/app/utils/events/keyboard-listener';
import { ToolProperties } from '../../../../models/tool-properties/tool-properties';
import { SharedModule } from '../../../shared/shared.module';
import { DrawingSurfaceComponent } from '../drawing-surface/drawing-surface.component';
import createSpyObj = jasmine.createSpyObj;
import { EllipseToolbarComponent } from '../toolbar/ellipse-toolbar/ellipse-toolbar.component';
import { RectangleToolbarComponent } from '../toolbar/rectangle-toolbar/rectangle-toolbar.component';
import { EditorComponent } from './editor.component';

const keyDown = (key: string, shiftKey: boolean = false): KeyboardEvent => {
  return {
    key,
    type: 'keydown',
    shiftKey,
  } as KeyboardEvent;
};

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [
        EditorComponent,
        DrawingSurfaceComponent,
        ToolbarComponent,
        PenToolbarComponent,
        RectangleToolbarComponent,
        BrushToolbarComponent,
        LineToolbarComponent,
        EllipseToolbarComponent,
      ],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changes background color on event emitted from toolbar', () => {
    const changeBackgroundSpy = spyOn(component, 'changeBackground').and.callThrough();
    const toolbar: ToolbarComponent = fixture.debugElement.query(By.css('#toolbar')).componentInstance;
    toolbar.editorBackgroundChanged.emit(Color.RED);
    expect(component.drawingSurface.color).toEqual(Color.RED);
    expect(changeBackgroundSpy).toHaveBeenCalled();
  });

  it('should catch a keyboard event on keydown', () => {
    const spy = spyOn(KeyboardListener, 'keyEvent');
    const keydownEvent = new Event('keydown');
    window.dispatchEvent(keydownEvent);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should select the pen tool when typing c', () => {
    KeyboardListener.keyEvent(keyDown('c'), component['keyboardEventHandler']);
    expect(component.currentToolType).toEqual(ToolType.Pen);
  });

  it('should cancel current drawing on tool change', () => {
    component.currentToolType = ToolType.Pen;
    const cancelSpy = spyOn(component.editorService.tools.get(ToolType.Pen) as Tool, 'cancel');
    component.currentToolType = ToolType.Brush;
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should pass down events when unknown keys are pressed', () => {
    const spy = spyOn(component.currentTool as Tool, 'handleKeyboardEvent');

    KeyboardListener.keyEvent(keyDown('x'), component['keyboardEventHandler']);

    expect(spy).toHaveBeenCalled();
  });

  it('should select the brush tool when typing w', () => {
    KeyboardListener.keyEvent(keyDown('w'), component['keyboardEventHandler']);
    expect(component.currentToolType).toEqual(ToolType.Brush);
  });

  it('should select the rectangle tool when typing 1', () => {
    KeyboardListener.keyEvent(keyDown('1'), component['keyboardEventHandler']);
    expect(component.currentToolType).toEqual(ToolType.Rectangle);
  });

  it('should select the line tool when typing l', () => {
    KeyboardListener.keyEvent(keyDown('l'), component['keyboardEventHandler']);
    expect(component.currentToolType).toEqual(ToolType.Line);
  });

  it('should select the line tool', () => {
    component.currentToolType = ToolType.Line;
    const currentTool = component.currentTool as Tool;
    expect(currentTool.toolProperties.type).toEqual(ToolType.Line);
  });

  it('should select the rectangle tool', () => {
    component.currentToolType = ToolType.Rectangle;

    const currentTool = component.currentTool as Tool;
    expect(currentTool.toolProperties.type).toEqual(ToolType.Rectangle);
  });

  it('should select the brush tool', () => {
    component.currentToolType = ToolType.Brush;

    const currentTool = component.currentTool as Tool;
    expect(currentTool.toolProperties.type).toEqual(ToolType.Brush);
  });

  it('should select the pen tool after selecting the brush tool', () => {
    component.currentToolType = ToolType.Brush;
    component.currentToolType = ToolType.Pen;

    const currentTool = component.currentTool as Tool;
    expect(currentTool.toolProperties.type).toEqual(ToolType.Pen);
  });

  it('can get current tool', () => {
    const tool: Tool = { toolProperties: { type: 'toolMock' as ToolType } as ToolProperties } as Tool;
    component.editorService.tools.set('toolMock' as ToolType, tool);

    component.currentToolType = 'toolMock' as ToolType;

    const currentTool = component.currentTool as Tool;
    expect(currentTool).toEqual(tool);
    expect(currentTool.toolProperties.type).toEqual('toolMock');
  });

  it('handles mouse event', () => {
    const tool: Tool = component.editorService.tools.get(component.currentToolType) as Tool;
    const handleMouseEventSpy = spyOn(tool, 'handleMouseEvent');
    const event = mouseDown();

    component.handleMouseEvent(event);

    expect(handleMouseEventSpy).toHaveBeenCalledWith(event);
  });

  it('prevents default on right click', () => {
    const rightClickSpy = spyOn(component, 'onRightClick').and.callThrough();
    const event = createSpyObj('event', ['preventDefault']);
    fixture.debugElement.triggerEventHandler('contextmenu', event);

    expect(rightClickSpy).toHaveBeenCalledWith(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
