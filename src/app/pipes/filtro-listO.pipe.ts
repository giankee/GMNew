import { Pipe, PipeTransform } from '@angular/core';
import { cOrdenTrabajoB } from '../shared/ordenTrabajo/cOrdenModel.model';

@Pipe({
  name: 'filtroListO'
})
export class FiltroListOPipe implements PipeTransform {
  transform(value: cOrdenTrabajoB[], arg: any): any {
    if(arg =="")
      return value;
    var aux;
    var cont=0;
    const resultadoBusqueda=[];
    
    if(cont==0){
      for(var i=0;i<arg.length;i++){
        aux = arg.split('');
        if(aux[i]!=0||aux[i]!=1||aux[i]!=2||aux[i]!=3||aux[i]!=4||aux[i]!=5||aux[i]!=6||aux[i]!=7||aux[i]!=8||aux[i]!=9)
          cont++;
      }
      for(var filtro of value){
        if(filtro.idOrdenT!.toString()==arg){
          resultadoBusqueda.push(filtro)
        }
      }
      if(resultadoBusqueda.length>0){
        return resultadoBusqueda;
      }else cont++;
    }
    if(cont>0){
      for(var filtro of value){
        if((filtro.barcoMaquinaria!.nombre!.toLowerCase().indexOf(arg.toLowerCase())!=-1)||(filtro.fechaIngreso!.toLowerCase().indexOf(arg.toLowerCase())!=-1)||(filtro.barcoMaquinaria!.barco!.nombre!.toLowerCase().indexOf(arg.toLowerCase())!=-1)||(filtro.tipoMantenimiento!.toLowerCase().indexOf(arg.toLowerCase())!=-1)){
          resultadoBusqueda.push(filtro)
        } 
      }
      return resultadoBusqueda;
    }else return value; 
  }
}
