import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the UnitConverterPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'unitConverter',
})
export class UnitConverterPipe implements PipeTransform {
  /**
   * Takes the value in meter(m) and convert it into kilometer (km) if the number is bigger than or equal to 1000 m.
   */
  transform(value: number, ...args): string {

    if (!value) return;

    var baseUnit: string = "m";
    var result : string = value.toFixed(1).toString() + " " + baseUnit;
    
    if(value >= 1000){
      value = (value / 1000);
      baseUnit = "km";

      result = value.toFixed(1).toString() + " " + baseUnit;
    }

    return result;
  }
}
