const DEFAULT_ITEMS_PER_ROW = 3;

/**
 * Maps an array to a grid format (matrix)
 * 
 * Example:
 * 
 *     Maps [0, 1, 2, 3, 4, 5, 6, 7, 8]
 *      
 *     to
 * 
 *     [
 *        [0, 1, 2],
 *        [3, 4, 5],
 *        [6, 7, 8]
 *     ]
 * 
 *     Assuming items per row === 3;
 * 
 * @param array The source array to be mapped
 * @param itemsPerRow Items per row of grid
 */
export const mapArrayToGrid = (source: any[], itemsPerRow?) => {
  if (!source || !source.length) return [];

  if (!itemsPerRow) itemsPerRow = DEFAULT_ITEMS_PER_ROW;

  let result = [];

  let row = 0;
  for (let i = 0; i < source.length; i += itemsPerRow) {
    result[row] = [];
    for (let y = 0; y < itemsPerRow; y++) {
      if (source[i + y]) {
        result[row][y] = source[i + y];
      }
    }
    row++;
  }

  return result;
}
