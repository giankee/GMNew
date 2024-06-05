import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrdenTrabajoService } from 'src/app/shared/ordenTrabajo/orden-trabajoB.service';
import { cOrdenTrabajoB, cTareaO, cHistorialBM, cGaleriaArchivoOrden, cHistorialTaOrden } from 'src/app/shared/ordenTrabajo/cOrdenModel.model';
import { HistorialService } from 'src/app/shared/ordenTrabajo/historial.service';
import Swal from 'sweetalert2';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { GaleriaArchivosComponent } from '../galeria-archivos/galeria-archivos.component';
import { cBarcoMaquinarias } from 'src/app/shared/barco.model';
import { cNotificacion } from 'src/app/shared/basicos';
import { jsPDF } from 'jspdf'

@Component({
  selector: 'app-orden-trabajo-view',
  templateUrl: './orden-trabajo-view.component.html',
  styles: [],
})

export class OrdenTrabajoViewComponent implements OnInit {

  spinnerOnOff: boolean = true;
  strFecha: string;
  ordenTrabajoCopy: cOrdenTrabajoB;

  okGuardarOrden: boolean = true;
  listTareaORealizada: cTareaO[] = [];
  listNewHistorial: cHistorialBM[] = [];
  internetStatus: string = 'nline';
  okGuardado: boolean = false;
  okAyuda: boolean = false;
  barcoMaquinaria: cBarcoMaquinarias;
  constructor(public ordenTrabajoService: OrdenTrabajoService, public historialBMService: HistorialService,
    private router: Router, private activatedRoute: ActivatedRoute, private toastr: ToastrService, private mConexionService: MenuConexionService, private dialog: MatDialog) { }

  ngOnInit() {
    this.fechaActual();
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });

    this.activatedRoute.params.subscribe(params => {
      if (params["id"] != undefined) {
        this.ordenTrabajoService.getOrdenTrabajo(params["id"])
          .subscribe(orden => {
            this.spinnerOnOff = false;
            this.preparandoTareas(orden);
          },
            error => this.router.navigate(["/ordenTrabajo"]));
      }
    })
  }

  //Listo
  preparandoTareas(list: cOrdenTrabajoB) {
    this.ordenTrabajoService.formData = {
      idOrdenT: list.idOrdenT,
      titulo: list.titulo,
      tipoMantenimiento: list.tipoMantenimiento,
      barcoMaquinariaId: list.barcoMaquinariaId,
      valorHS: list.valorHS,
      fechaIngreso: list.fechaIngreso.substr(0, 10),
      fechaFinalizacion: list.fechaFinalizacion,
      responsable: list.responsable,
      supervisor: list.supervisor,
      marea: list.marea,
      descripcionSolicitud: list.descripcionSolicitud,
      estadoProceso: list.estadoProceso,
      listGaleriaArchivoOrdenes: list.listGaleriaArchivoOrdenes,
      listTareaO: list.listTareaO,
    }
    this.barcoMaquinaria = list.barcoMaquinaria;
    for (var i = 0; i < this.ordenTrabajoService.formData.listTareaO.length; i++) {
      if (this.ordenTrabajoService.formData.listTareaO[i].notificacionId != null) {
        this.ordenTrabajoService.formData.listTareaO[i].mostrarbtnNotify = false;
        if (this.ordenTrabajoService.formData.listTareaO[i].notificacion.estadoProceso == "Finalizada") {
          this.ordenTrabajoService.formData.listTareaO[i].notificacion.realizada = true;
        } else {
          this.ordenTrabajoService.formData.listTareaO[i].notificacion.realizada = false;
          this.ordenTrabajoService.formData.listTareaO[i].seleccionActiva = true;
        }
      } else this.ordenTrabajoService.formData.listTareaO[i].mostrarbtnNotify = true;
    }
    this.ordenTrabajoCopy = JSON.parse(JSON.stringify(this.ordenTrabajoService.formData));
  }

  //Listo
  onProcesarOrden(tipoGuardado: number) {
    var flagActualiza = true;
    var flagNotifyPendiente = false;
    if (this.okGuardarOrden) {
      for (var i = 0; i < this.ordenTrabajoService.formData.listTareaO.length; i++) {
        if (this.ordenTrabajoService.formData.listTareaO[i].estadoRealizado == true) {
          if (this.comprobarExistAcciones(this.ordenTrabajoService.formData.listTareaO[i])) {
            if (!this.comprobarResponsable(this.ordenTrabajoService.formData.listTareaO[i], false))
              flagActualiza = false;
          } else this.ordenTrabajoService.formData.listTareaO[i].estadoRealizado = false;
        } else this.comprobarExistAcciones(this.ordenTrabajoService.formData.listTareaO[i], true);
        if (this.ordenTrabajoService.formData.listTareaO[i].notificacion) {
          if (this.ordenTrabajoService.formData.listTareaO[i].notificacion.estadoProceso == "Espera")
            flagNotifyPendiente = true;
          if (this.ordenTrabajoService.formData.listTareaO[i].notificacion.estadoProceso == "Pendiente") {
            if (this.ordenTrabajoService.formData.listTareaO[i].notificacion.realizada == true) {
              this.ordenTrabajoService.formData.listTareaO[i].notificacion.estadoProceso = "Finalizada";
            } else flagNotifyPendiente = true;
          }
        }
      }
      if (this.ordenTrabajoService.formData.listTareaO.find(x => x.estadoRealizado == true) != undefined) {
        if (flagActualiza) {
          if (tipoGuardado == 3 && !flagNotifyPendiente) {
            Swal.fire({
              title: 'Está seguro?',
              text: "Desea finalizar la Orden Trabajo?",
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
                this.ordenTrabajoService.formData.fechaFinalizacion = this.strFecha;
                this.ordenTrabajoService.formData.estadoProceso = "Finalizada";
                this.ordenTrabajoService.actualizarOrdenT(this.ordenTrabajoService.formData).subscribe(
                  res => {
                    this.onSaveSuccess();
                    this.toastr.success('Orden Trabajo Finalizada', 'Registro de Orden Trabajo');
                    this.prepararHistorial();
                  },
                  err => {
                    console.log(err);
                  }
                )
              }
            })
          } else {
            if (flagNotifyPendiente) {
              Swal.fire({
                title: 'Recordatorio!, Tiene notifaciones pendientes.',
                text: "La orden de trabajo se guardo correctamente, pero no puede finalizar la orden hasta que se concluyan las notificaciones pendientes",
                icon: 'info',
                showCancelButton: false,
                confirmButtonText: 'Ok!',
                customClass: {
                  confirmButton: 'btn btn-info mr-2'
                },
                buttonsStyling: false
              })
            }
            this.onUpdateOrden();
          }
        } else this.okGuardarOrden = false;
      } else this.onSaveSuccess();
    }
  }

  onSaveSuccess() {
    this.okGuardado = true;
    this.router.navigate(["/ordenTrabajo"]);
  }

  //Listo
  cancelarCambios() {
    if (JSON.stringify(this.ordenTrabajoService.formData) != JSON.stringify(this.ordenTrabajoCopy)) {
      this.ordenTrabajoService.formData = JSON.parse(JSON.stringify(this.ordenTrabajoCopy));
    }
    this.okGuardarOrden = true;
  }

  //Listo
  cambiarSelect(indiceTarea:number) {
    for (var i = 0; i < this.ordenTrabajoService.formData.listTareaO.length; i++) {
      if (i == indiceTarea)
        this.ordenTrabajoService.formData.listTareaO[i].seleccionActiva = !this.ordenTrabajoService.formData.listTareaO[i].seleccionActiva;
      else this.ordenTrabajoService.formData.listTareaO[i].seleccionActiva = false;
    }
  }

  //Listo
  comprobarExistAcciones(list: cTareaO, encerar?: boolean) {
    var flagAccion = false;
    for (var j = 0; j < list.listAccionesRealizadaO.length; j++) {
      if (list.listAccionesRealizadaO[j].estadoRealizado == true) {
        flagAccion = true;
        if (encerar) {
          list.listAccionesRealizadaO[j].estadoRealizado = false;
        }
      }
    }
    return flagAccion;
  }

  //Listo
  comprobarTareaAcciones() {
    var flagTareaAccion = true;
    for (var i = 0; i < this.ordenTrabajoService.formData.listTareaO.length; i++) {
      if (this.ordenTrabajoService.formData.listTareaO[i].estadoRealizado) {
        if (this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO.find(x => x.estadoRealizado == true) == undefined)
          flagTareaAccion = false;
      }
    }
    this.okGuardarOrden = flagTareaAccion;
    return flagTareaAccion;
  }

  //Listo
  comprobarResponsable(tareaO: cTareaO, expandir: boolean) {
    var flagResponsable = true;
    if (tareaO.estadoRealizado) {
      if (tareaO.reponsableTarea == null) {
        flagResponsable = false;
        tareaO.seleccionActiva = true;
        tareaO.error = true;
      } else {
        if (!expandir)
          tareaO.seleccionActiva = false;
        tareaO.error = false;
      }
    }
    if (expandir) {
      if (this.ordenTrabajoService.formData.listTareaO.find(x => x.reponsableTarea == null && x.estadoRealizado == true) != undefined)
        this.okGuardarOrden = false;
      else this.okGuardarOrden = true;
    }

    return (flagResponsable);
  }

  //Listo
  prepararHistorial() {
    var auxHistorial: cHistorialBM = {
      barcoMaquinariaId: this.ordenTrabajoService.formData.barcoMaquinariaId,
      tareaMId: null,
      listHistoTaOrdenes: null,
      intervaloId: null,
      periodoVigente: this.barcoMaquinaria.fechaIncorporacionB
    };

    var auxHistorialTa2: cHistorialTaOrden[] = [];
    var auxIntervalos;
    for (var i = 0; i < this.ordenTrabajoService.formData.listTareaO.length; i++) {
      if (this.ordenTrabajoService.formData.listTareaO[i].estadoRealizado) {
        auxIntervalos = null;
        var auxHistorialTa: cHistorialTaOrden = {
          ordenTId: this.ordenTrabajoService.formData.idOrdenT,
          listAcciones: ""
        };
        auxHistorialTa2 = [];
        auxHistorialTa2.push(auxHistorialTa);
        auxHistorial.tareaMId = this.ordenTrabajoService.formData.listTareaO[i].tareaMId;
        auxHistorial.listHistoTaOrdenes = auxHistorialTa2;

        for (var j = 0; j < this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO.length; j++) {
          if (this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO[j].estadoRealizado) {
            if (auxHistorial.listHistoTaOrdenes[0].listAcciones != "")
              auxHistorial.listHistoTaOrdenes[0].listAcciones = auxHistorial.listHistoTaOrdenes[0].listAcciones + "-" + this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO[j].accionId;
            else auxHistorial.listHistoTaOrdenes[0].listAcciones = "" + this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO[j].accionId;
            auxIntervalos = this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO[j].strIntervalos.split("-");
            for (var auxI = 0; auxI < auxIntervalos.length; auxI++) {
              if (auxIntervalos[auxI] != 'New')
                auxHistorial.intervaloId = Number(auxIntervalos[auxI]);
              else auxHistorial.intervaloId = null;
              this.listNewHistorial.push(JSON.parse(JSON.stringify(auxHistorial)));
            }
          }
        }
      }
    }
    if (this.listNewHistorial != null) {
      if (this.listNewHistorial.length > 1)
        for (var i = 0; i < this.listNewHistorial.length - 1; i++) {
          if (this.listNewHistorial[i].tareaMId == this.listNewHistorial[(i + 1)].tareaMId && this.listNewHistorial[i].intervaloId == this.listNewHistorial[(i + 1)].intervaloId) {
            this.listNewHistorial.splice((i), 1);
            i--;
          }
        }
      this.historialBMService.actualizarHBM(this.listNewHistorial).subscribe(
        res => {
        },
        err => {
          console.log(err);
        }
      )
    }

  }

  //Listo
  onConvertPdf() {
    if (this.internetStatus == "nline") {
      var x: number;
      var y: number = 30;
      var auxCol: string;
      var auxPos: number = 0;
      var auxDescripcion: string = this.ordenTrabajoService.formData.descripcionSolicitud;

      var doc = new jsPDF(), margin = 15, verticalOffset = margin;

      var idTitulo = document.getElementById("contPrint1");
      doc.html(idTitulo, {x:20, y:10});
      for (var i = 1; i <= 7; i++) {
        if (i % 2 == 1) {
          auxCol = "Col1";
          auxPos++;
          x = 10;
          y = y + 6;
        }
        else {
          if (i != 7) {
            auxCol = "Col2";
            x = 110;
          }
        }
        var auxNombreId = "contFila" + auxPos + auxCol;
        doc.html(document.getElementById(auxNombreId), {x, y});
      }
      var fila5Col1 = document.getElementById("contFila5Col1");
      doc.html(fila5Col1, {x:76, y:64});

      y = 64;
      auxPos = 5;
      for (var i = 1; i <= 2; i++) {
        if (i % 2 == 1) {
          auxCol = "Col1";
          auxPos++;
          x = 10;
          y = y + 6;
        }
        else {
          auxCol = "Col2";
          x = 110;
        }
        var auxNombreId = "contFila" + auxPos + auxCol;
        doc.html(document.getElementById(auxNombreId), {x, y});
      }
      /**hasta aqui todo bien */

      doc.setFontSize(12);
      doc.setFont("arial","bold");
      doc.text("Trabajos Solicitados", 10, 86);
      doc.text("Datos de la Maquinaria", 110, 86);
      doc.setFont("arial","bold");
      var lines = doc.splitTextToSize(auxDescripcion, 85);
      doc.text(lines, 10, 92 + verticalOffset / 72)
      y = 86;
      auxPos = 8;

      doc.html(document.getElementById("contFila8Col1"), {x:110, y});
      for (var i = 1; i <= 5; i++) {
        if (i % 2 == 1) {
          auxCol = "Col1";
          auxPos++;
          x = 110;
          y = y + 6;
        }
        else {
          auxCol = "Col2";
          x = 155;
        }
        var auxNombreId = "contFila" + auxPos + auxCol;
        doc.html(document.getElementById(auxNombreId), {x, y});
      }

      doc.setLineWidth(0.4);
      /**Primera fila titulo */
      doc.line(9, 115, 199, 115);//up
      doc.line(9, 130, 199, 130);//down
      doc.setFontSize(14);
      doc.text("Lista de Tareas Programadas", 70, 125);
      doc.line(9, 115, 9, 130);//left
      doc.line(199, 115, 199, 130);//right
      /**Segunda fila encabezado */
      doc.line(9, 140, 199, 140);//down +10y1y2
      doc.line(9, 130, 9, 140);//left
      doc.line(199, 130, 199, 140);//right
      doc.text("#", 13, 137);
      doc.line(20, 130, 20, 140);//right
      doc.text("Tareas", 25, 137);
      doc.line(95, 130, 95, 140);//right
      doc.text("Acciones", 100, 137);
      doc.line(155, 130, 155, 140);//right
      doc.text("Observación", 160, 137);

      /**Datos */
      y = 140;
      doc.setFontSize(11);

      var valorHTarea: number = 10;
      var valorHAcciones;
      var valorHObservacion: number = 0;
      var valorG: number = 0;
      var auxI: string;
      var auxS: string;

      for (var i = 0; i < this.ordenTrabajoService.formData.listTareaO.length; i++) {
        y = y + 10;
        auxS = this.ordenTrabajoService.formData.listTareaO[i].tareaM.nombre;
        var lines = doc.splitTextToSize(auxS, 65);
        valorHTarea = (2 * lines.length) + 3;
        var auxFila = this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO.length / 2;
        if (auxFila % 2 != 1)
          auxFila = auxFila - (auxFila % 1) + 1;
        valorHAcciones = (4.5 * auxFila) - 3;

        valorHObservacion = 0;
        if (this.ordenTrabajoService.formData.listTareaO[i].observacion != null) {
          auxS = this.ordenTrabajoService.formData.listTareaO[i].observacion;
          var lines2 = doc.splitTextToSize(auxS, 35);
          valorHObservacion = (2 * lines.length) + 3;

        }

        if ((valorHAcciones + y) > 280 || (valorHTarea + y) > 280 || (valorHObservacion + y) > 280) {
          doc.addPage();
          doc.setLineWidth(0.4);
          y = 30;
          doc.setFontSize(14);
          doc.line(9, y - 10, 199, y - 10);//Up
          doc.line(9, y, 199, y);//down
          doc.line(9, y - 10, 9, y);//left
          doc.line(199, y - 10, 199, y);//right
          doc.text("#", 13, y - 3);
          doc.line(20, y - 10, 20, y);//right
          doc.text("Tareas", 25, y - 3);
          doc.line(95, y - 10, 95, y);//right
          doc.text("Acciones", 100, y - 3);
          doc.line(155, y - 10, 155, y);//right
          doc.text("Observación", 160, y - 3);
          doc.line(199, y - 10, 199, y);//right
          y = y + 10;
          doc.setFontSize(11);
        }
        doc.text(lines,25, y - 3 );
        if (valorHObservacion != 0)
          doc.text(lines2,160, y - 3);

        var yA = y;
        for (var j = 0; j < this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO.length; j++) {
          var x1;
          var x2;

          doc.setDrawColor(170, 170, 170);
          if ((j + 1) % 2 == 1) {
            yA = yA + 4.5;
            x1 = 98;
            x2 = 102;
          }
          else {
            x1 = 126;
            x2 = 130;
          }
          var y1 = (yA - 10.5);
          var y2 = (yA - 7.5);

          doc.line(x1, y1, x2, y1);//up
          doc.line(x1, y2, x2, y2);//down
          doc.line(x1, y1, x1, y2);//left
          doc.line(x2, y1, x2, y2);//right
          if (this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO[j].estadoRealizado) {
            doc.line(x1, y1, x2, y2);//cruz a
            doc.line(x1, y2, x2, y1);//cruz b
          }
          doc.text(this.ordenTrabajoService.formData.listTareaO[i].listAccionesRealizadaO[j].nombreAccionM,x2 + 2, y2);
        }

        doc.setDrawColor(0, 0, 0)
        if (valorHTarea >= valorHAcciones) //tengo q arreglar esto ahora que se unio un nuevo problema que es el de observar
          valorG = valorHTarea;
        else valorG = valorHAcciones;
        y = y + valorG;

        auxI = "" + Number(i + 1);
        doc.text(auxI, 13, Number(y - 3 - (valorG / 2)));


        doc.line(9, y, 199, y);//down General
        doc.line(9, (y - valorG - 10), 9, y);//left Indice
        doc.line(20, (y - valorG - 10), 20, y);//right Indice
        doc.line(95, (y - valorG - 10), 95, y);//right Tarea
        doc.line(155, (y - valorG - 10), 155, y);//right Acciones
        doc.line(199, (y - valorG - 10), 199, y);//right Observacion
      }

      if (y >= 270) {
        doc.addPage();
        doc.setLineWidth(0.4);
        y1 = 40;
      } else y1 = 275;
      doc.line(40, y1, 80, y1);//Firma1
      doc.text("Firma Supervisor",45, y1 + 5);
      doc.line(130, y1, 170, y1);//Firma2
      doc.text( "Firma Responsable", 133, y1 + 5);

      doc.save(this.strFecha + "OrdenTrabajo-" + this.ordenTrabajoService.formData.idOrdenT);
      if (this.ordenTrabajoService.formData.estadoProceso == "En Proceso") {
        this.ordenTrabajoService.formData.estadoProceso = "Preliminar";
        this.onUpdateOrden();
      }
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
  onUpdateOrden() {
    this.ordenTrabajoService.actualizarOrdenT(this.ordenTrabajoService.formData).subscribe(
      (res: any) => {
        if (this.ordenTrabajoService.formData.estadoProceso != "Finalizada")
          this.toastr.success('Orden Trabajo Guardada', 'Actualización de Orden Trabajo');
        this.onSaveSuccess();
      },
      err => {
        console.log(err);
      }
    )
  }

  //Listo
  irGaleria() {
    if (this.internetStatus == "nline") {
      const dialoConfig = new MatDialogConfig();
      dialoConfig.autoFocus = true;
      dialoConfig.disableClose = true;
      this.dialog.open(GaleriaArchivosComponent, dialoConfig)
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
  onNewNotificacion(indiceTarea:number) {
    var auxNewNoty: cNotificacion = {
      descripcion: "",
      ordenTrabajoId: this.ordenTrabajoService.formData.idOrdenT,
      recordatorio: "Tiene un aviso pendiente de la tarea: " + this.ordenTrabajoService.formData.listTareaO[indiceTarea].tareaM.nombre,
      fechaCreacion: this.strFecha,
      emisor: this.mConexionService.UserR.rolAsignado,
      recordatorioHasta: this.strFecha,
      estadoProceso: "Espera"
    }
    this.ordenTrabajoService.formData.listTareaO[indiceTarea].notificacion = auxNewNoty;
    this.ordenTrabajoService.formData.listTareaO[indiceTarea].mostrarbtnNotify = false;
  }

  onSmartCheack(posInter: number, btnMarcar?:any) {
    if (btnMarcar == true) {
      if (this.ordenTrabajoService.formData.listTareaO[posInter].estadoRealizado) {
        if(this.ordenTrabajoService.formData.listTareaO[posInter].listAccionesRealizadaO.length==1)
          this.ordenTrabajoService.formData.listTareaO[posInter].listAccionesRealizadaO[0].estadoRealizado = true;
      } else
        this.ordenTrabajoService.formData.listTareaO[posInter].listAccionesRealizadaO.forEach(function (acciones) {
          acciones.estadoRealizado = false;
        })
    } else {
      if (this.ordenTrabajoService.formData.listTareaO[posInter].listAccionesRealizadaO.find(x => x.estadoRealizado == true) != undefined)
        this.ordenTrabajoService.formData.listTareaO[posInter].estadoRealizado = true;
      else this.ordenTrabajoService.formData.listTareaO[posInter].estadoRealizado = false;
    }
    this.comprobarTareaAcciones();
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

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (JSON.stringify(this.ordenTrabajoService.formData) == JSON.stringify(this.ordenTrabajoCopy)) {
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
}
