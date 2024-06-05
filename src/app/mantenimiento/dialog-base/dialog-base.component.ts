import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventoService } from 'src/app/shared/mantenimiento/evento.service';
import { MedicionService } from 'src/app/shared/mantenimiento/medicion.service';
import { TareaService } from 'src/app/shared/mantenimiento/tarea.service';
import { AccionService } from 'src/app/shared/mantenimiento/accion.service';
import { NgForm } from '@angular/forms';
import { cEvento, cMedicion, cTarea, cAccion, cDialog } from 'src/app/shared/mantenimiento/cManModel.model';
import { ToastrService } from 'ngx-toastr';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-base',
  templateUrl: './dialog-base.component.html',
  styles: []
})
export class DialogBaseComponent implements OnInit {

  objetolist: any[] = [];
  resultBusquedaMostrar: any[]=[];
  objetoForm: cDialog;
  objetoTitulo: string;
  objetoTituloS: string;
  modoEdicion: boolean;
  idDatoObj: number;
  spinnerOnOff: boolean = true;
  autoFocus: boolean = false;

  /**Para pagination */
  startIndex: number = 0;
  endIndex: number = 5;
  selectPagination: number = 5;
  pagActualIndex: number = 0;
  siguienteBlock: boolean = false;
  anteriorBlock: boolean = true;
  pagTotal: any[] = [];
  /**Fin paginatacion */
  internetStatus: string = 'nline';
  filtroData = '';
  tipoData:string;//puede ser
  constructor(@Inject(MAT_DIALOG_DATA) public dato:any, public dialogRef: MatDialogRef<DialogBaseComponent>, private eventoService: EventoService, private medicionService: MedicionService, private tareaService: TareaService, private accionService: AccionService, private toastr: ToastrService, private mConexionService: MenuConexionService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });

    switch (this.dato.tipoObjeto) {
      case 1:
        this.tipoData="cEvento";
        this.objetoTitulo = "Eventos";
        this.objetoTituloS = "Evento";
        this.cargarDataEventos();
        break;
      case 2:
        this.tipoData="cMedicion";
        this.objetoTitulo = "Mediciones";
        this.objetoTituloS = "Medición";
        this.cargarDataMediciones();
        break;
      case 3:
        this.tipoData="cTarea";
        this.objetoTitulo = "Tareas";
        this.objetoTituloS = "Tarea";
        this.cargarDataTareas();
        break;
      case 4:
        this.tipoData="cAccion";
        this.objetoTitulo = "Acciones";
        this.objetoTituloS = "Acción";
        this.cargarDataAcciones();
        break;
    }
    this.resetForm();
  }

  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.objetoForm = {
      nombre: "",
      simbolo: "",
      isUnique: false,
      isOne:true
    }
    this.modoEdicion = false;
  }

  cargarDataEventos() {
    this.eventoService.getEventos()
      .subscribe(listEventos => {
        this.objetolist = listEventos;
        this.getNumberIndex(this.objetolist.length);
        this.updateIndex(0);
        this.spinnerOnOff=false;
      },
        error => console.error(error));
  }

  cargarDataMediciones() {
    this.medicionService.getMediciones()
      .subscribe(listMediciones => {
        this.objetolist = listMediciones;
        this.getNumberIndex(this.objetolist.length);
        this.updateIndex(0);
        this.spinnerOnOff=false;
      },
        error => console.error(error));
  }

  cargarDataTareas() {
    this.tareaService.getTareas()
      .subscribe(listTareas => {
        this.objetolist = listTareas;
        this.getNumberIndex(this.objetolist.length);
        this.updateIndex(0);
        this.spinnerOnOff=false;
      },
        error => console.error(error));
  }

  cargarDataAcciones() {
    this.accionService.getAcciones()
      .subscribe(listAcciones => {
        this.objetolist = listAcciones;
        this.getNumberIndex(this.objetolist.length);
        this.updateIndex(0);
        this.spinnerOnOff=false;
      },
        error => console.error(error));
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

      if ((pageIndex == 0 && i < 3) || (pageIndex == 1 && i < 3) || (pageIndex == this.pagTotal.length - 1 && i > this.pagTotal.length - 4) || (pageIndex == this.pagTotal.length - 1 && i > this.pagTotal.length - 4))
        this.pagTotal[i].mostrar = false;
      else {
        if ((i >= pageIndex + 2) || (i <= pageIndex - 2))
          this.pagTotal[i].mostrar = true;
        else
          this.pagTotal[i].mostrar = false;
      }
    }
  }

  getDataFiltro(data:any, op: number) {//Para q la filtracion de datos se automatica
    if (op == 1) {
      if (this.resultBusquedaMostrar.length == 0) {
        this.resultBusquedaMostrar = JSON.parse(JSON.stringify(data));
      } else {
        if (JSON.stringify(data) != JSON.stringify(this.resultBusquedaMostrar)) {
          this.resultBusquedaMostrar = JSON.parse(JSON.stringify(data));
          this.getNumberIndex(this.resultBusquedaMostrar.length);
          this.updateIndex(0);
        }
      }
    }
  }
  //listo
  completarForm(list:any, form?: NgForm) {
    if (form == null) {
      switch (this.dato.tipoObjeto) {
        case 1:
          this.objetoForm = {
            nombre: list.nombre,
            isUnique: list.isUnique,
            isOne: !list.isOne
          }
          this.idDatoObj = list.idEventoM;
          break;
        case 2:
          this.objetoForm = {
            nombre: list.nombre,
            simbolo: list.simbolo
          }
          this.idDatoObj = list.idMedicionM;
          break;
        case 3:
          this.objetoForm = {
            nombre: list.nombre,
          }
          this.idDatoObj = list.idTareaM;
          break;
        case 4:
          this.objetoForm = {
            nombre: list.nombre,
          }
          this.idDatoObj = list.idAccionM;
          break;
      }
    }
    this.modoEdicion = true;
  }

  //Listo
  onEditObj(dato:any) {
    this.completarForm(Object.assign(dato));
  }

  onSubmit(form: NgForm) {
    if (this.internetStatus == "nline") {
      switch (this.dato.tipoObjeto) {
        case 1:
          var listEvento: cEvento = Object.assign({}, form.value);
          listEvento.estado = 1;
          listEvento.isOne=!listEvento.isOne;
          if (this.modoEdicion) {
            listEvento.idEventoM = this.idDatoObj;
            
            this.eventoService.actualizarEvento(listEvento).subscribe(
              res => {
                this.objetolist[this.onActualizarData()] = res;
                this.resetForm();
              },
              err => {
                console.log(err);
              }
            )
          } else {
            this.eventoService.insertarEvento(listEvento).subscribe(
              res => {
                this.objetolist.push(res);
                this.resetForm();
                this.getNumberIndex(this.objetolist.length);
                this.updateIndex(this.pagTotal.length - 1);
                this.eventoService.pasarEvento(res);
              },
              err => {
                if (err.status == 400) {
                  this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
                  this.objetoForm.nombre = null;
                  this.autoFocus = !this.autoFocus;
                }
                else
                  console.log(err);
              }
            )
          }
          break;
        case 2:
          var listMedicion: cMedicion = Object.assign({}, form.value);
          listMedicion.estado = 1;
          if (this.modoEdicion) {
            listMedicion.idMedicionM = this.idDatoObj;
            this.medicionService.actualizarMedicion(listMedicion).subscribe(
              res => {
                this.objetolist[this.onActualizarData()] = res;
                this.resetForm();
              },
              err => {
                console.log(err);
              }
            )
          } else {
            this.medicionService.insertarMedicion(listMedicion).subscribe(
              res => {
                this.objetolist.push(res);
                this.resetForm();
                this.getNumberIndex(this.objetolist.length);
                this.updateIndex(this.pagTotal.length - 1);
                this.medicionService.pasarMedicion(res);
              },
              err => {
                if (err.status == 400) {
                  this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
                  this.objetoForm.nombre = null;
                  this.autoFocus = !this.autoFocus;
                }
                else
                  console.log(err);
              }
            )
          }
          break;
        case 3:
          var listTarea: cTarea = Object.assign({}, form.value);
          listTarea.estado = 1;
          if (this.modoEdicion) {
            listTarea.idTareaM = this.idDatoObj;
            this.tareaService.actualizarTarea(listTarea).subscribe(
              res => {
                this.objetolist[this.onActualizarData()] = res;
                this.resetForm();
              },
              err => {
                console.log(err);
              }
            )
          } else {
            this.tareaService.insertarTarea(listTarea).subscribe(
              res => {
                this.objetolist.push(res);
                this.resetForm();
                this.getNumberIndex(this.objetolist.length);
                this.updateIndex(this.pagTotal.length - 1);
                this.tareaService.pasarTarea(res);
              },
              err => {
                if (err.status == 400) {
                  this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
                  this.objetoForm.nombre = null;
                  this.autoFocus = !this.autoFocus;
                }
                else
                  console.log(err);
              }
            )
          }
          break;
        case 4:
          var listAccion: cAccion = Object.assign({}, form.value);
          listAccion.estado = 1;
          if (this.modoEdicion) {
            listAccion.idAccionM = this.idDatoObj;
            this.accionService.actualizarAccion(listAccion).subscribe(
              res => {
                this.objetolist[this.onActualizarData()] = res;
                this.resetForm();
              },
              err => {
                console.log(err);
              }
            )
          } else {
            this.accionService.insertarAccion(listAccion).subscribe(
              res => {
                this.objetolist.push(res);
                this.resetForm();
                this.getNumberIndex(this.objetolist.length);
                this.updateIndex(this.pagTotal.length - 1);
                this.accionService.pasarAccion(res);
              },
              err => {
                if (err.status == 400) {
                  this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
                  this.objetoForm.nombre = null;
                  this.autoFocus = !this.autoFocus;
                }
                else
                  console.log(err);
              }
            )
          }
          break;
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

  onActualizarData() {
    var posObjeto;
    for (var i = 0; i < this.objetolist.length; i++) {
      switch (this.dato.tipoObjeto) {
        case 1:
          if(this.objetolist[i].idEventoM==this.idDatoObj)
            posObjeto=i;
          break;
        case 2:
            if(this.objetolist[i].idMedicionM==this.idDatoObj)
            posObjeto=i;
          break;
        case 3:
            if(this.objetolist[i].idTareaM==this.idDatoObj)
            posObjeto=i;
          break;
        case 4:
            if(this.objetolist[i].idAccionM==this.idDatoObj)
            posObjeto=i;
          break;
      }
    }
    return posObjeto;
  }

  onExit() {
    this.dialogRef.close();
  }

}
