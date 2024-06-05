import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { MaquinariaService } from 'src/app/shared/maquinaria/maquinaria.service';
import { NgForm } from '@angular/forms';
import { cMaquinaria, cDetalleFichaM, cIdentidadM, cItem, cDetalleCollect, cSelectorObejos } from 'src/app/shared/maquinaria/cMaquinaria.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MaquinariaItemsComponent } from '../maquinaria-items/maquinaria-items.component';
import { MaquinariaItembaseComponent } from '../maquinaria-itembase/maquinaria-itembase.component';
import { PlanMantenimientoService } from 'src/app/shared/mantenimiento/plan-mantenimiento.service';
import { cPlanMantenimiento } from 'src/app/shared/mantenimiento/cManModel.model';
import { PuedeDesactivar } from 'src/app/auth/can-deactive.guard';
import Swal from 'sweetalert2';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { ItemService } from 'src/app/shared/maquinaria/item.service';
import { auxBarcoSelect, cBarcoMaquinarias } from 'src/app/shared/barco.model';
import { BarcoService } from 'src/app/shared/barco.service';

@Component({
  selector: 'app-maquinaria-form',
  templateUrl: './maquinaria-form.component.html',
  styles: []
})
export class MaquinariaFormComponent implements OnInit, PuedeDesactivar {
  public get maquinariaService(): MaquinariaService {
    return this._maquinariaService;
  }
  public set maquinariaService(value: MaquinariaService) {
    this._maquinariaService = value;
  }
  public get mConexionService(): MenuConexionService {
    return this._mConexionService;
  }
  public set mConexionService(value: MenuConexionService) {
    this._mConexionService = value;
  }

  constructor(private _maquinariaService: MaquinariaService, public BarcoService: BarcoService, public planMantenimiento: PlanMantenimientoService, private dialog: MatDialog, private toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute, private _mConexionService: MenuConexionService, private itemService: ItemService) { }

  modoEdicion: boolean = false;

  strFecha: string = "";
  objetoIdBase: string= null;
  isCheck:boolean=false;
  filtroValor = '';
  spinnerOnOff: boolean = false;
  detalleFichaObligatorio: cDetalleFichaM[] = [];

  listMaquinariaIn: cSelectorObejos[] = [];
  listBarco: auxBarcoSelect[] = [];
  listSelectedBarco: any[] = [];
  listPlanesMIn: cPlanMantenimiento[];

  listIdentidadMostrar: cIdentidadM[] = [];

  autoFocus: boolean = false;
  maquinariaInCopy: cMaquinaria;
  internetStatus: string = 'nline';
  okGuardado: boolean = false;
  okAddFicha: boolean = false;

  okAyuda: boolean = false;
  resultBusquedaMostrar: cDetalleFichaM[] = [];

  //listo
  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.fechaActual();

    if (this.mConexionService.UserR.rolAsignado == "admin" || this.mConexionService.UserR.rolAsignado == "adminMotor" || this.mConexionService.UserR.rolAsignado == "editorMotor") {
      this.cargarDataBarcos();
      this.cargarDataPlanesMList();
    }
    this.activatedRoute.params.subscribe(params => {
      if (params["id"] == undefined) {
        this.resetForm();
        if (this.mConexionService.UserR.rolAsignado == "admin" || this.mConexionService.UserR.rolAsignado == "adminMaquina" || this.mConexionService.UserR.rolAsignado == "editorMaquina")
          this.cargarDataIdentidad();
        else {
          this.maquinariaService.formData.tipoMaquinaria = "Motor Marino";
          this.cargarDataItem("Motor Marino");
        }
        this.maquinariaInCopy = JSON.parse(JSON.stringify(this.maquinariaService.formData));
        return;
      }
      this.modoEdicion = true;
      this.okAddFicha = true;
      this.spinnerOnOff = true;
      this.maquinariaService.getMaquina(params["id"].toString())
        .subscribe(list => {
          this.completarForm(list);
          this.spinnerOnOff = false;
        },
          error => this.router.navigate(["/maquinaria"]));
    })
  }

  getDataFiltro(data:cMaquinaria[], op: number) {//Para q la filtracion de datos se automatica
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

  cargarDataIdentidad() {
    this.maquinariaService.getIdentidadMaquina()
      .subscribe(listIdentidad => {
        if (this.mConexionService.UserR.rolAsignado == "admin")
          this.listIdentidadMostrar = listIdentidad;
        else
          for (var i = 0; i < listIdentidad.length; i++) {
            if (listIdentidad[i].nombre != "Motor Marino")
              this.listIdentidadMostrar.push(listIdentidad[i]);
          }
      },
        error => this.router.navigate(["/maquinaria"]));
  }

  cargarDataMaquinariaBase(tipo :string) {
    this.listMaquinariaIn = [];
    this.maquinariaService.getMaquinariasEspecifico(tipo)
      .subscribe(maquinariaDesdeWS => {
        for (var i = 0; i < maquinariaDesdeWS.length; i++) {
          var aux: cSelectorObejos = {
            idObjeto: maquinariaDesdeWS[i].idMaquina,
            nombreObjeto: maquinariaDesdeWS[i].modelo
          }
          if (maquinariaDesdeWS[i].tipoMaquinaria == this.maquinariaService.formData.tipoMaquinaria) {
            this.listMaquinariaIn.push(aux);
          }
        }
      },
        error => console.error(error));
  }

  cargarDataBarcos() {
    this.BarcoService.getBarcos()
      .subscribe(barcosDesdeWS => {
        var auxBarcoM: auxBarcoSelect;
        for (var i = 0; i < barcosDesdeWS.length; i++) {
          auxBarcoM = {
            idBarco: barcosDesdeWS[i].idBarco,
            nombre: barcosDesdeWS[i].nombre,
            disabledSelect: false
          }
          this.listBarco.push(auxBarcoM);
        }
      },
        error => console.error(error));
  }

  cargarDataPlanesMList() {
    this.planMantenimiento.getMantenimientos()
      .subscribe(list => { this.listPlanesMIn = list; },
        error => console.error(error));
  }

  //listo
  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.maquinariaService.formData = {
      tipoMaquinaria: null,
      marca: "",
      modelo: "",
      estado: 1,
      listdetalleFichaM: [],
      planMantenimientoId: -1,
      listBarcoMaquinaria: []
    }
  }
  //listo
  completarForm(list: cMaquinaria, form?: NgForm) {
    if (form == null) {
      this.maquinariaService.formData = {
        idMaquina: list.idMaquina,
        tipoMaquinaria: list.tipoMaquinaria,
        marca: list.marca,
        modelo: list.modelo,
        estado: list.estado,
        listdetalleFichaM: list.listdetalleFichaM,
        planMantenimientoId: list.planMantenimientoId,
        listBarcoMaquinaria: list.listBarcoMaquinaria
      }
    }
    if (this.maquinariaService.formData.planMantenimientoId == null)
      this.maquinariaService.formData.planMantenimientoId = -1;
    if (this.maquinariaService.formData.tipoMaquinaria == "Motor Marino")
      this.armarBarcoMaquinaria();
    this.armarFichaObligatoria();

  }

  armarBarcoMaquinaria() {
    this.listSelectedBarco = [];
    var auxBarco: auxBarcoSelect;
    if (this.maquinariaService.formData.listBarcoMaquinaria.length > 0) {
      for (var i = 0; i < this.maquinariaService.formData.listBarcoMaquinaria.length; i++) {
        this.maquinariaService.formData.listBarcoMaquinaria[i].controladorActivo=false;
        auxBarco = this.listBarco.find(x => x.idBarco == this.maquinariaService.formData.listBarcoMaquinaria[i].barcoId);
        if (this.listSelectedBarco.find(y => y == auxBarco.nombre) == null) {
          this.listSelectedBarco.push(auxBarco.nombre);
        }
        if (this.maquinariaService.formData.listBarcoMaquinaria[i].nombre != null && this.maquinariaService.formData.listBarcoMaquinaria[i].serie != null && this.maquinariaService.formData.listBarcoMaquinaria[i].checkMaquinaria)
          this.listBarco[this.listBarco.findIndex(x => x.idBarco == this.maquinariaService.formData.listBarcoMaquinaria[i].barcoId)].disabledSelect = true;
      }
    }
  }

  //listo
  cargarDataItem(op?:any) {
    this.okAddFicha = true;
    let auxTipoItems = op + "@false";
    if (op == null)
      auxTipoItems = this.maquinariaService.formData.tipoMaquinaria + "@false";
    this.detalleFichaObligatorio = [];
    this.itemService.getItemTipo(auxTipoItems)
      .subscribe(listItems => {
        var auxCollectionC: cDetalleCollect[];
        for (var i = 0; i < listItems.length; i++) {
          auxCollectionC = [];
          for (var j = 0; j < listItems[i].listItem_itemCategory.length; j++) {
            var auxCollection: cDetalleCollect = {
              itemCategoryId: listItems[i].listItem_itemCategory[j].itemCategoryId,
              categoryNombre: listItems[i].listItem_itemCategory[j].itemCategory.nombre,
              valor: 0,
              unidadId: null,
            }
            auxCollectionC.push(auxCollection);
          }
          var auxDetalle: cDetalleFichaM = {
            itemId: listItems[i].idItem,
            item: {
              nombre: listItems[i].nombre,
              magnitud: listItems[i].magnitud
            },
            listDetalleCollection: auxCollectionC,
            estado: 1
          }
          this.detalleFichaObligatorio.push(auxDetalle);
        }
        this.cargarDataMaquinariaBase(this.maquinariaService.formData.tipoMaquinaria);
      },
        error => console.error(error));
  }

  onSubmit() {
    if (this.internetStatus == "nline") {
      if (this.maquinariaService.formData.planMantenimientoId == -1)
        this.maquinariaService.formData.planMantenimientoId = null;

      for (var i = 0; i < this.maquinariaService.formData.listdetalleFichaM.length; i++) {
        if (this.maquinariaService.formData.listdetalleFichaM[i].idDetalleFichaM == null) {
          let aux: cDetalleFichaM = {
            itemId: this.maquinariaService.formData.listdetalleFichaM[i].itemId,
            estado: 1,
            listDetalleCollection: this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection
          }
          this.maquinariaService.formData.listdetalleFichaM.splice(i, 1, aux);
        }
      }

      for (var dato of this.detalleFichaObligatorio) {
        if (this.maquinariaService.formData.listdetalleFichaM.find(x => x.itemId == dato.itemId) == null) {
          let aux: cDetalleFichaM = { itemId: dato.itemId, estado: 1, listDetalleCollection: dato.listDetalleCollection }
          this.maquinariaService.formData.listdetalleFichaM.push(aux);
        } else
          this.maquinariaService.formData.listdetalleFichaM[this.maquinariaService.formData.listdetalleFichaM.findIndex(x => x.itemId == dato.itemId)].listDetalleCollection = dato.listDetalleCollection;
      }
      
      if (this.listSelectedBarco.length > 0 || this.maquinariaService.formData.listBarcoMaquinaria.length > 0) {
        var auxBarcoM: cBarcoMaquinarias;
        var auxBarco: auxBarcoSelect;
        for (var bms = 0; bms < this.listSelectedBarco.length; bms++) {
          if ((auxBarco = this.listBarco.find(x => x.nombre == this.listSelectedBarco[bms])) != null) {
            auxBarcoM = {
              barcoId: auxBarco.idBarco,
              checkMaquinaria: false,
              estado: 4,
              controladorActivo:true,
              nombreI:"/assets/img/imgDefecto.png"
            }
            if (this.modoEdicion)
              auxBarcoM.maquinariaId = this.maquinariaService.formData.idMaquina;
            if ((this.maquinariaService.formData.listBarcoMaquinaria.find(x => x.barcoId == auxBarcoM.barcoId)) == undefined) {
              this.maquinariaService.formData.listBarcoMaquinaria.push(auxBarcoM);
            } else this.maquinariaService.formData.listBarcoMaquinaria[this.maquinariaService.formData.listBarcoMaquinaria.findIndex(x => x.barcoId == auxBarcoM.barcoId)].controladorActivo=true;
          }
        }
        for(var i=0;i<this.maquinariaService.formData.listBarcoMaquinaria.length;i++){
          if(!this.maquinariaService.formData.listBarcoMaquinaria[i].controladorActivo){
            this.maquinariaService.formData.listBarcoMaquinaria[i].estado=0;
          }
        }
      }
      if (this.modoEdicion) {
        this.maquinariaService.actualizarMaquinaria(this.maquinariaService.formData).subscribe(
          (res: any) => {
            this.onSaveSuccess();
            this.toastr.success('Edición satisfactoria', 'Registro de Maquinaria');
          },
        )
      }
      else {
        this.maquinariaService.insertarMaquinaria(this.maquinariaService.formData).subscribe(
          (res: any) => {
            if (res.message == 'Ok') {
              this.onSaveSuccess();
              this.toastr.success('Ingreso satisfactorio', 'Registro de Maquinaria');
            }
            else {
              this.toastr.error('Modelo esta duplicado', 'Registro fallido.');
              this.maquinariaService.formData.modelo = null;
              this.autoFocus = !this.autoFocus;
            }
          },
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

  armarFichaObligatoria() {
    let auxTipoItems = this.maquinariaService.formData.tipoMaquinaria + "@false";
    this.detalleFichaObligatorio = [];
    this.itemService.getItemTipo(auxTipoItems)
      .subscribe(listItems => {
        var auxCollectionC: cDetalleCollect[];
        for (var i = 0; i < listItems.length; i++) {
          auxCollectionC = [];
          for (var j = 0; j < listItems[i].listItem_itemCategory.length; j++) {
            var auxCollection: cDetalleCollect = {
              itemCategoryId: listItems[i].listItem_itemCategory[j].itemCategoryId,
              categoryNombre: listItems[i].listItem_itemCategory[j].itemCategory.nombre,
              valor: 0,
              unidadId: null,
            }
            auxCollectionC.push(auxCollection);
          }
          var auxDetalle: cDetalleFichaM = {
            itemId: listItems[i].idItem,
            item: {
              nombre: listItems[i].nombre,
              magnitud: listItems[i].magnitud
            },
            listDetalleCollection: auxCollectionC,
            estado: 1
          }
          this.detalleFichaObligatorio.push(auxDetalle);
        }
        for (var i = 0; i < this.maquinariaService.formData.listdetalleFichaM.length; i++) {
          this.maquinariaService.formData.listdetalleFichaM[i].mostrar = true;
          for (var j = 0; j < this.detalleFichaObligatorio.length; j++) {
            if (this.maquinariaService.formData.listdetalleFichaM[i].itemId == this.detalleFichaObligatorio[j].itemId) {
              this.maquinariaService.formData.listdetalleFichaM[i].mostrar = false;
              for (var j2 = 0; j2 < this.detalleFichaObligatorio[j].listDetalleCollection.length; j2++) {
                for (var i2 = 0; i2 < this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection.length; i2++) {
                  if (this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection[i2].itemCategoryId == this.detalleFichaObligatorio[j].listDetalleCollection[j2].itemCategoryId)
                    this.detalleFichaObligatorio[j].listDetalleCollection[j2].unidadId = this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection[i2].unidadId;
                  this.detalleFichaObligatorio[j].listDetalleCollection[j2].valor = this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection[i2].valor;
                }
              }
            }
          }
          for (var k = 0; k < this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection.length; k++) {
            this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection[k].unidadSimbolo = this.maquinariaService.formData.listdetalleFichaM[i].item.magnitud.listUnidad.find(x => x.idUnidad == this.maquinariaService.formData.listdetalleFichaM[i].listDetalleCollection[k].unidadId).simbolo;
          }
        }
        this.maquinariaInCopy = JSON.parse(JSON.stringify(this.maquinariaService.formData));
      },
        error => console.error(error));
  }

  //Listo
  addEditOneDetalleFicha(idItem:number) {
    if (this.maquinariaService.formData.tipoMaquinaria != null) {
      if (this.internetStatus == "nline") {
        const dialoConfig = new MatDialogConfig();
        dialoConfig.autoFocus = true;
        dialoConfig.disableClose = true;
        dialoConfig.data = { idItem }
        this.dialog.open(MaquinariaItemsComponent, dialoConfig)
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
    } else this.okAddFicha = false;
  }

  addMultipleDetalleFicha() {
    if(this.objetoIdBase!=null&& this.isCheck){
      var idObj=this.objetoIdBase;
      if (this.internetStatus == "nline") {
        const dialoConfig = new MatDialogConfig();
        dialoConfig.autoFocus = true;
        dialoConfig.disableClose = false;
        dialoConfig.data = { idObj };
        this.dialog.open(MaquinariaItembaseComponent, dialoConfig)
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
  }

  deleteOneDetalleFicha(idItem:number) {
    for (var i = 0; i < this.maquinariaService.formData.listdetalleFichaM.length; i++) {
      if (this.maquinariaService.formData.listdetalleFichaM[i].itemId == idItem) {
        this.maquinariaService.formData.listdetalleFichaM[i].mostrar = false;
        this.maquinariaService.formData.listdetalleFichaM[i].estado = 0;
      }
    }
  }

  //listo
  onSaveSuccess() {
    this.okGuardado = true;
    this.router.navigate(["/maquinaria"]);
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

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (JSON.stringify(this.maquinariaService.formData) == JSON.stringify(this.maquinariaInCopy)) {
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
