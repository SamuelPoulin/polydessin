import { Component } from '@angular/core';
import { AbstractToolbarEntry } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { BrushTextureType, BrushToolProperties } from 'src/app/models/tool-properties/brush-tool-properties';
import { ToolType } from 'src/app/models/tools/tool';
import { EditorService } from '../../../../../services/editor.service';

@Component({
  selector: 'app-brush-toolbar',
  templateUrl: './brush-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class BrushToolbarComponent extends AbstractToolbarEntry<BrushToolProperties> {
  brushTextureNames = Object.values(BrushTextureType);

  constructor(protected editorService: EditorService) {
    super(editorService, ToolType.Brush);
  }
}