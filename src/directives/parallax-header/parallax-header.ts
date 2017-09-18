import { Directive } from '@angular/core';

/**
 * Generated class for the ParallaxHeaderDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */
@Directive({
  selector: '[parallax-header]' // Attribute selector
})
export class ParallaxHeaderDirective {

  constructor() {
    console.log('Hello ParallaxHeaderDirective Directive');
  }

}
