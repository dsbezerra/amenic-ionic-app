import * as _ from 'lodash';
// Checks if a given data is null if true throws an error avoiding
// program to continue execution
export const checkForNull = (data: any, name: string) => {
  if (_.isNull(data)) {
    throw new Error(`${name} must be defined.`);
  }
}