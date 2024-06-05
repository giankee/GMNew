import { Component, OnInit, Input } from '@angular/core';
import { MenuConexionService } from '../shared/otrosServices/menu-conexion.service';
import { BarcoService } from '../shared/barco.service';
import { cBarco } from '../shared/barco.model';
import { HistorialService } from '../shared/ordenTrabajo/historial.service';
import { OrdenTrabajoService } from '../shared/ordenTrabajo/orden-trabajoB.service';
import { cOrdenTrabajoB, cHistorialProyeccion, cHistorialesProyeccion, cHistorialTaOrden } from '../shared/ordenTrabajo/cOrdenModel.model';
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import { PlanMantenimientoService } from '../shared/mantenimiento/plan-mantenimiento.service';
import { cPlanMantenimiento, cEventoMediciones, cIntervaloTarea } from '../shared/mantenimiento/cManModel.model';
import { AlertaService } from '../shared/otrosServices/alerta.service';
import { FormControl } from '@angular/forms';
import { cAlerta } from '../shared/basicos';


@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styles: []
})
export class CalendarioComponent implements OnInit {

  listBarcoIn: cBarco[] = [];
  listAlertasIn: cAlerta[];
  internetStatus: string = 'nline';
  spinnerOnOff: boolean = false;
  barcoSelected: cBarco;
  selectOrden: cOrdenTrabajoB = null;
  selectPronosticoEvento: cEventoMediciones = null;
  selectPronosticoNombreMaquinaria: string = null;
  selectPronosticoTarea: cIntervaloTarea = null;
  historialCopy: cHistorialProyeccion[] = [];
  historialesMaquinarias: cHistorialesProyeccion[] = [];
  valorHSMaximo: number;
  diferenciaDias: number;
  promedioHS: number;
  promedioDia: number;
  strFecha: string;
  strFechaHasta: string;
  strFechaMaxHasta: string;
  onOffCalendar: boolean = false;
  selectPlanM: cPlanMantenimiento;
  inputProyeccion: number = 1;
  limiteDiaMes: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  okPronostico: boolean = false;
  okOrden: boolean = false;
  cont1: number;
  radioCustomControl: FormControl = new FormControl(false);
  okAyuda: boolean = false;
  constructor(private mConexionService: MenuConexionService, private barcoService: BarcoService, private historialService: HistorialService, private ordenTrabajoService: OrdenTrabajoService, private planMantenimientoService: PlanMantenimientoService, private alertaService: AlertaService) { }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth'
  };

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.fechaActual();
    this.cargarDataBarco();
    this.cargarDataAlerta();
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
  cargarDataAlerta() {
    this.alertaService.getAlertas().subscribe(alerta => {
      this.listAlertasIn = alerta;
    },
      error => console.error(error));
  }

  //Listo
  updateSelectBarco(control:any) {
    this.barcoSelected = this.listBarcoIn[Number(control.selectedIndex) - 1];
    this.onOffCalendar = false;
    this.radioCustomControl.setValue(false);
    this.inputProyeccion = 1;
  }

  //Listo
  onSelectMaquinaria(indiceMaquinaria:number) {
    this.spinnerOnOff = true;
    this.historialesMaquinarias = [];
    this.okOrden = false;
    this.inputProyeccion = 1;
    if (indiceMaquinaria != -1) {
      this.primeraFaseHistorialG(indiceMaquinaria);
    }
    else {
      this.primeraFaseHistorialG();
    }
  }

  //Listo
  cargarHistorialG(indiceMaquinaria?: number) {
    if (indiceMaquinaria != null) {
      this.historialService.getHistorialBM(this.barcoSelected.listBarcoMaquinarias[indiceMaquinaria].idBarcoMaquinaria).subscribe(
        (historial: any) => {
          var auxPosR;
          if (!historial.message) {
            this.okPronostico = true;
            var auxHistorial: cHistorialProyeccion;
            this.historialCopy = [];
            for (var a = 0; a < historial.length; a++) {
              for (var i = 0; i < historial[a].listHistoTaOrdenes.length - 1; i++) {
                for (var k = i, j = i + 1; j < historial[a].listHistoTaOrdenes.length; j++)
                  if (historial[a].listHistoTaOrdenes[j].idHistorialTaOrden < historial[a].listHistoTaOrdenes[k].idHistorialTaOrden)
                    k = j;
                if (k != i) {
                  var aux = historial[a].listHistoTaOrdenes[i];
                  historial[a].listHistoTaOrdenes[i] = historial[a].listHistoTaOrdenes[k];
                  historial[a].listHistoTaOrdenes[k] = aux;
                }
              }
            }
            for (var i = 0; i < historial.length; i++) {
              auxPosR=this.onBuscarUltimaHOrden(historial[i].listHistoTaOrdenes)
              auxHistorial = {
                barcoMaquinariaId: historial[i].barcoMaquinariaId,
                tareaMId: historial[i].tareaMId,
                intervaloId: historial[i].intervaloId,
                fechaFinalizacion: historial[i].listHistoTaOrdenes[auxPosR].ordenT.fechaFinalizacion,
                valorHS: historial[i].listHistoTaOrdenes[auxPosR].ordenT.valorHS,
              }
              this.historialCopy.push(auxHistorial);
            }
          }
          else this.okPronostico = false;
          this.segundaFaseHistorialG();
        },
        err => console.log(err)
      );
    }
    else {
      this.historialService.getHistorialB(this.barcoSelected.idBarco).subscribe(
        (historial: any) => {
          if (!historial.message) {
            this.okPronostico = true;
            var auxHistorial: cHistorialProyeccion;
            this.historialCopy = [];
            for (var i = 0; i < historial.length; i++) {
              auxHistorial = {
                barcoMaquinariaId: historial[i].barcoMaquinariaId,
                tareaMId: historial[i].tareaMId,
                intervaloId: historial[i].intervaloId,
                fechaFinalizacion: historial[i].ordenT.fechaFinalizacion,
                valorHS: historial[i].ordenT.valorHS,
              }
              this.historialCopy.push(auxHistorial);
            }
          }
          else this.okPronostico = false;
          this.segundaFaseHistorialG();
        },
        err => console.log(err)
      );
    }

  }

  onBuscarUltimaHOrden(listHO:cHistorialTaOrden[]) {
    var posI: number = listHO.length - 1;
    var auxF;
    var diasD: number;
    var DiaMenor: number;
    var contEscape: number=0;
      if (listHO.length > 1) {
        auxF = listHO[posI].ordenT.fechaFinalizacion.split("-");
        DiaMenor = this.compararFechas(auxF, this.strFecha.split("-"));
        for (var i = (listHO.length - 2); i >= 0; i--) {
          contEscape++;
          auxF = listHO[i].ordenT.fechaFinalizacion.split("-");
          diasD = this.compararFechas(auxF, this.strFecha.split("-"));
          if (diasD < DiaMenor) {
            posI = i;
            DiaMenor = diasD;
          }
          if(contEscape==5)
            i=-1;
        }
      }
    return (posI);
  }

  //listo
  primeraFaseHistorialG(indiceMaquinaria?:any) {
    var auxStar = 0;
    var auxEnd = this.barcoSelected.listBarcoMaquinarias.length - 1;
    if (indiceMaquinaria != null) {
      auxStar = indiceMaquinaria;
      auxEnd = indiceMaquinaria;
    }

    for (var i = auxStar; i <= auxEnd; i++) {
      var auxHistorialesMaquianrias: cHistorialesProyeccion = {
        idBarcoMaquinaria: this.barcoSelected.listBarcoMaquinarias[i].idBarcoMaquinaria,
        idPlanMantenimiento: this.barcoSelected.listBarcoMaquinarias[i].maquinaria.planMantenimientoId,
        nombreMaquinaria: this.barcoSelected.listBarcoMaquinarias[i].nombre,
        listOrdenesMaquinaria: [],
        planMaquinaria: null,
        historialMaquinaria: [],
        fechaIncorporacionBM: this.barcoSelected.listBarcoMaquinarias[i].fechaIncorporacionB
      }
      this.historialesMaquinarias.push(auxHistorialesMaquianrias);
    }

    this.cont1 = 0;
    this.okOrden = false;
    for (var primerCiclo = 0; primerCiclo< this.historialesMaquinarias.length; primerCiclo++) {
      this.planMantenimientoService.getPlanMantenimientoOrden(this.historialesMaquinarias[primerCiclo].idPlanMantenimiento)
        .subscribe(plan => {
          for (var auxA1 = 0; auxA1 < this.historialesMaquinarias.length; auxA1++) {
            if (plan.idPlanMantenimiento == this.historialesMaquinarias[auxA1].idPlanMantenimiento) {
              this.historialesMaquinarias[auxA1].planMaquinaria = plan;
              this.ordenTrabajoService.getOrdenesMaquinaria(this.historialesMaquinarias[auxA1].idBarcoMaquinaria)
                .subscribe(
                  (listOrdenes: any) => {
                    if (!listOrdenes.message) {
                      this.okOrden = true;
                      for (var auxA1 = 0; auxA1 < this.historialesMaquinarias.length; auxA1++) {
                        if (listOrdenes[0].barcoMaquinariaId == this.historialesMaquinarias[auxA1].idBarcoMaquinaria) {
                          this.historialesMaquinarias[auxA1].listOrdenesMaquinaria = listOrdenes;
                        }
                      }
                    }
                    this.cont1 = this.cont1 + 1;
                    if (this.cont1 == this.historialesMaquinarias.length) {
                      this.spinnerOnOff = false;
                      if (this.okOrden) {
                        this.onOffCalendar = true;
                        for (var iHM = 0; iHM < this.historialesMaquinarias.length; iHM++) {
                          this.historialesMaquinarias[iHM].historialMaquinaria = [];
                          if (this.historialesMaquinarias[iHM].listOrdenesMaquinaria.length == 0) {
                            this.historialesMaquinarias.splice(iHM, 1);
                            iHM--;
                          }
                        }
                        this.cargarHistorialG(indiceMaquinaria);
                      }
                      else this.onOffCalendar = false;
                    }
                  }
                );
            }
          }
        });
    }
  }

  segundaFaseHistorialG() {
    if (this.okPronostico)
      for (var i = 0; i < this.historialesMaquinarias.length; i++) {
        for (var j = 0; j < this.historialCopy.length; j++) {
          if (this.historialCopy[j].barcoMaquinariaId == this.historialesMaquinarias[i].idBarcoMaquinaria)
            this.historialesMaquinarias[i].historialMaquinaria.push(this.historialCopy[j]);
        }
      }
    //this.onPrepararCalendarioG();
  }
/*
  onPrepararCalendarioG() {
    var fechaA;
    var fechaS;
    var auxDiaA;
    var self = this;
    var auxSumHS = 0;
    let containerEl: JQuery = $('#calendar');
    containerEl.fullCalendar({
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día'
      },
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek'
      },
      navLinks: true,
      editable: false,
      eventLimit: true,
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      eventClick: function (event) {
        self.onClickEvento(event.id);
      },
    });
    $('#calendar').fullCalendar('removeEvents');
    for (var iHM = 0; iHM < this.historialesMaquinarias.length; iHM++) {
      auxSumHS = 0;
      this.valorHSMaximo = 0;
      fechaA = this.historialesMaquinarias[iHM].fechaIncorporacionBM.split("-");
      fechaS = this.historialesMaquinarias[iHM].listOrdenesMaquinaria[0].fechaIngreso.split("-");//nc si debe ser la ultima o la primera
      auxDiaA = this.compararFechas(fechaA, fechaS);
      var event: any;
      for (var i = 0; i < this.historialesMaquinarias[iHM].listOrdenesMaquinaria.length; i++) {
        fechaA = this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].fechaIngreso.split("-");
        if (i + 1 == this.historialesMaquinarias[iHM].listOrdenesMaquinaria.length) {
          if (this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].estadoProceso == "Finalizada")
            fechaA = this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].fechaFinalizacion.split("-");
          fechaS = this.strFecha.split("-");
          this.diferenciaDias = this.compararFechas(fechaA, fechaS);
        } else {
          fechaS = this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i + 1].fechaIngreso.split("-");
          auxDiaA = auxDiaA + this.compararFechas(fechaA, fechaS);
        }
        if (this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].valorHS > this.valorHSMaximo)
          this.valorHSMaximo = this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].valorHS;
        auxSumHS = auxSumHS + this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].valorHS;
        if (this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].estadoProceso == 'En proceso' || this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].estadoProceso == 'Preliminar') {
          event = { id: this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].idOrdenT, title: "Orden # " + this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].idOrdenT, start: this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].fechaIngreso, color: '#E53935' };
        } else {
          event = { id: this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].idOrdenT, title: "Orden # " + this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].idOrdenT, start: this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].fechaIngreso, end: this.historialesMaquinarias[iHM].listOrdenesMaquinaria[i].fechaFinalizacion, color: '#007bff' };//revisar fecha mal
        }
        $('#calendar').fullCalendar('renderEvent', event, true);
      }
      if (this.okPronostico) {
        if (this.historialesMaquinarias[iHM].historialMaquinaria.length > 0) {
          this.promedioDia = auxDiaA / this.historialesMaquinarias[iHM].listOrdenesMaquinaria.length;
          this.promedioHS = auxSumHS / this.historialesMaquinarias[iHM].listOrdenesMaquinaria.length;
          this.selectPlanM = this.historialesMaquinarias[iHM].planMaquinaria;
          this.predicionEventos(this.valorHSMaximo, this.diferenciaDias, iHM);
        }
      }
    }
  }*/

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
    this.strFechaHasta = (anio + 1) + '-' + strmonth + '-' + strday;
    this.strFechaMaxHasta = (anio + 5) + '-' + strmonth + '-' + strday;

  }

  //Listo
  onClickEvento(idEvento:any) {
    this.selectOrden = null;
    this.selectPronosticoEvento = null;
    this.selectPronosticoTarea = null;
    var aux;
    if (typeof idEvento === 'number') {
      for (var i = 0; i < this.historialesMaquinarias.length; i++)
        for (var j = 0; j < this.historialesMaquinarias[i].listOrdenesMaquinaria.length; j++) {
          if (this.historialesMaquinarias[i].listOrdenesMaquinaria[j].idOrdenT == idEvento) {
            this.selectOrden = this.historialesMaquinarias[i].listOrdenesMaquinaria[j];
            this.selectOrden.nombreMaquinaria = this.historialesMaquinarias[i].nombreMaquinaria;
          }
        }
    }
    else {
      aux = idEvento.split("-");
      this.selectPronosticoEvento = this.selectPlanM.listIntervalo[aux[3]].listEventoMediciones[aux[2]];
      this.selectPronosticoTarea = this.selectPlanM.listIntervalo[aux[3]].listTareas[aux[4]];
      this.selectPronosticoNombreMaquinaria = this.historialesMaquinarias[aux[5]].nombreMaquinaria;
    }
  }
/*
  predicionEventos(auxValorHSMaximo: number, auxDiferenciaDias:number, indiceHistorialM: number) {
    var auxHistorialCopy: cHistorialProyeccion[] = [];
    auxHistorialCopy = JSON.parse(JSON.stringify(this.historialesMaquinarias[indiceHistorialM].historialMaquinaria));
    var event: any;
    var valorLimite: number;
    var auxPosJ: number;
    var reglaHS: number;
    var nt;
    var fechaU = this.strFecha.split("-");
    var fechaHasta = this.strFechaHasta.split("-");
    var fechaAnterior: string[];
    var strAuxFecha: string;
    var interDiaDiferencia: number;
    var difAnio = Math.round(this.compararFechas(fechaU, fechaHasta));
    var fechaHisto;
    var diferenciaVar: number = -1;
    var mensaje;

    difAnio = Math.round(difAnio / 30.4);
    for (var Rc = 1; Rc <= difAnio; Rc++) {//para saber cuantos anios de filtro x defecto es 1 anio x defecto 12 mes un anio
      var fechaUltimaMes: string = fechaU[0] + "-" + fechaU[1] + "-" + this.limiteDiaMes[Number(fechaU[1]) - 1];
      if (Rc == 1) {//si es el primer mes debe hacer dos recorridos la fecha actual y la q le corresponda otro dia
        nt = 0;
        interDiaDiferencia = Number((this.compararFechas(fechaU, fechaUltimaMes.split("-")) / (this.inputProyeccion + 1)).toFixed()) - 1;
      }
      else { //el resto de meses
        nt = 1;
        interDiaDiferencia = this.compararFechas(fechaAnterior, fechaU);
        let a = Number((this.compararFechas(fechaU, fechaUltimaMes.split("-")) / (this.inputProyeccion + 1)).toFixed()) - 1;

        var auxStrMes = Number(fechaU[1]).toString();
        var auxStrDia = Number(Number(fechaU[2]) + a).toString();
        if (Number(auxStrMes) < 10) {
          auxStrMes = "0" + auxStrMes;
        }
        if (Number(auxStrDia) < 10) {
          auxStrDia = "0" + auxStrDia;
        }
        strAuxFecha = fechaU[0] + "-" + auxStrMes + "-" + auxStrDia;
        fechaU = strAuxFecha.split("-");
        interDiaDiferencia = interDiaDiferencia + a;
        auxDiferenciaDias = interDiaDiferencia;
      }
      for (var nP = nt; nP <= this.inputProyeccion; nP++) {
        reglaHS = Number((this.promedioHS * auxDiferenciaDias) / this.promedioDia);
        auxValorHSMaximo = auxValorHSMaximo + reglaHS;
        for (var i = 0; i < this.selectPlanM.listIntervalo.length; i++) {
          for (var j = 0; j < this.selectPlanM.listIntervalo[i].listEventoMediciones.length; j++) {
            if (this.selectPlanM.listIntervalo[i].listEventoMediciones[j].eventoId == 4) {//solo los que son cada
              valorLimite = this.selectPlanM.listIntervalo[i].listEventoMediciones[j].valor;
              for (var k = 0; k < this.selectPlanM.listIntervalo[i].listTareas.length; k++) {//recorre cada tarea del plan
                auxPosJ = -1;
                for (var h = 0; h < auxHistorialCopy.length; h++) {
                  if (auxHistorialCopy[h].tareaMId == this.selectPlanM.listIntervalo[i].listTareas[k].tareaId && auxHistorialCopy[h].intervaloId == this.selectPlanM.listIntervalo[i].idIntervaloM)
                    auxPosJ = h;
                }
                switch (this.selectPlanM.listIntervalo[i].listEventoMediciones[j].medicionId) {//segun la medicion
                  case 1://horas Servicio
                    if (auxPosJ != -1) {
                      diferenciaVar = Number(auxValorHSMaximo - auxHistorialCopy[auxPosJ].valorHS);
                    } else {
                      diferenciaVar = auxValorHSMaximo;
                    }
                    break;
                  case 2://Dias
                  case 3://Meses
                  case 4://Anios  
                    if (auxPosJ != -1) {
                      fechaHisto = auxHistorialCopy[auxPosJ].fechaFinalizacion.split("-");
                    } else fechaHisto = this.historialesMaquinarias[indiceHistorialM].fechaIncorporacionBM.split("-");
                    diferenciaVar = Math.round(this.compararFechas(fechaHisto, fechaU));
                    if (this.selectPlanM.listIntervalo[i].listEventoMediciones[j].medicionId == 3)
                      diferenciaVar = Math.round(diferenciaVar / 30.4);
                    if (this.selectPlanM.listIntervalo[i].listEventoMediciones[j].medicionId == 4)
                      diferenciaVar = Math.round(diferenciaVar / 365);
                    break;
                }
                var posAlerta = this.algoritmoRegla3Alarma(diferenciaVar, valorLimite);//segun la alerta roja o amarilla
                if (posAlerta == 0 || posAlerta == 1) {
                  var fechaEvento = fechaU[0] + "-" + fechaU[1] + "-" + fechaU[2]
                  if (posAlerta == 0)
                    mensaje = "(Urg.) " + this.selectPlanM.listIntervalo[i].listTareas[k].tarea.nombre;
                  else
                    mensaje = this.selectPlanM.listIntervalo[i].listTareas[k].tarea.nombre;
                  event = { id: "p-" + Rc + "-" + j + "-" + i + "-" + k + "-" + indiceHistorialM, title: mensaje, start: fechaEvento, color: '#FFFF50' };

                  $('#calendar').fullCalendar('renderEvent', event, true);
                  var posHR = -1;
                  for (var Hr = 0; Hr < auxHistorialCopy.length; Hr++) {
                    if (auxHistorialCopy[Hr].intervaloId == this.selectPlanM.listIntervalo[i].idIntervaloM && auxHistorialCopy[Hr].tareaMId == this.selectPlanM.listIntervalo[i].listTareas[k].tareaId) {
                      posHR = Hr;
                    }
                  }
                  if (posHR != -1) {//actualiza el historial para esa tarea
                    auxHistorialCopy[posHR].fechaFinalizacion = fechaU[0] + "-" + fechaU[1] + "-" + fechaU[2];
                    auxHistorialCopy[posHR].valorHS = auxValorHSMaximo;
                  } else {//se crea un nuevo historial de esa tarea
                    var auxHistorialP: cHistorialProyeccion = {
                      intervaloId: this.selectPlanM.listIntervalo[i].idIntervaloM,
                      tareaMId: this.selectPlanM.listIntervalo[i].listTareas[k].tareaId,
                      fechaFinalizacion: fechaU[0] + "-" + fechaU[1] + "-" + fechaU[2],
                      valorHS: auxValorHSMaximo,
                    }
                    auxHistorialCopy.push(auxHistorialP);
                  }
                }
              }
            }
          }
        }
        fechaAnterior = fechaU;
        if (nP != this.inputProyeccion) {
          var auxStrMes: string = Number(fechaU[1]).toString();
          var auxStrDia = (Number(fechaU[2]) + interDiaDiferencia).toString();
          auxDiferenciaDias = interDiaDiferencia;
          if (Number(auxStrMes) < 10) {
            auxStrMes = "0" + auxStrMes;
          }
          if (Number(auxStrDia) < 10) {
            auxStrDia = "0" + auxStrDia;
          }
          strAuxFecha = fechaU[0] + "-" + auxStrMes + "-" + auxStrDia;
          fechaU = strAuxFecha.split("-");
        }
      }
      if (fechaU[1] == '12') {//te cambia de anio
        strAuxFecha = Number(Number(fechaU[0]) + 1) + "-01-01";
      } else {
        var auxStrMes = (Number(fechaU[1]) + 1).toString();
        if ((Number(fechaU[1]) + 1) < 10)
          auxStrMes = "0" + auxStrMes;
        strAuxFecha = fechaU[0] + "-" + auxStrMes + "-01";
      }
      fechaU = strAuxFecha.split("-");//la nueva fecha
    }
  }*/

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

  //Listo
  algoritmoRegla3Alarma(diferenciaD:number, limiteEV:number) {
    var porcentaje: number;
    porcentaje = Number((diferenciaD * 100) / limiteEV);
    for (var i = 0; i < this.listAlertasIn.length; i++) {
      if (this.listAlertasIn[i].rangoInicio <= porcentaje && porcentaje <= this.listAlertasIn[i].rangoFin) {
        return i;
      }
    }
    return 3;
  }

  //Cambio
  updateProyeccion() {
    this.onOffCalendar = true;
    //this.onPrepararCalendarioG();
  }
  //Listo
  limiteFechaHasta() {
    this.onOffCalendar = false;
    var fecha1 = this.strFecha.split("-");
    var fecha2 = this.strFechaHasta.split("-");
    if (fecha1[1] > fecha2[1] && fecha1[0] == fecha2[0]) {
      fecha2[1] = fecha1[1];
      this.strFechaHasta = fecha2[0] + "-" + fecha2[1] + "-" + fecha2[2]
    }
    if (fecha1[2] > fecha2[2] && fecha1[0] == fecha2[0] && fecha1[1] == fecha2[1]) {
      fecha2[2] = fecha1[2];
      this.strFechaHasta = fecha2[0] + "-" + fecha2[1] + "-" + fecha2[2]
    }
  }
}
