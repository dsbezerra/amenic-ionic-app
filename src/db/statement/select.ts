import { checkForNull } from '../../util/util';
import { 
  Command,
  Statement,
} from '../statement';

// TODO(diego):
// Implement DISTINCT and COUNT
export class Select extends Statement {
  constructor(...columns: string[]) {
    super(...columns);
    this.mCommand = Command.SELECT;
  }
}

// Usage example
// const statement = new Select()
//   .from('in_theaters')
//   .where('cinema').isEqual('ibicinemas')
//   .build();
//
// console.log(statement);