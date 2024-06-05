import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  pure: false
})
export class SearchPipe implements PipeTransform {

  transform(list: any[], inText: string, tDato: string) {
    let auxLimite = 3;
    if (tDato == 'cOrdenT') auxLimite = 1;
    if (tDato == 'cMaquinariaDetalle') auxLimite = 0;
    if (inText.length < auxLimite || (inText == ""&&tDato!='cMaquinariaDetalle' )) 
      return list;

    switch (tDato) {
      case 'cBarco':
        return list.filter(barco => barco.nombre.toLowerCase().includes(inText.toLowerCase()) || barco.numMatricula.toLowerCase().includes(inText.toLowerCase()) || barco.anioConstruccion.toLowerCase().includes(inText.toLowerCase()));
      case 'cMaquinaria':
        return list.filter(maquinaria => maquinaria.modelo.toLowerCase().includes(inText.toLowerCase()) || maquinaria.marca.toLowerCase().includes(inText.toLowerCase()) || maquinaria.tipoMaquinaria.toLowerCase().includes(inText.toLowerCase()));
      case 'cDatos':
        return list.filter(datos => datos.nombre.toLowerCase().includes(inText.toLowerCase()));
      case 'cOrdenT':
        return list.filter(orden => orden.idOrdenT.toString().includes(inText) || orden.barcoMaquinaria.barco.nombre.toLowerCase().includes(inText.toLowerCase()) || orden.barcoMaquinaria.nombre.toLowerCase().includes(inText.toLowerCase()) || orden.fechaIngreso.toLowerCase().includes(inText.toLowerCase()) || orden.fechaFinalizacion.toLowerCase().includes(inText.toLowerCase()) || orden.tipoMantenimiento.toLowerCase().includes(inText.toLowerCase()) || orden.estadoProceso.toLowerCase().includes(inText.toLowerCase()));
      case 'cMaquinariaDetalle':
        return list.filter(detalle => detalle.item.nombre.toLowerCase().includes(inText.toLowerCase()) && detalle.mostrar==true);
    }
    return list;
  }

}
