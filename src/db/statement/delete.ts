import { checkForNull } from '../../util/util';
import { 
  Command,
  Statement,
} from '../statement';

// TODO(diego): Implement delete exclusive things
export class Delete extends Statement {
  constructor(...columns: string[]) {
    super(...columns);
    this.mCommand = Command.DELETE;
  }
}

// Usage example
// const statement = new Delete()
//   .from('in_theaters')
//   .where('cinema').isEqual('ibicinemas')
//   .build();
//
// console.log(statement);