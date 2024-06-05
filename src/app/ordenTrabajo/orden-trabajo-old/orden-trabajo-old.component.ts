import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { NgForm } from '@angular/forms';
import { OrdenTrabajoService } from 'src/app/shared/ordenTrabajo/orden-trabajoB.service';
import { cTareaO, cAccionO, cHistorialBM, cOrdenTrabajoB, cHistorialTaOrden } from 'src/app/shared/ordenTrabajo/cOrdenModel.model';
import { AccionService } from 'src/app/shared/mantenimiento/accion.service';
import { cAccion } from 'src/app/shared/mantenimiento/cManModel.model';
import { HistorialService } from 'src/app/shared/ordenTrabajo/historial.service';

@Component({
  selector: 'app-orden-trabajo-old',
  templateUrl: './orden-trabajo-old.component.html',
  styles: []
})
export class OrdenTrabajoOldComponent implements OnInit {

  internetStatus: string = 'nline';
  strFecha: string;
  listAccionIn: cAccion[];
  listAccionesO: any[] = [];
  listNewHistorial: cHistorialBM[] = [];
  okBttn:boolean=true;
  constructor(@Inject(MAT_DIALOG_DATA) public dato:any, public dialogRef: MatDialogRef<OrdenTrabajoOldComponent>, private mConexionService: MenuConexionService, public ordenTrabajoService: OrdenTrabajoService, public accionService: AccionService,  public historialBMService: HistorialService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.fechaActual();
    this.resetForm();

    this.accionService.getAcciones()
      .subscribe(list => this.listAccionIn = list,
        error => console.error(error));
  }

  //listo
  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.ordenTrabajoService.formDataOld = {
      titulo: "Orden_Antigua/" + this.dato.barcoData + "/" + this.dato.idBarcoMaquinaria,
      tipoMantenimiento: "Antigua",
      barcoMaquinariaId: this.dato.idBarcoMaquinaria,
      valorHS: null,
      fechaIngreso: null,
      fechaFinalizacion: this.strFecha,
      responsable: "???",
      supervisor: "???",
      descripcionSolicitud: "Se realizó una actualizacion de la tarea en la fecha: " + this.strFecha,
      estadoProceso: "Antigua",
      listTareaO: []
    }
    var auxTareaO: cTareaO = {
      tareaMId: this.dato.intervaloTarea.tareaId,
      observacion: null,
      reponsableTarea: null,
      estadoRealizado: true,
      listAccionesRealizadaO: [],
      notificacionId: null
    }
    this.ordenTrabajoService.formDataOld.listTareaO.push(auxTareaO);
  }

  onSubmitOldOrden() {
    if(this.okBttn){
      this.okBttn=false;
      var auxAccionO: cAccionO;
      var auxStrIntervaloId:string=""+this.dato.intervaloTarea.intervaloId;
  
      this.ordenTrabajoService.formDataOld.fechaIngreso = this.ordenTrabajoService.formDataOld.fechaFinalizacion;
  
      for (var k = 0; k < this.listAccionesO.length; k++) {
        for (var l = 0; l < this.listAccionIn.length; l++) {
          if (this.listAccionesO[k] === this.listAccionIn[l].nombre) {
            auxAccionO = {
              accionId: Number(this.listAccionIn[l].idAccionM),
              nombreAccionM: this.listAccionIn[l].nombre,
              estadoRealizado: true,
              strIntervalos: auxStrIntervaloId
            }
            this.ordenTrabajoService.formDataOld.listTareaO[0].listAccionesRealizadaO.push(auxAccionO);
          }
        }
      }
      this.ordenTrabajoService.insertarOrden(this.ordenTrabajoService.formDataOld).subscribe(
        resOrden => {
          this.prepararHistorial(resOrden)
        },
        err => {
          console.log(err);
        }
      )
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

  prepararHistorial(ordenOld: cOrdenTrabajoB) {
    var auxHistorial: cHistorialBM;
    var auxHistorialTa:cHistorialTaOrden;
    var auxHistorialTa2:cHistorialTaOrden[]=[];
    auxHistorialTa={
      ordenTId: ordenOld.idOrdenT,
      listAcciones:""
    }
    auxHistorialTa2.push(auxHistorialTa);
    auxHistorial = {
      barcoMaquinariaId: ordenOld.barcoMaquinariaId,
      tareaMId: ordenOld.listTareaO[0].tareaMId,
      intervaloId: Number(ordenOld.listTareaO[0].listAccionesRealizadaO[0].strIntervalos),
      periodoVigente:this.dato.periodoVigenteM,
      listHistoTaOrdenes: auxHistorialTa2
    }
    for(var i=0; i<ordenOld.listTareaO[0].listAccionesRealizadaO.length;i++){
      if(auxHistorial.listHistoTaOrdenes[0].listAcciones!="")
      auxHistorial.listHistoTaOrdenes[0].listAcciones=auxHistorial.listHistoTaOrdenes[0].listAcciones+"-"+ordenOld.listTareaO[0].listAccionesRealizadaO[i].accionId;
      else  auxHistorial.listHistoTaOrdenes[0].listAcciones=""+ordenOld.listTareaO[0].listAccionesRealizadaO[i].accionId;
    }
      
    this.listNewHistorial.push(auxHistorial);
    this.historialBMService.actualizarHBM(this.listNewHistorial).subscribe(
      (res:any) => {
        this.historialBMService.pasarHistorial(res);
        this.onExit();
      },
      err => {
        console.log(err);
      }
    )
  }

  onExit() {
    this.dialogRef.close();
  }

}
