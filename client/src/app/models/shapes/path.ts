import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Coordinate } from 'src/app/utils/math/coordinate';

export class Path extends BaseShape {
  static readonly PATH_STYLE: string = 'round';
  private _trace: string;

  get trace(): string {
    return this._trace;
  }

  set trace(node: string) {
    this._trace = node;
    this.svgNode.setAttribute('d', this.trace);
  }

  get origin(): Coordinate {
    return this._origin;
  }

  set origin(c: Coordinate) {
    this._origin = c;
  }

  constructor(c: Coordinate) {
    super('path');
    this.origin = c;
    this._trace = 'M ' + c.x + ' ' + c.y;
  }

  addPoint(c: Coordinate): void {
    this.trace += ' L ' + c.x + ' ' + c.y;
  }

  updateProperties(): void {
    super.updateProperties();

    this._svgNode.style.fill = Path.NO_STYLE;

    this._svgNode.style.stroke = this.primaryColor.rgbString;
    this._svgNode.style.strokeOpacity = this.primaryColor.a.toString();

    this._svgNode.style.strokeLinecap = Path.PATH_STYLE;
    this._svgNode.style.strokeLinejoin = Path.PATH_STYLE;
  }
}
