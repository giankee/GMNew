import { Component, OnInit } from '@angular/core';
import { OrdenTrabajoService } from 'src/app/shared/ordenTrabajo/orden-trabajoB.service';
import { MedicionService } from 'src/app/shared/mantenimiento/medicion.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { cTareaO, cAccionO, cOrdenTrabajoB, cHistorialBM, cHistorialTaOrden } from 'src/app/shared/ordenTrabajo/cOrdenModel.model';
import { BarcoService } from 'src/app/shared/barco.service';
import { cBarco, cBarcoMaquinarias } from 'src/app/shared/barco.model';
import { cIntervalo, cTarea, cAccion, cIntervaloTarea } from 'src/app/shared/mantenimiento/cManModel.model';
import { PlanMantenimientoService } from 'src/app/shared/mantenimiento/plan-mantenimiento.service';
import { IntervaloService } from 'src/app/shared/mantenimiento/intervalo.service';
import { TareaService } from 'src/app/shared/mantenimiento/tarea.service';
import { AccionService } from 'src/app/shared/mantenimiento/accion.service';
import { BarcoMaquinariasService } from 'src/app/shared/barco-maquinarias.service';
import { HistorialService } from 'src/app/shared/ordenTrabajo/historial.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { AlertaService } from 'src/app/shared/otrosServices/alerta.service';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { OrdenTrabajoOldComponent } from '../orden-trabajo-old/orden-trabajo-old.component';
import { cAlerta, cWhatsapp } from 'src/app/shared/basicos';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';

@Component({
  selector: 'app-orden-trabajo-nuevo',
  templateUrl: './orden-trabajo-nuevo.component.html',
  styles: []
})
export class OrdenTrabajoNuevoComponent implements OnInit {


  flagAdicion: boolean = false;
  tareaNewFiltro: cTarea[] = [];
  listAccionIn: cAccion[];
  okAddTA: boolean = true;

  okProcesarOrden: boolean = true;

  okGuardado: boolean = false;
  okAyuda: boolean = false;

  numOrdenSiguiente: number;
  internetStatus: string = 'nline';
  strFecha: string;

  listAlertasIn: cAlerta[];
  listBarcoIn: cBarco[] = [];
  listBarcoMaquinaria: cBarcoMaquinarias[];
  barcoMaquinariaSelected: cBarcoMaquinarias = null;

  listIntervalosIn: cIntervalo[] = [];
  listIntervalosCopy: cIntervalo[] = [];
  listTareasAdicionales: cTareaO[] = [];

  listOrdenesNewAntiguas: cOrdenTrabajoB[] = [];

  ordenTCopy: cOrdenTrabajoB;

  nombreBarcoSelected: string;

  newHistorialIn: cHistorialBM[];

  constructor(public ordenTrabajoService: OrdenTrabajoService, public barcoService: BarcoService, public medicionServicie: MedicionService,
    public planMantenimientoService: PlanMantenimientoService, public intervaloService: IntervaloService, private mConexionService: MenuConexionService,
    public tareaService: TareaService, public accionService: AccionService, public barcoMaquinariaService: BarcoMaquinariasService,
    public alertaService: AlertaService, public historialService: HistorialService, public whatsappService: WhatsappService,
    private router: Router, private toastr: ToastrService, private activatedRoute: ActivatedRoute, private dialog: MatDialog,) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.accionService.msg$.subscribe(mensajeA => {
      this.listAccionIn.push(mensajeA);
      this.toastr.success('Ingreso satisfactorio', 'Registro de Acción');
    });
    this.tareaService.msg$.subscribe(mensajeT => {
      this.tareaNewFiltro.push(mensajeT);
      this.tareaNewFiltro[this.tareaNewFiltro.length - 1].ocultarSelect = false;
      this.toastr.success('Ingreso satisfactorio', 'Registro de Tarea');
    });

    this.fechaActual();
    this.cargarDataAlerta();
    this.activatedRoute.params.subscribe(params => {
      if (params["id"] != undefined) {
        this.numOrdenSiguiente = Number(params["id"]) + 1;
        this.resetForm();
        this.cargarDataBarco();
      }
    })

    this.historialService.msg$.subscribe(mensajeH => {
      this.onUpdateHistorial(mensajeH);
    });
  }

  //Listo
  cargarDataBarco() {
    this.barcoService.getBarcosMaquinarias()
      .subscribe(plan => {
        this.listBarcoIn = plan;
      },
        error => console.error(error));
  }

  //Listo
  cargarDataAlerta() {
    this.alertaService.getAlertas().subscribe(alerta => {
      alerta.sort((a, b) => b.rangoFin - a.rangoFin);
      this.listAlertasIn = alerta;
    },
      error => console.error(error));
  }

  //listo
  cargarDataTareas_Acciones() {
    this.tareaService.getTareas().subscribe(list => {
      this.tareaNewFiltro = this.filtroNewTareas(list);
    }, error => console.error(error)
    );
    this.accionService.getAcciones().subscribe(list => this.listAccionIn = list,
      error => console.error(error));

    this.flagAdicion = true;
  }

  //listo
  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.ordenTrabajoService.formData = {
      titulo: "",
      tipoMantenimiento: null,
      barcoMaquinariaId: null,
      valorHS: null,
      fechaIngreso: this.strFecha,
      fechaFinalizacion: null,
      responsable: "CARLOS REZABALA",
      supervisor: "MARK SIMON",
      descripcionSolicitud: "",
      estadoProceso: "En Proceso",
      marea: null,
      listTareaO: [],

      barcoSelected: null
    }
    this.ordenTCopy = JSON.parse(JSON.stringify(this.ordenTrabajoService.formData));
  }

  //Listo
  updateSelectBarco(control:any) {
    this.barcoMaquinariaSelected = null;
    this.ordenTrabajoService.formData.barcoMaquinariaId = null;
    this.listBarcoMaquinaria = this.listBarcoIn[control.selectedIndex - 1].listBarcoMaquinarias;
    this.nombreBarcoSelected = this.listBarcoIn[control.selectedIndex - 1].nombre;//no me convencen del todo el nombre del barco
  }
  //Listo
  updateSelectMaquinaria(control:any) {
    this.ordenTrabajoService.formData.valorHS = null;
    this.barcoMaquinariaSelected = this.listBarcoMaquinaria[control.selectedIndex - 1];
    this.historialService.getHistorialBMVigente(this.barcoMaquinariaSelected.idBarcoMaquinaria + "@" + this.barcoMaquinariaSelected.fechaIncorporacionB).subscribe(
      (historial: any) => {
        if (!historial.message)
          this.barcoMaquinariaSelected.listHistorialBM = historial;
      },
      err => console.log(err)
    );

  }

  //Listo
  updateHT() {
    if (this.ordenTrabajoService.formData.valorHS != null) {
      if (this.ordenTrabajoService.formData.valorHS < 0) {
        this.ordenTrabajoService.formData.valorHS = null;
      }
      if (this.ordenTrabajoService.formData.valorHS < this.barcoMaquinariaSelected.horasServicio && this.ordenTrabajoService.formData.tipoMantenimiento == "VEDA") {
        this.ordenTrabajoService.formData.valorHS = this.barcoMaquinariaSelected.horasServicio;
      }
    }
  }

  //Listo
  onSubmit(form:NgForm) {
    if (this.internetStatus == "nline") {
      let strparametros = this.barcoMaquinariaSelected.idBarcoMaquinaria + "@" + this.ordenTrabajoService.formData.fechaIngreso;
      this.ordenTrabajoService.getBuscarOrdenPre(strparametros).subscribe(
        (pendiente: any) => {
          if (pendiente.message == "No Pendientes")
            this.planMantenimientoService.getPlanMantenimientoOrden(this.barcoMaquinariaSelected.maquinaria.planMantenimientoId).subscribe(plan => {
              this.onProcesarHistorial(plan.listIntervalo);
            },
              error => console.error(error));
          else {
            var textoBase = "pendientes, la ultrima registrada es del " + pendiente.fechaInicio.substr(0, 10);
            if (pendiente.message == "Ordenes Creadas")
              textoBase = "creadas con fechas mas actuales " + pendiente.fechaInicio.substr(0, 10);
            Swal.fire({
              title: 'Está seguro?',
              text: "Desea crear una nueva orden de trabajo de la maquinaria seleccionada, existen ordenes de trabajo " + textoBase,
              icon: 'warning',
              showCancelButton: true,
              cancelButtonColor: '#E53935',
              confirmButtonText: 'Continuar!',
              cancelButtonText: 'Cancelar',
              customClass: {
                confirmButton: 'btn btn-info mr-2',
                cancelButton: 'btn btn-danger ml-2'
              },
              buttonsStyling: false
            }).then((result) => {
              if (result.value) {
                this.planMantenimientoService.getPlanMantenimientoOrden(this.barcoMaquinariaSelected.maquinaria.planMantenimientoId).subscribe(plan => {
                  this.onProcesarHistorial(plan.listIntervalo);
                },
                  error => console.error(error));
              }
            })
          }
        }, err => {
          if (err.status == 404) {
            this.planMantenimientoService.getPlanMantenimientoOrden(this.barcoMaquinariaSelected.maquinaria.planMantenimientoId).subscribe(plan => {
              this.onProcesarHistorial(plan.listIntervalo);
            },
              error => console.error(error));
          }
          else
            console.log(err);
        }
      );

    } else {
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info mr-2'
        },
        buttonsStyling: false
      })
    }
  }

  //Listo
  onProcesarHistorial(listInter: cIntervalo[]) {
    this.listIntervalosIn = listInter;
    var existeHistorial = false;
    if (this.barcoMaquinariaSelected.listHistorialBM != null)
      existeHistorial = true;;
    for (var i = 0; i < this.listIntervalosIn.length; i++) {
      this.recorrerIntervaloTarea(this.listIntervalosIn[i], existeHistorial);
    }
    this.listIntervalosCopy = JSON.parse(JSON.stringify(this.listIntervalosIn));
  }

  //Listo
  recorrerIntervaloTarea(inter: cIntervalo, existeHistorial: boolean) {
    var fechaHisto;
    var valorLimite;
    var difDia;
    inter.estadoActivado = false;
    for (var i = 0; i < inter.listTareas.length; i++) {
      inter.listTareas[i].estadoActivado = false;
      inter.listTareas[i].advertencia = false;
      inter.listTareas[i].intervaloId = inter.idIntervaloM;//para la modal antigua

      var diferenciaV = false;//valor por defecto que existe historial pero no se sabe si existe coincidencia
      var auxPosLH:number|string = null;//tengo q cambiar
      var auxPosHO = null;
      var auxResultado;
      if (existeHistorial) {
        if (this.barcoMaquinariaSelected.listHistorialBM.findIndex(x => x.tareaMId == inter.listTareas[i].tareaId) != undefined) {
          auxResultado = this.buscarUltimaOrden(inter.listTareas[i]);
          if (auxResultado != '-1') {
            let auxResultadoSplit = auxResultado.split('-');
            auxPosLH = auxResultadoSplit[0];
            auxPosHO = auxResultadoSplit[1];
            diferenciaV = true; //valor si es que existe historial y encuentra coincidencia
          }
        }
      }

      for (var a = 0; a < inter.listEventoMediciones.length; a++) {
        var posAlerta = this.listAlertasIn.length - 1;//color ultimo
        if (inter.listEventoMediciones[a].eventoId != 1) {
          valorLimite = inter.listEventoMediciones[a].valor;

          if (inter.listEventoMediciones[a].medicionId == 1) {//Horas de servicio
            var diferenciaHS;
            if (diferenciaV) {
              if (inter.listEventoMediciones[a].evento.isOne)
                posAlerta = 3;//color verde
              else {
                diferenciaHS = Number(this.ordenTrabajoService.formData.valorHS - this.barcoMaquinariaSelected.listHistorialBM[Number(auxPosLH)].listHistoTaOrdenes[Number(auxPosHO)].ordenT.valorHS);
                posAlerta = this.algoritmoRegla3Alarma(diferenciaHS, valorLimite);
              }
            }
            else {
              if(this.barcoMaquinariaSelected.estado!=1){
                inter.listTareas[i].advertencia = true;
              }
              if (existeHistorial)
                diferenciaHS = this.ordenTrabajoService.formData.valorHS;
              else {
                if (inter.listEventoMediciones[a].evento.isOne) {
                  if (this.ordenTrabajoService.formData.valorHS > valorLimite)
                    diferenciaHS = this.ordenTrabajoService.formData.valorHS;
                } else diferenciaHS = this.ordenTrabajoService.formData.valorHS - this.barcoMaquinariaSelected.horasServicio;
              }
              posAlerta = this.algoritmoRegla3Alarma(diferenciaHS, valorLimite);
            }
          }
          if (inter.listEventoMediciones[a].medicionId != 1 && inter.listEventoMediciones[a].medicionId != 7) {
            if (inter.listEventoMediciones[a].medicionId == 3)//meses
              valorLimite = valorLimite * 30.4;
            if (inter.listEventoMediciones[a].medicionId == 4)//años
              valorLimite = valorLimite * 365;
            if (diferenciaV) {
              if (inter.listEventoMediciones[a].evento.isOne)
                posAlerta = 3;
              else {
                fechaHisto = this.barcoMaquinariaSelected.listHistorialBM[Number(auxPosLH)].listHistoTaOrdenes[Number(auxPosHO)].ordenT.fechaFinalizacion.split("-");
                difDia = this.compararFechas(fechaHisto, this.ordenTrabajoService.formData.fechaIngreso);
                var posAlerta = this.algoritmoRegla3Alarma(difDia, valorLimite);
              }
            } else {
              if(this.barcoMaquinariaSelected.estado!=1){
                inter.listTareas[i].advertencia = true;
              }
              fechaHisto = this.barcoMaquinariaSelected.fechaIncorporacionB.split("-");
              difDia = this.compararFechas(fechaHisto, this.ordenTrabajoService.formData.fechaIngreso);
              var posAlerta = this.algoritmoRegla3Alarma(difDia, valorLimite);
            }
          }
        }
        this.cambioPrioridad(inter.listTareas[i], posAlerta);
      }
      if (inter.listTareas[i].listTareaAccion.length == 1)
        inter.listTareas[i].listTareaAccion[0].disabledA = true;
    }
    if (inter.listTareas.find(x => x.estadoActivado == false) == undefined)
      inter.estadoActivado = true;
  }

  //Listo
  onIntermediateCheack(posInter: number, btn?: number) {
    if (btn != undefined) {//btn op
      for (var i = 0; i < this.listIntervalosIn[posInter].listTareas.length; i++) {
        this.listIntervalosIn[posInter].listTareas[i].estadoActivado = this.listIntervalosIn[posInter].estadoActivado;
        if (this.listIntervalosIn[posInter].listTareas[i].disabledSelectTA)
          this.listIntervalosIn[posInter].listTareas[i].estadoActivado = true;
      }
    }
    if (this.listIntervalosIn[posInter].listTareas.find(x => x.estadoActivado == false) != undefined)
      this.listIntervalosIn[posInter].estadoActivado = false;
    else this.listIntervalosIn[posInter].estadoActivado = true;
    this.comprobarTcheck();
  }

  //Puede ser
  onProcesarOrden() {
    var auxTareO: cTareaO;
    var auxAccionO: cAccionO;
    var listAccionO: cAccionO[];
    var listGTareo: cTareaO[] = [];
    var auxStrIntervaloId: string = "";
    if (this.comprobarTA() && this.comprobarTcheck()) {
      for (var i = 0; i < this.listIntervalosIn.length; i++) {
        for (var j = 0; j < this.listIntervalosIn[i].listTareas.length; j++) {
          if (this.listIntervalosIn[i].listTareas[j].estadoActivado == true) {
            listAccionO = [];
            for (var k = 0; k < this.listIntervalosIn[i].listTareas[j].listTareaAccion.length; k++) {
              if (this.listIntervalosIn[i].listTareas[j].listTareaAccion[k].estadoActivado == true) {
                auxStrIntervaloId = this.listIntervalosIn[i].idIntervaloM.toString();
                auxAccionO = {
                  accionId: this.listIntervalosIn[i].listTareas[j].listTareaAccion[k].accionId,
                  nombreAccionM: this.listIntervalosIn[i].listTareas[j].listTareaAccion[k].accion.nombre,
                  estadoRealizado: false,
                  strIntervalos: auxStrIntervaloId
                }
                listAccionO.push(auxAccionO);
              }
            }
            if (listAccionO.length > 0) {
              auxTareO = {
                tareaMId: this.listIntervalosIn[i].listTareas[j].tareaId,
                observacion: null,
                reponsableTarea: null,
                estadoRealizado: false,
                listAccionesRealizadaO: listAccionO,
                notificacionId: null
              }
              listGTareo.push(auxTareO);
            }
          }
        }
      }
      var auxNombres = [];
      for (var i = 0; i < this.listTareasAdicionales.length; i++) {
        auxNombres = [];
        for (var j = 0; j < this.listTareasAdicionales[i].listAccionesRealizadaO.length; j++) {
          auxNombres.push(this.listTareasAdicionales[i].listAccionesRealizadaO[j]);
        }
        this.listTareasAdicionales[i].listAccionesRealizadaO = [];
        for (var k = 0; k < auxNombres.length; k++) {
          for (var l = 0; l < this.listAccionIn.length; l++) {
            if (auxNombres[k] === this.listAccionIn[l].nombre) {
              auxAccionO = {
                accionId: Number(this.listAccionIn[l].idAccionM),
                nombreAccionM: this.listAccionIn[l].nombre,
                estadoRealizado: false,
                strIntervalos: "new"
              }
              this.listTareasAdicionales[i].listAccionesRealizadaO.push(auxAccionO);
            }
          }
        }
        listGTareo.push(this.listTareasAdicionales[i]);
      }
      if (listGTareo.length > 0) {
        listGTareo.sort((a, b) => a.tareaMId - b.tareaMId);
        this.agruparTareas(listGTareo);
        this.ordenTrabajoService.formData.listTareaO = listGTareo;
        this.ordenTrabajoService.formData.titulo = "Orden_" + this.nombreBarcoSelected + "_" + this.barcoMaquinariaSelected.nombre + this.strFecha;
        this.ordenTrabajoService.insertarOrden(this.ordenTrabajoService.formData).subscribe(
          resOrden => {
            if (this.ordenTrabajoService.formData.valorHS > this.barcoMaquinariaSelected.horasServicio) {
              var auxBarcoM: cBarcoMaquinarias
              auxBarcoM = {
                idBarcoMaquinaria: this.barcoMaquinariaSelected.idBarcoMaquinaria,
                horasServicio: this.ordenTrabajoService.formData.valorHS
              }
              this.barcoMaquinariaService.actualizarBMOrden(auxBarcoM).subscribe(
                (res: any) => {
                  this.onSaveSuccess(resOrden.idOrdenT);
                },
                err => {
                  console.log(err);
                }
              )
            } else this.onSaveSuccess(resOrden.idOrdenT);
          },
          err => {
            console.log(err);
          }
        )

      }
      else this.okProcesarOrden = false;

    }
  }

  //Listo
  onChangeAcccion(indiceIntervalo:number, indiceITarea:number) {
    var cont = 0;
    var posActivado;
    for (var i = 0; i < this.listIntervalosIn[indiceIntervalo].listTareas[indiceITarea].listTareaAccion.length; i++) {
      if (this.listIntervalosIn[indiceIntervalo].listTareas[indiceITarea].listTareaAccion[i].estadoActivado == true) {
        cont++;
        posActivado = i;
        this.listIntervalosIn[indiceIntervalo].listTareas[indiceITarea].listTareaAccion[i].disabledA = false;
      }
    }
    if (cont == 1) {
      this.listIntervalosIn[indiceIntervalo].listTareas[indiceITarea].listTareaAccion[posActivado].disabledA = true;
    }
  }

  //listo
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
  //Listo
  compararFechas(fechaHistorial:any[], fechaObservar:any) {//Retorna la diferencia de dias
    var fechaActual: any = fechaObservar.split("-");//puede ser de hoy o de otra fecha
    var diferenciaAnio;
    var diferenciaMes;
    var diferenciaDia;
    diferenciaAnio = Number(fechaActual[0] - Number(fechaHistorial[0]));
    if (fechaActual[1] >= fechaHistorial[1]) {
      diferenciaMes = Number(fechaActual[1] - Number(fechaHistorial[1]));
      diferenciaMes = Number((diferenciaAnio * 12) + diferenciaMes);
    }
    else {
      diferenciaMes = Number(fechaHistorial[1] - Number(fechaActual[1]));
      diferenciaMes = Number((diferenciaAnio * 12) - diferenciaMes);
    }
    if (fechaActual[2] >= fechaHistorial[2]) {
      diferenciaDia = Number(fechaActual[2] - Number(fechaHistorial[2]));
      diferenciaDia = Number((diferenciaMes * 30.4) + diferenciaDia);
    }
    else {
      diferenciaDia = Number(fechaHistorial[2] - Number(fechaActual[2]));
      diferenciaDia = Number((diferenciaMes * 30.4) - diferenciaDia);
    }
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
    return (this.listAlertasIn.length - 1);
  }

  //Listo
  cambioPrioridad(listIT: cIntervaloTarea, posAlerta: number) {
    if (listIT.prioridadAlerta != null) {
      if (listIT.prioridadAlerta > this.listAlertasIn[posAlerta].nivelPrioridad) {
        listIT.colorAlerta = this.listAlertasIn[posAlerta].color;
        listIT.prioridadAlerta = this.listAlertasIn[posAlerta].nivelPrioridad;
      }
    } else {
      listIT.colorAlerta = this.listAlertasIn[posAlerta].color;
      listIT.prioridadAlerta = this.listAlertasIn[posAlerta].nivelPrioridad;
    }
    switch (listIT.prioridadAlerta) {
      case 1://rojo
        listIT.estadoActivado = true;
        listIT.disabledSelectTA = true;
        break;
      case 2://amarillo o anaranjado
        listIT.estadoActivado = true;
        listIT.disabledSelectTA = false;
        break;
      case 3://el resto
        listIT.estadoActivado = false;
        listIT.disabledSelectTA = false;
        break;
    }
    if (listIT.advertencia) {
      listIT.disabledSelectTA = false;
    }
  }

  //listo
  onSaveSuccess(idOrdenT:number) {
    this.okGuardado = true;
    this.router.navigate(["/ordenTrabajo/ver/" + idOrdenT]);
  }

  //Listo
  onAddTareas() {
    if (!this.flagAdicion) {
      this.cargarDataTareas_Acciones();
    }
    if (this.comprobarTA() || this.listTareasAdicionales.length == 0) {
      var auxTareaO: cTareaO;
      auxTareaO = {
        tareaMId: null,
        observacion: null,
        reponsableTarea: null,
        estadoRealizado: false,
        notificacionId: null,
        disabledSelectTA: true,
        listAccionesRealizadaO: []
      }
      this.listTareasAdicionales.push(auxTareaO);
    }
  }

  //Listo
  comprobarTcheck():boolean {//true is OK
    var flag:boolean = false;
    for (var i = 0; i < this.listIntervalosIn.length; i++) {
      if (this.listIntervalosIn[i].listTareas.find(x => x.estadoActivado == true))
        flag = true;
    }
    this.okProcesarOrden = flag;
    if (this.listTareasAdicionales.length > 0 && !flag)
      flag = this.comprobarTA();
    return flag;
  }

  //Listo
  comprobarTA():boolean {//true is OK
    var flag:boolean = true;
    this.okAddTA = true;
    if (this.listTareasAdicionales.length == 0)
      return (this.comprobarTcheck());
    else {
      for (var i = 0; i < this.listTareasAdicionales.length; i++) {
        if ((this.listTareasAdicionales[i].tareaMId == null || this.listTareasAdicionales[i].listAccionesRealizadaO == null || this.listTareasAdicionales[i].listAccionesRealizadaO.length == 0)) {
          flag = false;
          this.okAddTA = false;
        }
      }
      this.okProcesarOrden = flag;
      return (flag);
    }
  }

  //Listo
  filtroNewTareas(list: cTarea[]) {
    for (var i = 0; i < list.length; i++) {
      list[i].ocultarSelect = false;
    }
    return list;
  }

  //Listo
  updateSelectTarea(indice:number, control:any) {
    this.listTareasAdicionales[indice].tareaMId = Number(this.listTareasAdicionales[indice].tareaMId);
    this.listTareasAdicionales[indice].listAccionesRealizadaO = null;
    this.listTareasAdicionales[indice].disabledSelectTA = false;
    this.tareaNewFiltro[control.selectedIndex - 1].ocultarSelect = true;
    this.comprobarSelectTarea();
  }

  //Listo
  comprobarSelectTarea() {
    for (var i = 0; i < this.tareaNewFiltro.length; i++) {
      if (this.tareaNewFiltro[i].ocultarSelect) {
        if (this.listTareasAdicionales.find(x => x.tareaMId == this.tareaNewFiltro[i].idTareaM) == undefined)
          this.tareaNewFiltro[i].ocultarSelect = false;
      }
    }
  }

  //Listo
  onRemoveNewTA(indice:number) {
    var auxTA: cTareaO[] = [];
    this.listTareasAdicionales.splice(indice, 1);
    auxTA = JSON.parse(JSON.stringify(this.listTareasAdicionales));
    this.listTareasAdicionales = [];
    this.listTareasAdicionales = JSON.parse(JSON.stringify(auxTA));
    this.comprobarSelectTarea();
    this.comprobarTA();
  }

  //Medio tal vez desaparesca 
  cancelarTA() {
    this.listTareasAdicionales = [];
    this.okAddTA = true;
    this.okProcesarOrden = true;

    this.filtroNewTareas(this.tareaNewFiltro);
    this.listIntervalosIn = JSON.parse(JSON.stringify(this.listIntervalosCopy));
  }

  //Listo
  agruparTareas(list: cTareaO[]) {
    for (var i = 0; i < list.length - 1; i++) {
      for (var j = i + 1; j < list.length; j++) {
        if (list[i].tareaMId == list[j].tareaMId) {
          for (var k = 0; k < list[j].listAccionesRealizadaO.length; k++) {
            var flagRepetido = false;
            for (var l = 0; l < list[i].listAccionesRealizadaO.length; l++) {
              if (list[j].listAccionesRealizadaO[k].accionId == list[i].listAccionesRealizadaO[l].accionId) {
                flagRepetido = true;
                list[i].listAccionesRealizadaO[l].strIntervalos = list[i].listAccionesRealizadaO[l].strIntervalos + "-" + list[j].listAccionesRealizadaO[k].strIntervalos
              }
            }
            if (!flagRepetido) {
              list[i].listAccionesRealizadaO.push(list[j].listAccionesRealizadaO[k]);
            }
          }
          list.splice(j, 1);
          j--;
        }
      }
    }
  }

  //Puede ser revisar la modal
  onAlertaTarea(indiceIntervalo:number, indiceTarea:number) {
    if (this.internetStatus == "nline") {
      var intervaloTarea = this.listIntervalosIn[indiceIntervalo].listTareas[indiceTarea];
      var idBarcoMaquinaria: number = this.ordenTrabajoService.formData.barcoMaquinariaId;
      var barcoData: string = this.nombreBarcoSelected;
      var periodoVigenteM: string = this.barcoMaquinariaSelected.fechaIncorporacionB;
      const dialoConfig = new MatDialogConfig();
      dialoConfig.autoFocus = true;
      dialoConfig.disableClose = true;
      dialoConfig.data = { idBarcoMaquinaria, intervaloTarea, barcoData, periodoVigenteM }
      this.dialog.open(OrdenTrabajoOldComponent, dialoConfig)
    } else {
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info mr-2'
        },
        buttonsStyling: false
      })
    }
  }

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (JSON.stringify(this.ordenTrabajoService.formData) == JSON.stringify(this.ordenTCopy)) {
      return true;
    }
    if (this.internetStatus == "nline" && this.okGuardado == false) {
      const confirmacion = window.confirm('¿Quieres salir del formulario y perder los cambios realizados?');
      return confirmacion;
    }
    if (this.internetStatus == "ffline") {
      const confirmacion = window.confirm('No ahi conexión de Internet, ¿Desea salir de todas formas? No se guardaran los cambios!');
      return confirmacion;
    }
    return true;
  }

  //Listo
  buscarUltimaOrden(interTarea: cIntervaloTarea) {
    var auxHistorialI: cHistorialBM;
    var auxHistorialNull: cHistorialBM;
    var valoresI;
    var valoresNull: string[];
    var strResultado = '-1';
    var posHistorialI = this.barcoMaquinariaSelected.listHistorialBM.findIndex(x => x.tareaMId == interTarea.tareaId && x.intervaloId == interTarea.intervaloId);
    var posHistorialNull = this.barcoMaquinariaSelected.listHistorialBM.findIndex(x => x.tareaMId == interTarea.tareaId && x.intervaloId == null);



    if (posHistorialI != -1 && posHistorialNull == -1) {
      auxHistorialI = this.barcoMaquinariaSelected.listHistorialBM[posHistorialI];
      valoresI = this.obtenerOrdenActual(auxHistorialI.listHistoTaOrdenes).split('D');
      strResultado = posHistorialI + "-" + valoresI[0];
      return (strResultado);
    }
    if (posHistorialNull != -1) {
      auxHistorialNull = this.barcoMaquinariaSelected.listHistorialBM[posHistorialNull];
      var arrayAcciones: string | any[];
      var auxValidaTO;
      var arrayHTordenes: cHistorialTaOrden[] = []
      for (var i = 0; i < auxHistorialNull.listHistoTaOrdenes.length; i++) {
        arrayAcciones = [];
        arrayAcciones = auxHistorialNull.listHistoTaOrdenes[i].listAcciones.split('-');
        auxValidaTO = false;
        for (var j = 0; j < arrayAcciones.length; j++) {
          if (interTarea.listTareaAccion.find(x => x.accionId == arrayAcciones[j]) != undefined)
            auxValidaTO = true;
        }
        if (auxValidaTO) {
          arrayHTordenes.push(auxHistorialNull.listHistoTaOrdenes[i])
        }
      }
      if (arrayHTordenes.length > 0) {
        valoresNull = this.obtenerOrdenActual(arrayHTordenes).split('D');
        valoresNull[0] = auxHistorialNull.listHistoTaOrdenes.findIndex(x => x.idHistorialTaOrden == arrayHTordenes[Number(valoresNull[0])].idHistorialTaOrden).toString();
        if (posHistorialI != -1) {
          valoresI = this.obtenerOrdenActual(this.barcoMaquinariaSelected.listHistorialBM[posHistorialI].listHistoTaOrdenes).split('D');
          if (Number(valoresI[1]) <= Number(valoresNull[1])) {
            strResultado = posHistorialI + "-" + valoresI[0];
            return (strResultado);
          }
        }
        strResultado = posHistorialNull + "-" + valoresNull[0];
        return (strResultado);
      } else {
        if (posHistorialI != -1) {
          valoresI = this.obtenerOrdenActual(this.barcoMaquinariaSelected.listHistorialBM[posHistorialI].listHistoTaOrdenes).split('D');
          strResultado = posHistorialI + "-" + valoresI[0];
          return (strResultado);
        }
      }
    }
    return (strResultado);
  }

  //Listo
  obtenerOrdenActual(listTOrden: cHistorialTaOrden[]) {
    var posOrdenMayorDefecto = 0;
    let auxF = listTOrden[0].ordenT.fechaFinalizacion.split("-");
    var DiaMenor = this.compararFechas(auxF, this.strFecha);
    var DiaFor;
    if (listTOrden.length > 1) {
      for (var i = 1; i < listTOrden.length; i++) {
        auxF = listTOrden[i].ordenT.fechaFinalizacion.split("-");
        DiaFor = this.compararFechas(auxF, this.strFecha);
        if (DiaFor < DiaMenor) {
          posOrdenMayorDefecto = i;
          DiaMenor = DiaFor;
        }
      }
    }
    return (posOrdenMayorDefecto + "D" + DiaMenor);
  }

  onUpdateHistorial(histo: cHistorialBM) {
    var fechaHisto;
    var valorLimite;
    var difDia;
    var ayuda: cIntervalo = this.listIntervalosIn.find(x => x.idIntervaloM == histo.intervaloId);
    for (var i = 0; i < ayuda.listTareas.length; i++) {
      if (ayuda.listTareas[i].tareaId == histo.tareaMId) {
        ayuda.listTareas[i].estadoActivado = false;
        ayuda.listTareas[i].advertencia = false;
        ayuda.listTareas[i].prioridadAlerta = null;
        for (var a = 0; a < ayuda.listEventoMediciones.length; a++) {
          valorLimite = ayuda.listEventoMediciones[a].valor;
          var posAlerta = this.listAlertasIn.length - 1;//color ultimo
          switch (ayuda.listEventoMediciones[a].medicionId) {
            case 1://horas servicio 
              var diferenciaHS;
              if (ayuda.listEventoMediciones[a].evento.isOne == true)
                posAlerta = 3;
              else {
                diferenciaHS = Number(this.ordenTrabajoService.formData.valorHS - histo.listHistoTaOrdenes[0].ordenT.valorHS);
                posAlerta = this.algoritmoRegla3Alarma(diferenciaHS, valorLimite);
              }
              break;
            case 2://dias 
            case 3://meses
            case 4://anios
            case 7://sin espcificar
              if (ayuda.listEventoMediciones[a].medicionId == 3)
                valorLimite = valorLimite * 30.4;
              if (ayuda.listEventoMediciones[a].medicionId == 4)
                valorLimite = valorLimite * 365;
              if (ayuda.listEventoMediciones[a].evento.isOne == true)
                posAlerta = 3;
              else {
                fechaHisto = histo.listHistoTaOrdenes[0].ordenT.fechaFinalizacion.split("-");
                difDia = this.compararFechas(fechaHisto, this.ordenTrabajoService.formData.fechaIngreso);
                var posAlerta = this.algoritmoRegla3Alarma(difDia, valorLimite);
              }
              break;
          }
          this.cambioPrioridad(ayuda.listTareas[i], posAlerta);
        }
      }
    }
  }


  /*  buscarContact(){
      var aux: cWhatsapp;
      aux = {
        phone: "593988964391",
        message: ":100: hola 4 mi :smile: :exclamation: :exclamation:  \nLinea uno \nLinea dos, para revisar :joy:"
      }
      aux.phone= "593984958499";
      this.whatsappService.buscarContact(aux).subscribe(
        res => {
          console.table(res)
         
        },
        err => {
          console.log(err);
        }
      )
    }*/
  /*sendMessage() {
    var aux: cWhatsapp;
    aux = {
      phone: "593988964391",
      message: ":100: hola 4 mi :smile: :exclamation: :exclamation:  \nLinea uno \nLinea dos, para revisar :joy:"
    }
    aux.phone = "593999786121";
    //aux.phone= "593984958499";

    this.whatsappService.sendMessageWhat(aux).subscribe(
      res => {
        console.table(res)
        this.toastr.warning('Mensaje', 'Correcto');
      },
      err => {
        console.log(err);
      }
    )
  }*/
}
