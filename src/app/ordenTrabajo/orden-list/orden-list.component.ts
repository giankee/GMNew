import { Component, OnInit } from '@angular/core';
import { OrdenTrabajoService } from 'src/app/shared/ordenTrabajo/orden-trabajoB.service';
import { cOrdenTrabajoB } from 'src/app/shared/ordenTrabajo/cOrdenModel.model';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { jsPDF } from 'jspdf'

@Component({
  selector: 'app-orden-list',
  templateUrl: './orden-list.component.html',
  styles: []
})
export class OrdenListComponent implements OnInit {

  listOrdenesTrabajoIn: cOrdenTrabajoB[];
  listOrdenesTrabajoNew: cOrdenTrabajoB[];
  listOrdenesTrabajoOld: cOrdenTrabajoB[];
  resultBusquedaMostrar: cOrdenTrabajoB[] = [];
  listOrdenesOriginalIn: cOrdenTrabajoB[];
  filtroOrdenT = '';
  /**Para pagination */
  startIndex: number = 0;
  endIndex: number = 5;
  selectPagination: number = 5;
  pagActualIndex: number = 0;
  siguienteBlock: boolean = false;
  anteriorBlock: boolean = true;
  pagTotal: any[] = [];
  /**Fin paginatacion */

  /**para agrupar*/
  selectAgrupar: number = 0;
  /**Fin agrupar*/
  internetStatus: string = 'nline';
  spinnerOnOff: boolean = true;
  mostrarRangoFecha: boolean = false;
  inDesde: string;
  inHasta: string;
  strFecha: string;
  opGroup: number = 3;
  okAyuda: boolean = false;

  mostrarNormal: boolean = true;

  constructor(public ordenTrabajoService: OrdenTrabajoService, private mConexionService: MenuConexionService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.fechaActual();
    this.cargarData();
  }

  cargarData() {
    this.ordenTrabajoService.getOrdenes()
      .subscribe(ordenes => {
        this.listOrdenesOriginalIn = ordenes;
        this.listOrdenesTrabajoNew = [];
        this.listOrdenesTrabajoOld = [];
        for (var i = 0; i < this.listOrdenesOriginalIn.length; i++) {
          this.listOrdenesOriginalIn[i].fechaIngreso = this.listOrdenesOriginalIn[i].fechaIngreso.substr(0, 10);
          this.listOrdenesOriginalIn[i].fechaFinalizacion = this.listOrdenesOriginalIn[i].fechaFinalizacion;
          
          if (this.listOrdenesOriginalIn[i].estadoProceso == "Antigua")
            this.listOrdenesTrabajoOld.push(this.listOrdenesOriginalIn[i]);
          else {
            if (this.listOrdenesOriginalIn[i].fechaFinalizacion == null) {
              this.listOrdenesOriginalIn[i].fechaFinalizacion = "---n/a---"
            }
            this.listOrdenesTrabajoNew.push(this.listOrdenesOriginalIn[i]);
          }
        }
        this.listOrdenesTrabajoIn = JSON.parse(JSON.stringify(this.listOrdenesTrabajoNew));
        this.getNumberIndex(this.listOrdenesTrabajoIn.length);
        this.updateIndex(0);
        this.spinnerOnOff = false;
      },
        error => console.error(error));
  }

  updateSelect(control:any) {
    this.selectPagination = control.value;
    this.getNumberIndex(this.listOrdenesTrabajoIn.length);
    this.updateIndex(0);
  }

  getNumberIndex(n: number) {
    this.pagTotal = [];
    const aux = n / this.selectPagination;
    var auxEntera = parseInt(aux.toString(), 10);
    var auxValores;
    if ((aux - auxEntera) > 0) {
      auxEntera = auxEntera + 1;
    }
    for (var i = 0; i < auxEntera; i++) {
      auxValores = {
        valorB: false,
        mostrar: false
      }
      this.pagTotal.push(auxValores);
    }
  }

  updateIndex(pageIndex: number) {
    this.pagActualIndex = pageIndex;
    this.startIndex = Number(this.pagActualIndex * this.selectPagination);
    this.endIndex = Number(this.startIndex) + Number(this.selectPagination);

    if (this.pagActualIndex + 2 <= this.pagTotal.length)
      this.siguienteBlock = false;
    else
      this.siguienteBlock = true;

    if (this.pagActualIndex > 0)
      this.anteriorBlock = false;
    else
      this.anteriorBlock = true;

    for (var i = 0; i < this.pagTotal.length; i++) {
      if (i == pageIndex)
        this.pagTotal[i].valorB = true;
      else
        this.pagTotal[i].valorB = false;

      if ((pageIndex == 0 && i < 5) || (pageIndex == 1 && i < 5) || (pageIndex == this.pagTotal.length - 1 && i > this.pagTotal.length - 6) || (pageIndex == this.pagTotal.length - 2 && i > this.pagTotal.length - 6))
        this.pagTotal[i].mostrar = false;
      else {
        if ((i >= pageIndex + 3) || (i <= pageIndex - 3))
          this.pagTotal[i].mostrar = true;
        else
          this.pagTotal[i].mostrar = false;
      }
    }
  }

  onUpdateGroup(control:any) {
    this.opGroup = control.value;
    var x:number=control.value;
    this.mostrarRangoFecha = false;
    switch (Number(x)) {
      case 0:
        this.ordenarOrdenes(this.listOrdenesTrabajoIn, 1);
        break;
      case 1:
        this.ordenarOrdenes(this.listOrdenesTrabajoIn, 2);
        break;
      case 2:
        this.listOrdenesTrabajoIn = [];
        var j = 0;
        if (this.mostrarNormal) {
          for (var i = this.listOrdenesTrabajoNew.length; i > 0; i--) {
            this.listOrdenesTrabajoIn[j] = JSON.parse(JSON.stringify(this.listOrdenesTrabajoNew[i - 1]));
            j++;
          }
        } else
          for (var i = this.listOrdenesTrabajoOld.length; i > 0; i--) {
            this.listOrdenesTrabajoIn[j] = JSON.parse(JSON.stringify(this.listOrdenesTrabajoOld[i - 1]));
            j++;
          }
        break;
      case 3:
        if (this.mostrarNormal)
          this.listOrdenesTrabajoIn = JSON.parse(JSON.stringify(this.listOrdenesTrabajoNew));
        else this.listOrdenesTrabajoIn = JSON.parse(JSON.stringify(this.listOrdenesTrabajoOld));
        break;
      case 4:
        this.listOrdenesTrabajoIn = [];
        var auxNombres = [];
        auxNombres.push("En Proceso");
        auxNombres.push("Preliminar");
        auxNombres.push("Finalizada");
        for (var i = 0; i < auxNombres.length; i++) {
          for (var j = 0; j < this.listOrdenesTrabajoNew.length; j++) {
            if (auxNombres[i] == this.listOrdenesTrabajoNew[j].estadoProceso) {
              this.listOrdenesTrabajoIn.push(this.listOrdenesTrabajoNew[j]);
            }
          }
        }
        break;
      case 5:
        this.listOrdenesTrabajoIn = [];
        var auxNombres = [];
        auxNombres.push("Veda");
        auxNombres.push("Faena");
        auxNombres.push("Dike");
        for (var i = 0; i < auxNombres.length; i++) {
          for (var j = 0; j < this.listOrdenesTrabajoNew.length; j++) {
            if (auxNombres[i] == this.listOrdenesTrabajoNew[j].tipoMantenimiento) {
              this.listOrdenesTrabajoIn.push(this.listOrdenesTrabajoNew[j]);
            }
          }
        }
        break;
      case 6:
        this.mostrarRangoFecha = true;
        this.inHasta = this.strFecha;
        this.inDesde = "";
        break;
      case 7:
        this.listOrdenesTrabajoIn = [];
        this.mostrarNormal = !this.mostrarNormal;
        if (this.mostrarNormal)
          this.listOrdenesTrabajoIn = JSON.parse(JSON.stringify(this.listOrdenesTrabajoNew));
        else this.listOrdenesTrabajoIn = JSON.parse(JSON.stringify(this.listOrdenesTrabajoOld));
        break;
    }
  }

  ordenarOrdenes(list: cOrdenTrabajoB[], op:number) {
    for (var i = 0; i < list.length - 1; i++) {
      for (var k = i, j = i + 1; j < list.length; j++)
        if (op == 1) {
          if (list[j].barcoMaquinaria.barcoId < list[k].barcoMaquinaria.barcoId)
            k = j;
        } else
          if (list[j].barcoMaquinaria.idBarcoMaquinaria < list[k].barcoMaquinaria.idBarcoMaquinaria)
            k = j;
      if (k != i) {
        var aux = list[i];
        list[i] = list[k];
        list[k] = aux;
      }
    }
  }

  onConvertPdf() {
    if (this.internetStatus == "nline") {
      var x: number;
      var y: number;
      var auxCol: string;
      var auxPos: number = 0;
      var auxNombreAgrupar: string;

      switch (this.opGroup) {
        case 0:
          auxNombreAgrupar = "Barcos";
          break;
        case 1:
          auxNombreAgrupar = "Maquinarias";
          break;
        case 2:
          auxNombreAgrupar = "Fechas ingreso Acendente";
          break;
        case 3:
          auxNombreAgrupar = "Fechas ingreso Descendente";
          break;
        case 4:
          auxNombreAgrupar = "Proceso";
          break;
        case 5:
          auxNombreAgrupar = "Tipo Mantenimiento";
          break;
        case 6:
          auxNombreAgrupar = "Desde: " + this.inDesde + " hasta: " + this.inHasta;
          break;
      }
      var doc = new jsPDF('l', 'mm', 'a4'), margin = 15, verticalOffset = margin;

      var idTitulo = document.getElementById("contPrint1");
      doc.html(idTitulo, {x:65, y:10});
      doc.line(9, 40, 290, 40);//up
      doc.line(9, 55, 290, 55);//down
      doc.setFontSize(16);
      doc.text("Reporte", 135, 50);
      doc.line(9, 40, 9, 85);//left//hasta la 3
      doc.line(290, 40, 290, 85);//right //hasta la 3
      doc.setFontSize(14);

      doc.line(9, 70, 290, 70);//down
      doc.text("Agrupar por: " + auxNombreAgrupar, 15, 65);
      doc.line(140, 55, 140, 70);//right
      doc.text("Filtrar por: " + this.filtroOrdenT, 145, 65);
      doc.setFontSize(13);
      doc.line(9, 85, 290, 85);//downn

      doc.text("Orden", 15, 80);
      doc.line(30, 70, 30, 85);//right
      doc.text("Barco", 35, 80);
      doc.line(80, 70, 80, 85);//right
      doc.text("Maquinaria", 85, 80);
      doc.line(130, 70, 130, 85);//right
      doc.text("Fecha Ingreso", 135, 80);
      doc.line(175, 70, 175, 85);//right
      doc.text("Fecha Finalización", 180, 80);
      doc.line(220, 70, 220, 85);//right
      doc.text("Tipo Mantenimiento", 225, 80);
      doc.line(265, 70, 265, 85);//right
      doc.text("Proceso", 270, 80);
      doc.setFontSize(11);
      y = 85;

      var valoralturaBarco: number;
      var valoralturaMaquianria: number;
      var valorG: number = 0;

      for (var i = 0; i < this.listOrdenesTrabajoIn.length; i++) {
        var linesB = doc.splitTextToSize(this.listOrdenesTrabajoIn[i].barcoMaquinaria.barco.nombre, 40);
        valoralturaBarco = (2 * linesB.length) + 13;
        var linesM = doc.splitTextToSize(this.listOrdenesTrabajoIn[i].barcoMaquinaria.nombre, 40);
        valoralturaMaquianria = (2 * linesM.length) + 13;
        if (valoralturaBarco >= valoralturaMaquianria)
          valorG = valoralturaBarco;
        else valorG = valoralturaMaquianria;
        y = y + valorG;
        if (y > 205) {
          y = 35;
          doc.addPage();
          doc.setFontSize(13);
          doc.line(9, y - 15, 290, y - 15);//up
          doc.line(9, y, 290, y);//downn
          doc.line(9, y - 15, 9, y);//left
          doc.line(290, y - 15, 290, y);//right
          doc.text("Orden", 15, y - 5);
          doc.line(30, y - 15, 30, y);//right
          doc.text("Barco", 35, y - 5);
          doc.line(80, y - 15, 80, y);//right
          doc.text("Maquinaria", 85, y - 5);
          doc.line(130, y - 15, 130, y);//right
          doc.text("Fecha Ingreso", 135, y - 5);
          doc.line(175, y - 15, 175, y);//right
          doc.text("Fecha Finalización", 180, y - 5);
          doc.line(220, y - 15, 220, y);//right
          doc.text("Tipo Mantenimiento", 225, y - 5);
          doc.line(265, y - 15, 265, y);//right
          doc.text("Proceso", 270, y - 5);
          y = y + valorG;
          doc.setFontSize(11);
        }
        doc.text("#" + this.listOrdenesTrabajoIn[i].idOrdenT, 15, (y - ((valorG - 2) / 2)));
        doc.text(linesB, 35, (y - ((valorG - (2 * linesB.length)) / 2)));
        doc.text(linesM, 85, (y - ((valorG - (2 * linesM.length)) / 2)));
        doc.text(this.listOrdenesTrabajoIn[i].fechaIngreso, 135, (y - ((valorG - 2) / 2)));
        doc.text(this.listOrdenesTrabajoIn[i].fechaFinalizacion, 180, (y - ((valorG - 2) / 2)));
        doc.text(this.listOrdenesTrabajoIn[i].tipoMantenimiento, 225, (y - ((valorG - 2) / 2)));
        doc.text(this.listOrdenesTrabajoIn[i].estadoProceso, 270, (y - ((valorG - 2) / 2)));

        doc.line(30, (y - valorG), 30, y);//right
        doc.line(80, (y - valorG), 80, y);//right
        doc.line(130, (y - valorG), 130, y);//right
        doc.line(175, (y - valorG), 175, y);//right
        doc.line(220, (y - valorG), 220, y);//right
        doc.line(265, (y - valorG), 265, y);//right

        doc.line(9, (y - valorG), 9, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(9, y, 290, y);//downn
      }
      doc.save("Reporte" + this.strFecha);
    }
  }

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (this.internetStatus == "ffline") {
      window.alert('No ahi conexión de Internet! no se puede proseguir');
      return false
    }
    return true;
  }

  getDataFiltro(data:cOrdenTrabajoB[], op: number) {//Para q la filtracion de datos se automatica
    if (op == 1) {
      if (this.resultBusquedaMostrar.length == 0) {
        this.resultBusquedaMostrar = JSON.parse(JSON.stringify(data));
      } else {
        if (JSON.stringify(data) != JSON.stringify(this.resultBusquedaMostrar)) {
          this.resultBusquedaMostrar = JSON.parse(JSON.stringify(data));
        }
      }
    }
  }

  fechaActual() {
    let hoy = new Date();
    let dia = hoy.getDate();
    let anio = hoy.getFullYear();
    let mes = hoy.getMonth() + 1;
    var strmonth = "";
    var strday = "";
    if (mes < 10)
      strmonth = "0" + mes;
    else
      strmonth = "" + mes;
    if (dia < 10)
      strday = "0" + dia;
    else
      strday = "" + dia;
    this.strFecha = anio + '-' + strmonth + '-' + strday;
  }

  onGenerar() {
    this.listOrdenesTrabajoIn = [];
    var diaDiferenciaDesde;
    var diaDiferenciaHasta;
    var diaDiferenciaEntrada1;
    var diaDiferenciaEntrada2;
    var auxList: cOrdenTrabajoB[];
    if (this.inDesde != "" && this.inHasta != "") {
      diaDiferenciaDesde = this.compararFechas(this.inDesde.split("-"), this.strFecha.split("-"));
      diaDiferenciaHasta = this.compararFechas(this.inHasta.split("-"), this.strFecha.split("-"));

      if(this.mostrarNormal)
        auxList=this.listOrdenesTrabajoNew;
      else
        auxList=this.listOrdenesTrabajoOld;

      for (var i = 0; i < auxList.length; i++) {
        diaDiferenciaEntrada1 = this.compararFechas(auxList[i].fechaIngreso.split("-"), this.strFecha.split("-"));
        if (auxList[i].fechaFinalizacion != "---n/a---") {
          diaDiferenciaEntrada2 = this.compararFechas(auxList[i].fechaFinalizacion.split("-"), this.strFecha.split("-"));
          if ((diaDiferenciaHasta <= diaDiferenciaEntrada1 && diaDiferenciaEntrada1 <= diaDiferenciaDesde) || (diaDiferenciaHasta <= diaDiferenciaEntrada2 && diaDiferenciaEntrada2 <= diaDiferenciaDesde)) {
            this.listOrdenesTrabajoIn.push(auxList[i]);
          }
        }else{
          if((diaDiferenciaHasta <= diaDiferenciaEntrada1)&&(diaDiferenciaEntrada1<=diaDiferenciaDesde))
            this.listOrdenesTrabajoIn.push(auxList[i]);
        }
      }
    }
  }

  //Listo
  compararFechas(fecha1:any[], fecha2:any[]) {
    var diferenciaAnio;
    var diferenciaMes;
    var diferenciaDia;
    diferenciaAnio = Number(fecha2[0] - Number(fecha1[0]));
    diferenciaMes = Number(fecha2[1] - Number(fecha1[1]));
    diferenciaMes = Number((diferenciaAnio * 12) + diferenciaMes);
    diferenciaDia = Number(fecha2[2] - Number(fecha1[2]));
    diferenciaDia = Number((diferenciaMes * 30.4) + diferenciaDia);
    if (diferenciaDia < 0)
      diferenciaDia = diferenciaDia * -1;
    return diferenciaDia;
  }
}
