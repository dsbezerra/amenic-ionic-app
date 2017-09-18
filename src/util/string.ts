import { checkForNull } from './util';

// Make first letter of string uppercase
export const capitalize = (origin: string): string => {
  checkForNull(origin, 'origin');
  return origin.substring(0, 1).toUpperCase() + origin.substring(1);
}
