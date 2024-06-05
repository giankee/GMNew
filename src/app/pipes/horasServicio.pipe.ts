import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'horasServicio'
})
export class HorasServicioPipe implements PipeTransform {
  transform(value: any, arg: any): any {
    if(arg =="")
      return value;
    var aux;
    var cont=0;
    console.log(value)
  }
}
