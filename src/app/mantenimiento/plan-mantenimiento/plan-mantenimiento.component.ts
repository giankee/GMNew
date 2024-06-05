import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PlanMantenimientoService } from 'src/app/shared/mantenimiento/plan-mantenimiento.service';
import { NgForm } from '@angular/forms';
import { cPlanMantenimiento, cIntervalo, cEventoMediciones, cIntervaloTarea, cTareaAcciones } from 'src/app/shared/mantenimiento/cManModel.model';
import { IntervaloService } from 'src/app/shared/mantenimiento/intervalo.service';
import Swal from 'sweetalert2';
import { PuedeDesactivar } from 'src/app/auth/can-deactive.guard';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-plan-mantenimiento',
  templateUrl: './plan-mantenimiento.component.html',
  styles: []
})
export class PlanMantenimientoComponent implements OnInit, PuedeDesactivar {

  listPlanMantenimientoIn: cPlanMantenimiento[];
  modoEdicion: boolean = false;
  strFecha: string = "";
  indiceEditPlan: number;
  ListIntervalosIn: cIntervalo[] = [];
  mantenimientoInCopy: cPlanMantenimiento;
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
  okGuardado: boolean = false;
  okAyuda: boolean = false;
  constructor(public _planMantenimientoService: PlanMantenimientoService, private toastr: ToastrService, public intervaloService: IntervaloService, private mConexionService: MenuConexionService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.fechaActual();
    this.cargarData();
    this.resetForm();
  }

  cargarData() {
    this._planMantenimientoService.getMantenimientos()
      .subscribe(plan => {
        this.listPlanMantenimientoIn = plan;
        this.getNumberIndex(this.listPlanMantenimientoIn.length);
        this.updateIndex(0);
      },
        error => console.error(error));
  }

  updateSelect(control: any) {
    this.selectPagination = control.value;
    this.getNumberIndex(this.listPlanMantenimientoIn.length);
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

  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this._planMantenimientoService.formData = {
      idPlanMantenimiento: null,
      nombre: "",
      descripcion: "",
      fechaCreacion: "",
      estado: null,
      listIntervalo: [],
      basadoPlan: false,
      idPlanBasado: null
    }
    this.mantenimientoInCopy = JSON.parse(JSON.stringify(this._planMantenimientoService.formData));
    this.modoEdicion = false;
  }

  //listo
  completarForm(list: cPlanMantenimiento, form?: NgForm) {
    if (form == null) {
      this._planMantenimientoService.formData = {
        idPlanMantenimiento: list.idPlanMantenimiento,
        nombre: list.nombre,
        descripcion: list.descripcion,
        fechaCreacion: list.fechaCreacion,
        estado: 1,
        listIntervalo: list.listIntervalo
      }
    }
    this.mantenimientoInCopy = JSON.parse(JSON.stringify(this._planMantenimientoService.formData));
    this.modoEdicion = true;
  }

  //Listo
  onEditPlan(indice: number, datoPlan: cPlanMantenimiento) {
    this.indiceEditPlan = indice;
    this.completarForm(Object.assign(datoPlan));
  }

  //Listo
  onSubmit(form: NgForm) {
    if (this.internetStatus == "nline") {
      if (this.modoEdicion) {
        this._planMantenimientoService.actualizarPlanMantenimiento(this._planMantenimientoService.formData).subscribe(
          res => {
            this.toastr.success('Edición satisfactoria', 'Plan de Mantenimiento');
            this.listPlanMantenimientoIn[this.indiceEditPlan] = res;
            this.resetForm(form);
          },
          err => {
            console.log(err);
          }
        )
      }
      else {
        let list: cPlanMantenimiento = Object.assign({}, form.value);
        list.estado = 1;

        this._planMantenimientoService.insertarPlanMantenimiento(list).subscribe(
          res => {
            this.toastr.success('Ingreso satisfactorio', 'Plan de Mantenimiento');
            this.listPlanMantenimientoIn.push(res);
            this.resetForm(form);
            this.getNumberIndex(this.listPlanMantenimientoIn.length);
            this.updateIndex(this.pagTotal.length - 1);
            this.onInsertarIntervalo(list, res.idPlanMantenimiento);
          },
          err => {
            if (err.status == 400) {
              this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
              this._planMantenimientoService.formData.nombre = null;
              this.autoFocus = !this.autoFocus;
            }
            else
              console.log(err);
          }
        )
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
  onDelete(indice: number, datoPlan: cPlanMantenimiento) {
    if (this.internetStatus == "nline") {
      Swal.fire({
        title: 'Está seguro?',
        text: "Desea Eliminar este plan de mantenimiento?",
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
          indice = indice + (this.selectPagination * this.pagActualIndex);
          let list: cPlanMantenimiento = Object.assign(datoPlan);
          list.estado = 0;
          this._planMantenimientoService.actualizarPlanMantenimiento(list).subscribe(
            res => {
              this.toastr.warning('Eliminación satisfactoria', 'Plan Mantenimiento');
              this.listPlanMantenimientoIn.splice(indice, 1);
              this.getNumberIndex(this.listPlanMantenimientoIn.length);
              this.updateIndex(0);
            },
            err => {
              console.log(err);
            }
          )
        }
      })
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

  onInsertarIntervalo(list: cPlanMantenimiento, planMantenimientoId: number) {
    if (list.basadoPlan) {
      this._planMantenimientoService.getPlanMantenimiento(list.idPlanBasado.toString())
        .subscribe(plan => {
          this.ListIntervalosIn = plan.listIntervalo;
          for (var i = 0; i < this.ListIntervalosIn.length; i++) {
            var formIntervaloPlan: cIntervalo = {
              estadoActivado: this.ListIntervalosIn[i].estadoActivado,
              planMantenimientoId: planMantenimientoId,
              listEventoMediciones: [],
              listTareas: []
            }
            for (var iEM = 0; iEM < this.ListIntervalosIn[i].listEventoMediciones.length; iEM++) {
              var auxEM: cEventoMediciones = {
                eventoId: this.ListIntervalosIn[i].listEventoMediciones[iEM].eventoId,
                medicionId: this.ListIntervalosIn[i].listEventoMediciones[iEM].medicionId,
                valor: this.ListIntervalosIn[i].listEventoMediciones[iEM].valor
              }
              formIntervaloPlan.listEventoMediciones.push(auxEM);
            }
            for (var iIT = 0; iIT < this.ListIntervalosIn[i].listTareas.length; iIT++) {
              var auxIT: cIntervaloTarea = {
                tareaId: this.ListIntervalosIn[i].listTareas[iIT].tareaId,
                estadoActivado: this.ListIntervalosIn[i].listTareas[iIT].estadoActivado,
                listTareaAccion: [],
              }
              for (var iTA = 0; iTA < this.ListIntervalosIn[i].listTareas[iIT].listTareaAccion.length; iTA++) {
                var auxTA: cTareaAcciones = {
                  accionId: this.ListIntervalosIn[i].listTareas[iIT].listTareaAccion[iTA].accionId,
                  estadoActivado: this.ListIntervalosIn[i].listTareas[iIT].listTareaAccion[iTA].estadoActivado,
                  estado: 1
                }
                auxIT.listTareaAccion.push(auxTA);
              }
              formIntervaloPlan.listTareas.push(auxIT);
            }
            this.intervaloService.insertarIntervalo(formIntervaloPlan).subscribe(
              err => {
                console.log(err);
              }
            )
          }
        },
          error => console.error(error));
    }
  }

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (JSON.stringify(this._planMantenimientoService.formData) == JSON.stringify(this.mantenimientoInCopy)) {
      return true;
    }
    if (this.internetStatus == "nline") {
      const confirmacion = window.confirm('¿Quieres salir del formulario y perder los cambios realizados?');
      return confirmacion;
    }
    if (this.internetStatus == "ffline") {
      const confirmacion = window.confirm('No ahi conexión de Internet, ¿Desea salir de todas formas? No se guardaran los cambios!');
      return confirmacion;
    }
    return false;
  }

  onConvertPdfOne(plan: cPlanMantenimiento) {
    console.table(plan);
    var y: number;
    var doc = new jsPDF();
    doc.setFontSize(15);
    doc.setFont("arial", "bold");
    doc.text("Plan: " + plan.nombre, 10, 20);

    y = 20;
    doc.setFontSize(13);
    doc.text("Lista de Actividades", 80, (y + 7));
    doc.setFontSize(11);
    y = y + 10;

    doc.line(9, y, 199, y);//up

    /**/

    for (var i = 0; i < plan.listIntervalo.length; i++) {
      if (plan.estado == 1) {
        doc.setFontSize(11);
        doc.setFont("arial", "bold");
        var encabezadoMedicion = (i + 1) + ".     ";
        for (var j = 0; j < plan.listIntervalo[i].listEventoMediciones.length; j++) {
          encabezadoMedicion = encabezadoMedicion + (j >= 1 ? "  ó  " : "") + plan.listIntervalo[i].listEventoMediciones[j].evento.nombre;
          if (plan.listIntervalo[i].listEventoMediciones[j].medicion.nombre != "Sin Especificar")
            encabezadoMedicion = encabezadoMedicion + "  " + plan.listIntervalo[i].listEventoMediciones[j].valor + "  " + plan.listIntervalo[i].listEventoMediciones[j].medicion.nombre;
        }
        doc.text(encabezadoMedicion, 15, (y + 7));
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.line(9, (y + 10), 199, (y + 10));//down
        y = y + 10;
        doc.setFontSize(10);
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.text("Índice", 12, (y + 7));
        doc.line(25, y, 25, (y + 10));//right
        doc.text("Tarea", 65, (y + 7));
        doc.line(115, y, 115, (y + 10));//right
        doc.text("Acciones", 145, (y + 7));
        doc.line(9, (y + 10), 199, (y + 10));//down
        y = y + 10;

        doc.setFontSize(9);
        doc.setFont("arial", "normal");
        var valorG: number = 0;
        var valorN: number;
        var valorA: number;
        var lineaTarea;
        var lineaAcciones;
        var auxPrueba: number = 0;
        for (var j = 0; j < plan.listIntervalo[i].listTareas.length; j++) {
          lineaTarea = doc.splitTextToSize(plan.listIntervalo[i].listTareas[j].tarea.nombre, (85));
          var unionAcciones = "";
          for (var z = 0; z < plan.listIntervalo[i].listTareas[j].listTareaAccion.length; z++) {
            if (z != 0)
              unionAcciones = unionAcciones + ", " + plan.listIntervalo[i].listTareas[j].listTareaAccion[z].accion.nombre;
            else unionAcciones = plan.listIntervalo[i].listTareas[j].listTareaAccion[z].accion.nombre;
          }
          lineaAcciones = doc.splitTextToSize(unionAcciones, (80));
          valorN = (3 * lineaTarea.length) + 4;
          valorA = (3 * lineaAcciones.length) + 4;

          if (valorN > valorA)
            valorG = valorN;
          else valorG = valorA;

          y = y + valorG;

          if (y > 265) {
            doc.addPage();
            doc.setFontSize(10);
            doc.setFont("arial", "bold")
            y = 15;
            doc.line(9, y, 199, y);//up
            doc.line(9, y, 9, (y + 10));//left
            doc.line(199, y, 199, (y + 10));//right
            doc.line(9, (y + 10), 199, (y + 10));//down

            doc.text("Índice", 12, (y + 7));
            doc.line(25, y, 25, (y + 10));//right
            doc.text("Tarea", 65, (y + 7));
            doc.line(115, y, 115, (y + 10));//right
            doc.text("Acciones", 145, (y + 7));
            doc.line(9, (y + 10), 199, (y + 10));//down

            y = y + 10 + valorG;
            doc.setFontSize(9);
            doc.setFont("arial", "normal");
          }

          doc.line(9, (y - valorG), 9, y);//left
          doc.text((i + 1) + "." + (j + 1), 14, (y - ((valorG - 3) / 2)));
          doc.line(25, (y - valorG), 25, y);//right
          auxPrueba = Number((valorG - (3 * lineaTarea.length + (3 * (lineaTarea.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
          doc.text(lineaTarea, 28, (y - valorG + auxPrueba));
          doc.line(115, (y - valorG), 115, y);//right
          auxPrueba = Number((valorG - (3 * lineaAcciones.length + (3 * (lineaAcciones.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
          doc.text(lineaAcciones, 118, (y - valorG + auxPrueba));
          doc.line(199, (y - valorG), 199, y);//right
          doc.line(9, y, 199, y);//down
        }
      }

    }
    /*doc.setFontSize(8);
    doc.setFont("arial", "normal");
    y = y + 10;

    var valorG: number = 0;
    var valorD: number;
    var valorO: number;
    var lineaDescripcion;
    var lineaObservacion;
    var auxPrueba: number;

    for (var i = 0; i < orden.listMaterialesO.length; i++) {
      lineaDescripcion = doc.splitTextToSize(orden.listMaterialesO[i].inventario.nombre, (65));
      lineaObservacion = doc.splitTextToSize(orden.listMaterialesO[i].observacion, (50));
      valorD = (3 * lineaDescripcion.length) + 4;
      valorO = (3 * lineaObservacion.length) + 4;

      if (valorD > valorO)
        valorG = valorD;
      else valorG = valorO;

      y = y + valorG;

      if (y > 265) {
        doc.addPage();
        doc.setFontSize(11);
        doc.setFont("arial", "bold")
        y = 15;
        doc.line(9, y, 199, y);//up
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.line(9, (y + 10), 199, (y + 10));//down

        doc.text("Código", 20, (y + 7));
        doc.line(55, y, 55, (y + 10));//right
        doc.text("Cantidad", 60, (y + 7));
        doc.line(80, y, 80, (y + 10));//right
        doc.text("Descripción", 100, (y + 7));
        doc.line(145, y, 145, (y + 10));//right
        doc.text("Observación", 165, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, (y - valorG), 9, y);//left
      doc.text(orden.listMaterialesO[i].inventario.codigo, 15, (y - ((valorG - 3) / 2)));
      doc.line(55, (y - valorG), 55, y);//right
      doc.text(orden.listMaterialesO[i].cantidad.toString(), 70, (y - ((valorG - 3) / 2)));
      doc.line(80, (y - valorG), 80, y);//right

      auxPrueba = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
      doc.text(lineaDescripcion, 85, (y - valorG + auxPrueba));
      doc.line(145, (y - valorG), 145, y);//right
      auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
      doc.text(lineaObservacion, 150, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    if (y >= 270) {
      doc.addPage();
      doc.setLineWidth(0.4);
      y = 40;
    } else y = 275;
    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.bodeguero, 25, y + 5);

    if (orden.tipoOrden == "Trabajo Interno") {
      doc.line(81, y, 126, y);//Firma2
      doc.text("Firma de Área", 87, y + 5);
    }
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + orden.personaResponsable, 146, y + 5); */
    doc.save("Plan#" + plan.idPlanMantenimiento + ".pdf");
  }
}
