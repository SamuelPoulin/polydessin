import { BaseShape } from './BaseShape';

export const MIN_POLY_EDGE = 3;
export const MAX_POLY_EDGE = 12;

export class Polygon extends BaseShape {
  private nbEdge: number;

  get NbEdge(): number {
    return this.nbEdge;
  }

  set NbEdge(nbEdge: number) {
    if (nbEdge < MIN_POLY_EDGE || !nbEdge) {
      this.nbEdge = MIN_POLY_EDGE;
    } else if (nbEdge > MAX_POLY_EDGE) {
      this.nbEdge = MAX_POLY_EDGE;
    } else {
      this.nbEdge = nbEdge;
    }
  }

  constructor(nbEdge: number = MIN_POLY_EDGE) {
    super();
    this.NbEdge = nbEdge;
  }
}