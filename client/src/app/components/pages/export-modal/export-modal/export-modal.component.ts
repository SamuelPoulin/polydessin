import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { EditorService } from 'src/app//services/editor.service';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { ImageExportService } from 'src/app/services/image-export.service';
import { ExtensionType } from '../extension-type.enum';
import { FilterType } from '../filter-type.enum';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
})
export class ExportModalComponent extends AbstractModalComponent {
  selectedExtension: ExtensionType;
  extensions: string[] = Object.values(ExtensionType);
  href: SafeResourceUrl;
  fileName: string;
  formGroup: FormGroup;
  selectedFilter: FilterType;
  filters: string[] = Object.values(FilterType);
  validity: boolean;

  constructor(
    public dialogRef: MatDialogRef<AbstractModalComponent>,
    private editorService: EditorService,
    private imageExportService: ImageExportService,
  ) {
    super(dialogRef);
    editorService.clearShapesBuffer();
    this.fileName = '';
    this.selectedExtension = ExtensionType.EMPTY;
    this.selectedFilter = FilterType.EMPTY;
    this.href = this.imageExportService.exportSVGElement(this.editorService.view, this.selectedFilter);
    this.formGroup = new FormGroup({});
    this.validity = !this.formGroup.invalid && this.selectedExtension !== '';
  }

  get fullName(): string {
    return this.fileName + '.' + this.selectedExtension;
  }

  addFilterToPreview(): void {
    const image = document.getElementById('preview') as HTMLImageElement;
    switch (this.selectedFilter) {
      case FilterType.EMPTY:
        image.style.filter = 'none';
        break;
      case FilterType.BLACKWHITE:
        image.style.filter = 'grayscale(100%)';
        break;
      case FilterType.BLUR:
        image.style.filter = 'blur(5px)';
        break;
      case FilterType.INVERT:
        image.style.filter = 'invert(100%)';
        break;
      case FilterType.SATURATE:
        image.style.filter = 'saturate(200%)';
        break;
      case FilterType.SEPIA:
        image.style.filter = 'sepia(100%)';
        break;
    }
    this.changeExtension();
  }

  changeExtension(): void {
    if (this.selectedExtension !== ExtensionType.EMPTY) {
      this.selectedExtension === ExtensionType.SVG
        ? (this.href = this.imageExportService.exportSVGElement(this.editorService.view, this.selectedFilter))
        : this.imageExportService
            .exportImageElement(this.editorService.view, this.selectedExtension, this.selectedFilter)
            .then((data: string) => {
              this.href = data;
            });
    }
  }

  submit(): void {
    if (this.valid) {
      this.dialogRef.close();
    }
  }

  get valid(): boolean {
    return !this.formGroup.invalid && this.selectedExtension !== ExtensionType.EMPTY;
  }

  get previewURL(): SafeResourceUrl {
    return this.imageExportService.safeURL(this.editorService.view);
  }
}
