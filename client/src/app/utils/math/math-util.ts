export class MathUtil {
  static readonly MAX_ANGLE: number = 360;

  /**
   * Returns value greater or equal to min
   */
  static fitLower(value: number, min: number = 0): number {
    return value >= min ? value : min;
  }

  /**
   * Returns value lower or equal to max
   */
  static fitUpper(value: number, max: number = 1): number {
    return value <= max ? value : max;
  }

  /**
   * Returns value lower or equal to max and greater or equal to min
   */
  static fit(value: number, min: number = 0, max: number = 1): number {
    return MathUtil.fitLower(MathUtil.fitUpper(value, max), min);
  }

  static fitAngle(angle: number): number {
    if (angle < 0) {
      return this.MAX_ANGLE - this.fitAngle(-angle);
    }
    return angle % this.MAX_ANGLE;
  }
}
