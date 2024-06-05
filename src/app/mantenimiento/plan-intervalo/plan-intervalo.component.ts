import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PlanMantenimientoService } from 'src/app/shared/mantenimiento/plan-mantenimiento.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { IntervaloService } from 'src/app/shared/mantenimiento/intervalo.service';
import { cPlanMantenimiento, cIntervalo, cEventoMediciones, cIntervaloTarea, cEvento, cMedicion, cAccion, cTarea, cTareaAcciones, cAuxIT } from 'src/app/shared/mantenimiento/cManModel.model';
import { NgForm } from '@angular/forms';
import { EventoService } from 'src/app/shared/mantenimiento/evento.service';
import { MedicionService } from 'src/app/shared/mantenimiento/medicion.service';
import { TareaService } from 'src/app/shared/mantenimiento/tarea.service';
import { AccionService } from 'src/app/shared/mantenimiento/accion.service';
import Swal from 'sweetalert2';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';

@Component({
  selector: 'app-plan-intervalo',
  templateUrl: './plan-intervalo.component.html',
  styles: [],
  encapsulation: ViewEncapsulation.None
})
export class PlanIntervaloComponent implements OnInit {

  planMantenimientoId: number;
  datoPlanMantenimientoIn: cPlanMantenimiento;
  ListIntervalosIn: cIntervalo[] = [];
  ListIntervalosCopy: cIntervalo[] = [];

  newListEventoMediciones: cEventoMediciones[] = [];
  newListEventoMedicionesCopy: cEventoMediciones[] = [];
  newListIntervaloTarea: cIntervaloTarea[] = [];
  newListIntervaloTareaCopy: cIntervaloTarea[] = [];

  oldListIntervaloTarea: cAuxIT[] = [];

  eventoListFiltro: cEvento[] = [];

  ListMedicionIn: cMedicion[] = [];
  ListTareaIn: cTarea[];
  tareaNewFiltro: cTarea[] = [];
  tareaOldFiltro: cTarea[] = [];
  ListAccionIn: cAccion[];


  okAddNewEM: boolean = true;
  okDisabledNewEM2: boolean = false;
  okNumValorEntero: boolean = true;
  okAddNewIT: boolean = true;
  okPlus: boolean = false;

  /**Para pagination */
  startIndex: number = 0;
  endIndex: number = 5;
  selectPagination: number = 2;
  pagActualIndex: number = 0;
  siguienteBlock: boolean = false;
  anteriorBlock: boolean = true;
  pagTotal: any[] = [];

  okAyuda: boolean = false;
  /**Fin paginatacion */
  internetStatus: string = 'nline';
  okGuardado: boolean = false;
  spinnerOnOff: boolean = true;

  constructor(public planMantenimientoService: PlanMantenimientoService, public intervaloService: IntervaloService,
    public eventoService: EventoService, public medicionService: MedicionService,
    public tareaService: TareaService, public accionService: AccionService,
    private mConexionService: MenuConexionService,
    private toastr: ToastrService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.eventoService.msg$.subscribe(mensajeE => {
      this.eventoListFiltro.push(mensajeE);
      this.toastr.success('Ingreso satisfactorio', 'Registro de Evento');
    });

    this.tareaService.msg$.subscribe(mensajeT => {
      this.ListTareaIn.push(mensajeT);
      this.ListTareaIn[this.ListTareaIn.length - 1].ocultarSelect = false;
      this.tareaNewFiltro.push(mensajeT);
      this.tareaNewFiltro[this.tareaNewFiltro.length - 1].ocultarSelect = false;
      for (var i = 0; i < this.oldListIntervaloTarea.length; i++) {
        this.oldListIntervaloTarea[i].listTareasFiltradas.push(mensajeT);
        this.oldListIntervaloTarea[i].listTareasFiltradas[this.oldListIntervaloTarea[i].listTareasFiltradas.length - 1].ocultarSelect = false;
      }

      this.toastr.success('Ingreso satisfactorio', 'Registro de Tarea');
    });

    this.medicionService.msg$.subscribe(mensajeM => {
      this.ListMedicionIn.push(mensajeM);
      this.toastr.success('Ingreso satisfactorio', 'Registro de Medición');
    });

    this.accionService.msg$.subscribe(mensajeA => {
      this.ListAccionIn.push(mensajeA);
      this.toastr.success('Ingreso satisfactorio', 'Registro de Acción');
    });

    this.resetForm();
    this.cargarNewMediciones();
    this.cargarNewTareas();
    this.cargarNewAcciones();
    this.cargarIntervalos();
    this.onNewEventoMedicion();
    this.onNewIntervaloTarea();
  }

  cargarNewMediciones() {
    this.medicionService.getMediciones()
      .subscribe(list => {
        for (var i = 0; i < list.length; i++) {
          if (list[i].idMedicionM != 5 && list[i].idMedicionM != 6 && list[i].idMedicionM != 7)
            this.ListMedicionIn.push(list[i])
        }
      },
        error => console.error(error));
  }

  cargarNewTareas() {
    this.tareaService.getTareas()
      .subscribe(list => {
        this.ListTareaIn = list;
        this.tareaNewFiltro = JSON.parse(JSON.stringify(this.ListTareaIn));
        this.tareaNewFiltro = this.filtroNewTareas(this.tareaNewFiltro);
      },
        error => console.error(error));
  }

  cargarNewAcciones() {
    this.accionService.getAcciones()
      .subscribe(list => this.ListAccionIn = list,
        error => console.error(error));
  }

  cargarIntervalos() {
    this.activatedRoute.params.subscribe(params => {
      this.planMantenimientoId = params["id"];
      this.eventoService.getEventos()
        .subscribe(list => {
          this.eventoListFiltro = list
          this.planMantenimientoService.getPlanMantenimiento(this.planMantenimientoId.toString())
            .subscribe(plan => {
              this.datoPlanMantenimientoIn = plan;
              this.ListIntervalosIn = this.datoPlanMantenimientoIn.listIntervalo;
              this.filtroAcciones();
              this.ListIntervalosCopy = JSON.parse(JSON.stringify(this.ListIntervalosIn));
              for (var i = 0; i < this.ListIntervalosIn.length; i++) {
                var auxOldFinal: cAuxIT = {
                  listIntTareas: [],
                  listTareasFiltradas: [],
                  okAddOldIT: true,
                  okUpdateIT: true,
                  okPlus: false
                }
                this.oldListIntervaloTarea.push(auxOldFinal);
                var list: cTarea[] = JSON.parse(JSON.stringify(this.ListTareaIn));
                list = this.filtroNewTareas(list);
                for (var k = 0; k < this.ListIntervalosIn[i].listTareas.length; k++) {
                  if (list.find(x => x.idTareaM == this.ListIntervalosIn[i].listTareas[k].tareaId) != undefined)
                    list[list.findIndex(x => x.idTareaM == this.ListIntervalosIn[i].listTareas[k].tareaId)].ocultarSelect = true;
                }
                this.oldListIntervaloTarea[this.oldListIntervaloTarea.length - 1].listTareasFiltradas = JSON.parse(JSON.stringify(list));//para hacer una deep copy sin referncia
              }
              this.filtroNewEventos(this.ListIntervalosIn);
              this.getNumberIndex(this.ListIntervalosIn.length);
              this.updateIndex(0);
              this.spinnerOnOff = false;
            },
              error => console.error(error));
        },
          error => console.error(error));
    })
  }

  //Listo
  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.intervaloService.formData = {
      estadoActivado: true,
      planMantenimientoId: null,
      listEventoMediciones: [],
      listTareas: []
    }
  }

  /**Para la Parte de Paginacion */
  //Listo 
  updateSelect(control:any) {
    this.selectPagination = control.value;
    this.getNumberIndex(this.ListIntervalosIn.length);
    this.updateIndex(0);
  }

  //Listo
  getNumberIndex(n: number) {
    this.pagTotal = [];
    const aux = n / this.selectPagination;
    var auxEntera = Number(aux);
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

  //Listo
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

  /**Fin Paginacion */
  //Listo
  filtroNewEventos(list: cIntervalo[]) {
    for (var k = 0; k < list.length; k++) {
      for (var i = 0; i < list[k].listEventoMediciones.length; i++) {
        if (this.eventoListFiltro.find(x => x.idEventoM == list[k].listEventoMediciones[i].eventoId && x.isUnique) != undefined)
          this.eventoListFiltro.splice(this.eventoListFiltro.findIndex(x => x.idEventoM == list[k].listEventoMediciones[i].eventoId && x.isUnique), 1)
      }
    }
    for (var i = 0; i < this.eventoListFiltro.length; i++) {
      this.eventoListFiltro[i].ocultarSelect = false;
    }
  }

  //Listo
  filtroNewTareas(list: cTarea[]) {
    for (var i = 0; i < list.length; i++) {
      list[i].ocultarSelect = false;
    }
    return list;
  }

  /**Para la Parte de new List EM */
  //Listo
  updateSelectEvento(indice:number, control:any) {
    this.newListEventoMediciones[indice].eventoId = Number(this.newListEventoMediciones[indice].eventoId);
    if (this.eventoListFiltro[control.selectedIndex - 1].isUnique) {
      this.newListEventoMediciones[indice].valor = -1;
      this.newListEventoMediciones[indice].medicionId = 7;
      this.eventoListFiltro[control.selectedIndex - 1].ocultarSelect = true;
      this.okDisabledNewEM2 = true;
    } else {
      this.newListEventoMediciones[indice].valor = null;
      this.newListEventoMediciones[indice].medicionId = null;
      this.okDisabledNewEM2 = false;
      for (var i = 0; i < this.eventoListFiltro.length; i++) {
        if (this.eventoListFiltro[i].idEventoM == 1 || this.eventoListFiltro[i].idEventoM == 2) {
          this.eventoListFiltro[i].ocultarSelect = true;
        }
      }
    }
  }

  //Listo
  updateSelectMedicion(indice:number) {
    this.newListEventoMediciones[indice].medicionId = Number(this.newListEventoMediciones[indice].medicionId);
    if (this.newListEventoMediciones[indice].medicionId != 5 && this.newListEventoMediciones[indice].medicionId != 6) {
      this.okNumValorEntero = true;
    } else this.okNumValorEntero = false;
    this.comprobarNewEM();
  }

  //Listo
  onNewEventoMedicion() {
    if (!this.okDisabledNewEM2) {
      if (this.comprobarNewEM()) {
        var aux: cEventoMediciones = {
          eventoId: null,
          medicionId: null,
          valor: null
        }
        this.newListEventoMediciones.push(aux);
        this.newListEventoMedicionesCopy.push(JSON.parse(JSON.stringify(aux)));
      }
    }
  }

  //Listo
  onResetNew() {
    this.resetForm();
    for (var i = 0; i < this.eventoListFiltro.length; i++) {
      this.eventoListFiltro[i].ocultarSelect = false;
    }
    this.tareaNewFiltro = this.filtroNewTareas(this.tareaNewFiltro);
    this.okDisabledNewEM2 = false;
    this.newListEventoMediciones = [];
    this.newListIntervaloTarea = [];
    this.newListEventoMedicionesCopy = [];
    this.newListIntervaloTareaCopy = [];
    this.onNewEventoMedicion();
    this.onNewIntervaloTarea();
  }

  //Listo
  onRemoveNewEM(indiceEM:number) {
    var auxNewEventoM: cEventoMediciones[] = [];
    if (this.newListEventoMediciones.length > 1) {
      this.newListEventoMediciones.splice(indiceEM, 1);
      auxNewEventoM = JSON.parse(JSON.stringify(this.newListEventoMediciones));
      this.newListEventoMediciones = [];
      this.newListEventoMediciones = JSON.parse(JSON.stringify(auxNewEventoM));
      this.comprobarNewEM();
    }
  }

  //Listo
  comprobarNewEM() {
    var flag = true;
    if (this.newListEventoMediciones.find(x => x.eventoId == null || x.medicionId == null || x.valor == null) != undefined) {
      flag = false;
    }
    this.okAddNewEM = flag;
    return (flag);
  }

  /**Fin new List EM */

  /**Para la Parte de new List TA */
  //Listo
  onNewIntervaloTarea() {
    if (this.comprobarNewIT()) {
      var aux: cIntervaloTarea = {
        tareaId: null,
        estadoActivado: true,
        listTareaAccion: [],
        disabledSelectTA: true,
      }
      this.newListIntervaloTarea.push(aux);
      this.newListIntervaloTareaCopy.push(JSON.parse(JSON.stringify(aux)));
    }
  }

  //Listo
  comprobarNewIT() {
    var flag = true;
    if (this.newListIntervaloTarea.find(x => x.tareaId == null || x.listTareaAccion == null) != undefined)
      flag = false;
    this.okAddNewIT = flag;
    return (flag);
  }

  //Listo
  updateSelectTarea(indice:number) {
    this.newListIntervaloTarea[indice].tareaId = Number(this.newListIntervaloTarea[indice].tareaId);
    this.newListIntervaloTarea[indice].listTareaAccion = null;
    this.newListIntervaloTarea[indice].disabledSelectTA = false;
    this.comprobarSelectTarea();
  }

  //Listo
  comprobarSelectTarea() {
    for (var i = 0; i < this.tareaNewFiltro.length; i++) {
      if (this.newListIntervaloTarea.find(x => x.tareaId == this.tareaNewFiltro[i].idTareaM) == undefined)
        this.tareaNewFiltro[i].ocultarSelect = false;
      else this.tareaNewFiltro[i].ocultarSelect = true;
    }
  }

  //Listo
  onRemoveNewIT(indiceIT:number) {
    var auxNewIT: cIntervaloTarea[] = [];
    if (this.newListIntervaloTarea.length > 1) {
      this.newListIntervaloTarea.splice(indiceIT, 1);
      auxNewIT = JSON.parse(JSON.stringify(this.newListIntervaloTarea));
      this.newListIntervaloTarea = [];
      this.newListIntervaloTarea = JSON.parse(JSON.stringify(auxNewIT));
      this.comprobarNewIT();
      this.comprobarSelectTarea();
    }
  }

  /**Fin new List TA */

  /**Para la Parte de new Intervalo */
  //Listo
  onSubmitIntNew(form: NgForm) {
    if (this.internetStatus == "nline") {
      this.intervaloService.formData.planMantenimientoId = this.datoPlanMantenimientoIn.idPlanMantenimiento;
      for (var i = 0; i < this.newListEventoMediciones.length; i++) {
        if (this.newListEventoMediciones[i].valor == -1) {
          this.newListEventoMediciones[i].valor = null;
          if (this.newListEventoMediciones[i].eventoId == 2)
            this.newListEventoMediciones[i].valor = 3;
        }
        this.intervaloService.formData.listEventoMediciones.push(this.newListEventoMediciones[i]);
      }

      var auxTA: cTareaAcciones;
      var auxNombres:any[] = [];
      for (var i = 0; i < this.newListIntervaloTarea.length; i++) {
        auxNombres = [];
        for (var j = 0; j < this.newListIntervaloTarea[i].listTareaAccion.length; j++) {
          auxNombres.push(this.newListIntervaloTarea[i].listTareaAccion[j]);
        }
        this.newListIntervaloTarea[i].listTareaAccion = [];
        for (var k = 0; k < auxNombres.length; k++) {
          auxTA = {
            accionId: Number(this.ListAccionIn[this.ListAccionIn.findIndex(x => x.nombre == auxNombres[k])].idAccionM),
            estadoActivado: true,
            estado: 1
          }
          this.newListIntervaloTarea[i].listTareaAccion.push(auxTA);
        }
        this.intervaloService.formData.listTareas.push(this.newListIntervaloTarea[i]);
      }

      this.intervaloService.insertarIntervalo(this.intervaloService.formData).subscribe(
        res => {
          this.toastr.success('Ingreso satisfactorio', 'Registro de Intervalos del Plan de Mantenimiento');
          this.intervaloService.getIntervalo(res.idIntervaloM).subscribe(inter => {
            this.ListIntervalosIn.push(inter);
            this.filtroAcciones(this.ListIntervalosIn.length - 1);
            this.ListIntervalosCopy.push(JSON.parse(JSON.stringify(this.ListIntervalosIn[this.ListIntervalosIn.length - 1])));

            var auxOldFinal: cAuxIT = {
              listIntTareas: [],
              listTareasFiltradas: [],
              okAddOldIT: true,
              okUpdateIT: true,
              okPlus: false
            }
            this.oldListIntervaloTarea.push(auxOldFinal);
            var list = this.filtroNewTareas(this.ListTareaIn);
            for (var k = 0; k < this.ListIntervalosIn[this.ListIntervalosIn.length - 1].listTareas.length; k++) {
              for (var j = 0; j < list.length; j++) {
                if (this.ListIntervalosIn[this.ListIntervalosIn.length - 1].listTareas[k].tareaId == list[j].idTareaM) {
                  list[j].ocultarSelect = true;
                }
              }
            }
            this.oldListIntervaloTarea[this.oldListIntervaloTarea.length - 1].listTareasFiltradas = JSON.parse(JSON.stringify(list));//para hacer una deep copy sin referncia

            this.onResetNew();
            this.filtroNewEventos(this.ListIntervalosIn);

            this.getNumberIndex(this.ListIntervalosIn.length);
            this.updateIndex(this.pagTotal.length - 1);
          },
            error => console.error(error));
        },
        err => {
          console.log(err);
        }
      )
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

  /**Fin new Intervalo */

  /**Para la parte de old IT */

  //listo
  onOldIntervaloTarea(indiceInt: number) {
    if (this.comprobarOldIT(indiceInt)) {
      var auxOld: cIntervaloTarea = {
        intervaloId: this.ListIntervalosIn[indiceInt].idIntervaloM,
        tareaId: null,
        estadoActivado: true,
        listTareaAccion: [],
        disabledSelectTA: true
      }
      this.oldListIntervaloTarea[indiceInt].listIntTareas.push(auxOld);
    }
  }

  //Listo
  comprobarOldIT(indiceInt:number) {
    var flag = true;
    if (this.oldListIntervaloTarea[indiceInt].listIntTareas.find(x => x.tareaId == null || x.listTareaAccion == null) != undefined)
      flag = false;
    this.oldListIntervaloTarea[indiceInt].okAddOldIT = flag;
    this.oldListIntervaloTarea[indiceInt].okUpdateIT = flag;
    return (flag);
  }

  //Listo
  updateSelectOldTarea(indiceInt:number, indice2:number) {
    this.oldListIntervaloTarea[indiceInt].listIntTareas[indice2].tareaId = Number(this.oldListIntervaloTarea[indiceInt].listIntTareas[indice2].tareaId);
    this.oldListIntervaloTarea[indiceInt].listIntTareas[indice2].listTareaAccion = null;
    this.oldListIntervaloTarea[indiceInt].listIntTareas[indice2].disabledSelectTA = false;
    this.comprobarOldSelectTarea(indiceInt);
  }

  //Listo
  comprobarOldSelectTarea(indiceInt:number) {
    for (var i = 0; i < this.oldListIntervaloTarea[indiceInt].listTareasFiltradas.length; i++) {
      if (this.oldListIntervaloTarea[indiceInt].listIntTareas.find(x => x.tareaId == this.oldListIntervaloTarea[indiceInt].listTareasFiltradas[i].idTareaM) == undefined && this.ListIntervalosIn[indiceInt].listTareas.find(x => x.tareaId == this.oldListIntervaloTarea[indiceInt].listTareasFiltradas[i].idTareaM) == undefined)
        this.oldListIntervaloTarea[indiceInt].listTareasFiltradas[i].ocultarSelect = false;
      else this.oldListIntervaloTarea[indiceInt].listTareasFiltradas[i].ocultarSelect = true;
    }
  }

  //Listo
  actualizarOldIT(indiceInt:number) {
    if (this.internetStatus == "nline") {
      var listNewOldIntervalo: cIntervalo = JSON.parse(JSON.stringify(this.ListIntervalosIn[indiceInt]));
      if (this.comprobarOldIT(indiceInt)) {
        if (JSON.stringify(this.ListIntervalosIn[indiceInt]) != JSON.stringify(this.ListIntervalosCopy[indiceInt])) {
          for (var i = 0; i < listNewOldIntervalo.listTareas.length; i++) {
            var auxIndexTa;
            if (listNewOldIntervalo.listTareas[i].listAccionEliminadas.length > 0) {
              var auxTA: cTareaAcciones;
              var auxNombres:any[] = [];
              var auxIntervaloTareaId = listNewOldIntervalo.listTareas[i].idIntervaloTarea;
              for (var j = 0; j < listNewOldIntervalo.listTareas[i].listAccionEliminadas.length; j++) {
                auxNombres.push(listNewOldIntervalo.listTareas[i].listAccionEliminadas[j]);
              }
              for (var k = 0; k < auxNombres.length; k++) {
                auxTA = {
                  intervaloTareaId: auxIntervaloTareaId,
                  accionId: Number(this.ListAccionIn[this.ListAccionIn.findIndex(x => x.nombre == auxNombres[k])].idAccionM),
                  estadoActivado: true,
                  estado: 0
                }
                auxIndexTa = listNewOldIntervalo.listTareas[i].listTareaAccion.findIndex(x => x.accionId == auxTA.accionId && x.intervaloTareaId == auxTA.intervaloTareaId);
                auxTA.idTareaAccion = this.ListIntervalosCopy[indiceInt].listTareas[i].listTareaAccion[auxIndexTa].idTareaAccion;
                auxTA.estadoActivado = this.ListIntervalosCopy[indiceInt].listTareas[i].listTareaAccion[auxIndexTa].estadoActivado;
                listNewOldIntervalo.listTareas[i].listTareaAccion.splice(auxIndexTa, 1);
                listNewOldIntervalo.listTareas[i].listTareaAccion.push(auxTA);
              }
            }
            if (listNewOldIntervalo.listTareas[i].listAccionAdicionales.length > 0) {
              var auxTA: cTareaAcciones;
              var auxNombres = [];
              var auxIntervaloTareaId = listNewOldIntervalo.listTareas[i].idIntervaloTarea;
              for (var j = 0; j < listNewOldIntervalo.listTareas[i].listAccionAdicionales.length; j++) {
                auxNombres.push(listNewOldIntervalo.listTareas[i].listAccionAdicionales[j]);
              }
              for (var k = 0; k < auxNombres.length; k++) {
                auxTA = {
                  intervaloTareaId: auxIntervaloTareaId,
                  accionId: Number(this.ListAccionIn[this.ListAccionIn.findIndex(x => x.nombre == auxNombres[k])].idAccionM),
                  estadoActivado: true,
                  estado: 1
                }
                listNewOldIntervalo.listTareas[i].listTareaAccion.push(auxTA);
              }
            }
            if (listNewOldIntervalo.listTareas[i].listTareaAccion.find(x => x.estadoActivado == true && x.estado == 1) == undefined)
              listNewOldIntervalo.listTareas[i].estadoActivado = false;
          }
        }
        if (this.oldListIntervaloTarea[indiceInt].listIntTareas.length > 0) {
          var auxTA: cTareaAcciones;
          var auxNombres = [];
          for (var i = 0; i < this.oldListIntervaloTarea[indiceInt].listIntTareas.length; i++) {
            auxNombres = [];
            for (var j = 0; j < this.oldListIntervaloTarea[indiceInt].listIntTareas[i].listTareaAccion.length; j++) {
              auxNombres.push(this.oldListIntervaloTarea[indiceInt].listIntTareas[i].listTareaAccion[j]);
            }
            this.oldListIntervaloTarea[indiceInt].listIntTareas[i].listTareaAccion = [];
            for (var k = 0; k < auxNombres.length; k++) {
              auxTA = {
                accionId: Number(this.ListAccionIn[this.ListAccionIn.findIndex(x => x.nombre == auxNombres[k])].idAccionM),
                estadoActivado: true,
                estado: 1
              }
              this.oldListIntervaloTarea[indiceInt].listIntTareas[i].listTareaAccion.push(auxTA);
            }
            listNewOldIntervalo.listTareas.push(this.oldListIntervaloTarea[indiceInt].listIntTareas[i]);
          }
        }
        if (listNewOldIntervalo.listTareas.find(x => x.estadoActivado == true) == undefined)
          listNewOldIntervalo.estadoActivado = false;
        this.intervaloService.actualizarIntervalo(listNewOldIntervalo).subscribe(
          res => {
            this.toastr.success('Edición satisfactorio', 'Registro de Intervalos del Plan de Mantenimiento');
            this.intervaloService.getIntervalo(res.idIntervaloM).subscribe(inter => {
              this.ListIntervalosIn[indiceInt] = inter;
              this.filtroAcciones(indiceInt);
              this.ListIntervalosCopy[indiceInt] = JSON.parse(JSON.stringify(this.ListIntervalosIn[indiceInt]));
              this.oldListIntervaloTarea[indiceInt].listIntTareas = [];
              this.comprobarOldSelectTarea(indiceInt);
            },
              error => console.error(error));
          },
          err => {
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
  cancelarOldIT(indiceInt:number) {
    if ((JSON.stringify(this.ListIntervalosIn[indiceInt]) != JSON.stringify(this.ListIntervalosCopy[indiceInt])) || (this.oldListIntervaloTarea[indiceInt].listIntTareas.length > 0)) {
      this.ListIntervalosIn[indiceInt] = JSON.parse(JSON.stringify(this.ListIntervalosCopy[indiceInt]));
      this.oldListIntervaloTarea[indiceInt].listIntTareas = [];
      this.comprobarOldSelectTarea(indiceInt);
      this.comprobarOldIT(indiceInt);
    }
  }

  //Listo
  onRemoveOldIT(indiceInt:number, indiceOld:number) {
    var auxOldIt: cIntervaloTarea[] = [];
    var auxIdTareaM = this.oldListIntervaloTarea[indiceInt].listIntTareas[indiceOld].tareaId;
    this.oldListIntervaloTarea[indiceInt].listIntTareas.splice(indiceOld, 1);
    auxOldIt = JSON.parse(JSON.stringify(this.oldListIntervaloTarea[indiceInt].listIntTareas));
    this.oldListIntervaloTarea[indiceInt].listIntTareas = [];
    this.oldListIntervaloTarea[indiceInt].listIntTareas = JSON.parse(JSON.stringify(auxOldIt));
    if (auxIdTareaM != undefined)
      this.oldListIntervaloTarea[indiceInt].listTareasFiltradas.find(y => y.idTareaM == auxIdTareaM).ocultarSelect = false;
    this.comprobarOldIT(indiceInt);
  }

  /**Fin la parte de old IT */

  //Listo
  filtroAcciones(indiceInt?: number) {
    var auxInicio = 0;
    var auxFin = this.ListIntervalosIn.length;
    var auxP: cAccion[];
    var auxD: cAccion[];
    if (indiceInt != undefined) {
      auxInicio = indiceInt;
      auxFin = indiceInt + 1;
    }
    for (var i = auxInicio; i < auxFin; i++) {
      for (var j = 0; j < this.ListIntervalosIn[i].listTareas.length; j++) {
        auxP = [];
        auxD = [];
        for (var k = 0; k < this.ListAccionIn.length; k++) {
          if (this.ListIntervalosIn[i].listTareas[j].listTareaAccion.find(x => x.accionId == this.ListAccionIn[k].idAccionM) != undefined)
            auxD.push(this.ListAccionIn[k]);
          else
            auxP.push(this.ListAccionIn[k]);

        }
        this.ListIntervalosIn[i].listTareas[j].listFiltroAccionP = auxP;
        this.ListIntervalosIn[i].listTareas[j].listFiltroAccionD = auxD;
        this.ListIntervalosIn[i].listTareas[j].listAccionAdicionales = [];
        this.ListIntervalosIn[i].listTareas[j].listAccionEliminadas = [];
      }
    }
  }

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (JSON.stringify(this.newListEventoMediciones) == JSON.stringify(this.newListEventoMedicionesCopy) && JSON.stringify(this.newListIntervaloTarea) == JSON.stringify(this.newListIntervaloTareaCopy) && this.onComprobarcambiosIntervalos()) {
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

  onComprobarcambiosIntervalos() {
    var flag: boolean = true;
    for (var i = 0; i < this.ListIntervalosIn.length; i++) {
      if ((JSON.stringify(this.ListIntervalosIn[i]) != JSON.stringify(this.ListIntervalosCopy[i])) || (this.oldListIntervaloTarea[i].listIntTareas.length > 0)) {
        flag = false;
      }
    }
    return flag
  }
}