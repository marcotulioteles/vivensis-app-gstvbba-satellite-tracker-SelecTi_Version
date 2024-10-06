/**
 * Determines whether two rectangular areas (rect1 and rect2) overlap.
 * Each rectangle is defined by its `x` and `y` coordinates, and its width and height.
 *
 * @param {Object} rect1 - The first rectangle.* 
 * @param {Object} rect2 - The second rectangle.
 * @returns {boolean} - Returns `true` if the rectangles overlap, otherwise returns `false`.
 */
export const isOverlapping = (
    rect1: { x: number, y: number, width: number, height: number }, 
    rect2: { x: number, y: number, width: number, height: number }
  ): boolean => {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.x > rect2.x + rect2.width ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    );
  };
  
/**
 * Normalizes a given angular difference to the range of [-180, 180] degrees.
 * This is useful for ensuring angular values stay within the standard range for comparisons.
 *
 * @param {number} diff - The angular difference in degrees, which may fall outside the range of [-180, 180].
 * @returns {number} - The normalized angular difference, guaranteed to be within the range of [-180, 180].
 */
export const normalizeDifference = (diff: number): number => {
  if (diff > 180) return diff - 360;
  if (diff < -180) return diff + 360;
  return diff;
};
  