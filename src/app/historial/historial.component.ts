import { Component, OnInit } from '@angular/core';
import { MenuConexionService } from '../shared/otrosServices/menu-conexion.service';
import { BarcoService } from '../shared/barco.service';
import { cBarco, cBarcoMaquinarias } from '../shared/barco.model';
import { FormControl } from '@angular/forms';
import { cHistorialesProyeccion, cHistorialBM, cHistorialIn, cListaHistorialHechas } from '../shared/ordenTrabajo/cOrdenModel.model';
import { OrdenTrabajoService } from '../shared/ordenTrabajo/orden-trabajoB.service';
import { PlanMantenimientoService } from '../shared/mantenimiento/plan-mantenimiento.service';
import { HistorialService } from '../shared/ordenTrabajo/historial.service';
import { cIntervalo } from '../shared/mantenimiento/cManModel.model';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styles: []
})
export class HistorialComponent implements OnInit {

  internetStatus: string = 'nline';
  listBarcoIn: cBarco[] = [];
  barcoSelected: cBarco;
  listBarcoMaquinaria: cBarcoMaquinarias[];
  historialesMaquinaria: cHistorialesProyeccion;
  historialCopy: cHistorialBM[] = [];

  controlVisual: any[] = [];
  intervalosHabiles: cHistorialIn[];
  okHisto: number = 0;
  okHistoIn: number = 0;
  strFecha: string;
  strFechaDesde: string;
  strFechaHasta: string;
  intervaloAnterior: number;
  filtroVisual = '1';
  okVisual: boolean = false;
  spinnerOnOff: boolean = false;
  radioCustomControl: FormControl = new FormControl(false);
  okAyuda: boolean = false;

  constructor(private mConexionService: MenuConexionService, private barcoService: BarcoService, private ordenTrabajoService: OrdenTrabajoService, private planMantenimientoService: PlanMantenimientoService, private historialService: HistorialService) { }

  ngOnInit() {//esta apgina esta incompleta
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.fechaActual();
    this.cargarDataBarco();
  }

  //Listo
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
    this.strFechaDesde = (anio - 1) + '-' + strmonth + '-' + strday;
    this.strFechaHasta = anio + '-' + strmonth + '-' + strday;

  }

  //Listo
  cargarDataBarco() {
    this.barcoService.getBarcosSelect2()
      .subscribe(plan => {
        for (var i = 0; i < plan.length; i++) {
          if (plan[i].listBarcoMaquinarias.length > 0) {
            this.listBarcoIn.push(plan[i]);
          }
        }
      },
        error => console.error(error));
  }

  //Listo
  updateSelectBarco(control:any) {
    this.barcoSelected = this.listBarcoIn[control.selectedIndex - 1];
    this.radioCustomControl.setValue(false);
  }
  //Listo
  onSelectMaquinaria(indiceMaquinaria:number) {
    this.spinnerOnOff = true;
    this.historialesMaquinaria = null;
    this.okHisto = 0;
    this.primeraFaseHistorialG(indiceMaquinaria);
  }

  primeraFaseHistorialG(indiceMaquinaria: number) {
    this.historialesMaquinaria = {
      idBarcoMaquinaria: this.barcoSelected.listBarcoMaquinarias[indiceMaquinaria].idBarcoMaquinaria,
      idPlanMantenimiento: this.barcoSelected.listBarcoMaquinarias[indiceMaquinaria].maquinaria.planMantenimientoId,
      nombreMaquinaria: this.barcoSelected.listBarcoMaquinarias[indiceMaquinaria].nombre,
      listOrdenesMaquinaria: [],
      planMaquinaria: null,
      historialMaquinaria2: [],
      fechaIncorporacionBM: this.barcoSelected.listBarcoMaquinarias[indiceMaquinaria].fechaIncorporacionB
    }
    this.planMantenimientoService.getPlanMantenimientoOrden(this.historialesMaquinaria.idPlanMantenimiento)
      .subscribe(plan => {

        this.historialesMaquinaria.planMaquinaria = plan;
        for (var ij = 0; ij < this.historialesMaquinaria.planMaquinaria.listIntervalo.length; ij++)
          this.historialesMaquinaria.planMaquinaria.listIntervalo[ij].seleccionActiva = false;
        this.cargarHistorialG(indiceMaquinaria);
      });
  }

  //Listo
  cargarHistorialG(indiceMaquinaria: number) {
    this.historialService.getHistorialBM(this.barcoSelected.listBarcoMaquinarias[indiceMaquinaria].idBarcoMaquinaria).subscribe(
      (historial: any) => {
        this.spinnerOnOff = false;
        if (!historial.message) {
          for (var a = 0; a < historial.length - 1; a++) {
            for (var c = a, b = a + 1; b < historial.length; b++)
              if (historial[b].intervaloId < historial[c].intervaloId)
                c = b;
            if (c != a) {
              var aux = historial[a];
              historial[a] = historial[c];
              historial[c] = aux;
            }
          }
          this.historialesMaquinaria.historialMaquinaria2 = historial;
          this.historialCopy = JSON.parse(JSON.stringify(historial));
          this.okHisto = 1;
        } else this.okHisto = -1;
      },
      err => console.log(err)
    );
  }

  //Listo
  limiteFechaHasta() {
    var fecha1 = this.strFecha.split("-");
    var fecha2 = this.strFechaHasta.split("-");
    var fecha3 = this.strFechaDesde.split("-");

    if (fecha1[0] < fecha2[0])
      fecha2[0] = fecha1[0];

    if (fecha1[0] < fecha3[0])
      fecha3[0] = fecha1[0];

    if (fecha3[0] > fecha2[0]) //caso que la desde sea mayor que la fecha hasta
      fecha2[0] = fecha3[0];

    if (fecha1[1] < fecha2[1] && fecha1[0] == fecha2[0]) // F 2020-02-11 FH 2020-03-11
      fecha2[1] = fecha1[1];

    if (fecha1[1] < fecha3[1] && fecha1[0] == fecha3[0]) // F 2020-02-11 FD 2020-03-11
      fecha3[1] = fecha1[1];

    if (fecha3[1] > fecha2[1] && fecha3[0] == fecha2[0]) //FD 2020-03-11 FH 2020-02-11
      fecha2[1] = fecha3[1];

    if (fecha1[2] < fecha2[2] && fecha1[0] == fecha2[0] && fecha1[1] == fecha2[1]) // F 2020-02-11 FH 2020-02-12
      fecha2[2] = fecha1[2];

    if (fecha1[2] < fecha3[2] && fecha1[0] == fecha3[0] && fecha1[1] == fecha3[1]) // F 2020-02-11 FD 2020-02-12
      fecha3[2] = fecha1[2];

    if (fecha3[2] > fecha2[2] && fecha3[0] == fecha2[0] && fecha3[1] == fecha2[1]) // FH 2020-02-11 FD 2020-02-12
      fecha2[2] = fecha3[2];

    this.strFechaHasta = fecha2[0] + "-" + fecha2[1] + "-" + fecha2[2];
    this.strFechaDesde = fecha3[0] + "-" + fecha3[1] + "-" + fecha3[2];
  }

  //Cambio
  updateProyeccion() {
    var diaDDesde: number = this.compararFechas(this.strFechaDesde.split("-"), this.strFecha.split("-"));
    var diaDHasta: number = this.compararFechas(this.strFechaHasta.split("-"), this.strFecha.split("-"));
    var diaDComparar: number;
    this.okVisual = true;
    this.okHistoIn = 0;
    this.historialesMaquinaria.historialMaquinaria2 = JSON.parse(JSON.stringify(this.historialCopy));
    for (var i = 0; i < this.historialesMaquinaria.historialMaquinaria2.length; i++) {
      for (var j = 0; j < this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes.length; j++) {
        diaDComparar = this.compararFechas(this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes[j].ordenT.fechaFinalizacion.split("-"), this.strFecha.split("-"))
        if (diaDDesde < diaDComparar || diaDComparar < diaDHasta) {
          this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes.splice(j, 1);
          j--;
        }
      }
      if (this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes.length == 0) {
        this.historialesMaquinaria.historialMaquinaria2.splice(i, 1);
        i--;
      }
    }
  }

  cambiarSelect(indiceIntervalo:number) {
    for (var i = 0; i < this.historialesMaquinaria.planMaquinaria.listIntervalo.length; i++) {
      if (i == indiceIntervalo) {
        this.historialesMaquinaria.planMaquinaria.listIntervalo[i].seleccionActiva = !this.historialesMaquinaria.planMaquinaria.listIntervalo[i].seleccionActiva;
      }
      else {
        this.historialesMaquinaria.planMaquinaria.listIntervalo[i].seleccionActiva = false;
      }
    }
  }

  onArmarFecha(interId: number, posIn: number) {
    if (this.intervaloAnterior != interId) {
      this.intervaloAnterior = interId;
      this.controlVisual = [];
      this.intervalosHabiles = [];
      this.okHistoIn = 0;
      var auxIntHabil: cHistorialIn;
      var auxIntFechas: cListaHistorialHechas;

      var auxPosInterMayor: number = 0;
      var auxPosInterMenor: number = 0;
      var auxPosFechasMayor: number = 0;
      var auxPosFechasMenor: number = 0;
      var auxDiaMayor: number = 0;
      var auxDiaMenor: number = 0;

      for (var i = 0; i < this.historialesMaquinaria.historialMaquinaria2.length; i++) {
        if (this.historialesMaquinaria.historialMaquinaria2[i].intervaloId == interId) {
          var aux: cIntervalo = this.historialesMaquinaria.planMaquinaria.listIntervalo.find(x => x.idIntervaloM == interId);
          var posIndiceT = null;
          for (var indiceT = 0; indiceT < aux.listTareas.length; indiceT++) {
            if (aux.listTareas[indiceT].tareaId == this.historialesMaquinaria.historialMaquinaria2[i].tareaMId)
              posIndiceT = indiceT;
          }
          this.okHistoIn = 1;
          auxIntHabil = {
            indiceIntervalo: (posIn + 1),
            indiceTarea: (posIndiceT + 1),
            listFechas: [],
          }
          this.intervalosHabiles.push(auxIntHabil);
          for (var j = 0; j < this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes.length; j++) {
            auxIntFechas = {
              historialTaOrdenId: this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes[j].idHistorialTaOrden,
              ordenTId: this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes[j].ordenTId,
              ordenT: this.historialesMaquinaria.historialMaquinaria2[i].listHistoTaOrdenes[j].ordenT,
              marcar: true,
            }
            this.intervalosHabiles[this.intervalosHabiles.length - 1].listFechas.push(auxIntFechas);
          }

        }
      }
      if (this.okHistoIn == 1) {
        for (var a = 0; a < this.intervalosHabiles.length - 1; a++) {
          for (var c = a, b = a + 1; b < this.intervalosHabiles.length; b++)
            if (this.intervalosHabiles[b].indiceTarea < this.intervalosHabiles[c].indiceTarea)
              c = b;
          if (c != a) {
            var aux2 = this.intervalosHabiles[a];
            this.intervalosHabiles[a] = this.intervalosHabiles[c];
            this.intervalosHabiles[c] = aux2;
          }
        }

        /*var auxF=this.intervalosHabiles[0].listFechas[0].ordenT.fechaFinalizacion.split("-");
        auxDiaMenor=this.compararFechas(auxF, this.strFecha.split("-"));
        auxPosInterMenor=0;*/

        for (var a = 0; a < this.intervalosHabiles.length; a++) {
          var auxStr = this.onBuscarUltimaHOrden(this.intervalosHabiles[a].listFechas).split("-");
          /*if(Number(auxStr[1])<auxDiaMenor){
            auxDiaMenor=Number(auxStr[1]);
            auxPosInterMenor=a;
            auxPosFechasMenor=Number(auxStr[0]);
          }*/
          if(Number(auxStr[3])>auxDiaMayor){
            auxDiaMayor=Number(auxStr[3]);
            auxPosInterMayor=a;
            auxPosFechasMayor=Number(auxStr[2]);
          }
        }
        console.table(this.intervalosHabiles);
        //console.table(this.intervalosHabiles[auxPosInterMenor].listFechas[auxPosFechasMenor]);
        console.table(this.intervalosHabiles[auxPosInterMayor].listFechas[auxPosFechasMayor]);
        console.table(this.historialesMaquinaria.planMaquinaria.listIntervalo.find(x=>x.idIntervaloM==interId));
      } else this.okHistoIn = -1;
    }
  }

  onBuscarUltimaHOrden(listHO: cListaHistorialHechas[]) {
    var posIMenor: number = listHO.length - 1;
    var posIMayor: number = listHO.length - 1;
    var auxF=listHO[posIMenor].ordenT.fechaFinalizacion.split("-");
    var diasD: number;
    var diaMenor: number=this.compararFechas(auxF, this.strFecha.split("-"));
    var diaMayor: number=this.compararFechas(auxF, this.strFecha.split("-"));
    var strI: string=posIMenor + "-" + diaMenor + "-" + posIMayor + "-" + diaMayor;;

    if (listHO.length > 1) {
      for (var i = (listHO.length - 2); i >= 0; i--) {
        auxF = listHO[i].ordenT.fechaFinalizacion.split("-");
        diasD = this.compararFechas(auxF, this.strFecha.split("-"));
        if (diasD < diaMenor) {
          posIMenor = i;
          diaMenor = diasD;
        }
        if (diasD > diaMayor) {
          posIMayor = i;
          diaMayor = diasD;
        }
      }
    }
    strI = posIMenor + "-" + diaMenor + "-" + posIMayor + "-" + diaMayor;
    return (strI);
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
