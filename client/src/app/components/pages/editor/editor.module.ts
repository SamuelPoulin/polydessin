import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { EditorComponent } from './editor/editor.component';

@NgModule({
    imports: [SharedModule],
    declarations: [EditorComponent],
    exports: [EditorComponent],
})
export class EditorModule {}
