import { Input } from '@angular/core';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { ToolType } from 'src/app/models/tools/tool';
import { ToolProperties } from '../../../../../models/tool-properties/tool-properties';
import { EditorService } from '../../../../../services/editor.service';

export abstract class AbstractToolbarEntry<T extends ToolProperties> {
  @Input() thicknessSliderStep: number;

  protected constructor(protected editorService: EditorService, protected type: ToolType) {
    this.thicknessSliderStep = ToolbarComponent.SLIDER_STEP;
  }

  get toolProperties(): T {
    const tool = this.editorService.tools.get(this.type);
    if (!tool) {
      throw new Error('Tool not found error: ' + this.type);
    }
    return tool.toolProperties as T;
  }
}