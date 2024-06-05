import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ItemService } from '../shared/maquinaria/item.service';
import { ItemCategoryService } from '../shared/maquinaria/item-category.service';
import { NgForm } from '@angular/forms';
import { MagnitudService } from '../shared/magnitud.service';

import Swal from 'sweetalert2';
import { cItem, cItemCategory, cItem_itemCategory, cItem_identidad, cIdentidadM, cAuxOpcional } from '../shared/maquinaria/cMaquinaria.model';
import { PuedeDesactivar } from '../auth/can-deactive.guard';
import { MenuConexionService } from '../shared/otrosServices/menu-conexion.service';
import { MaquinariaService } from '../shared/maquinaria/maquinaria.service';
import { cMagnitud } from '../shared/basicos';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styles: []
})
export class ItemComponent implements OnInit, PuedeDesactivar {
  public get mConexionService(): MenuConexionService {
    return this._mConexionService;
  }
  public set mConexionService(value: MenuConexionService) {
    this._mConexionService = value;
  }

  modoEdicionItem: boolean = false;
  modoEdicionCategory: boolean = false;

  listItemIn: cItem[];
  listItemCategoryIn: cItemCategory[] = [];
  listItemCategoryCopy: cItemCategory[] = [];
  listItemItemCategoryIn: cItem_itemCategory[] = [];
  listIdentidadMostrar: cIdentidadM[] = [];

  listSelectedIdentidad: any[] = [];
  listSelectedIdentidad2: cAuxOpcional[] = [];
  listSelectedIdentidad3: any[] = [];
  listDelateIC: cItem_itemCategory[] = [];

  listMagnitudIn: cMagnitud[] = [];

  selectItem: cItem|null;
  selectCategory: cItemCategory|null;

  indiceEditItem: number|undefined;
  indiceEditCategory: number|undefined;

  itemInCopy: cItem;
  categortInCopy: cItemCategory;
  isCheckMotorItem: boolean;

  /**Parte de los show botones collapse */
  autoFocusItem: boolean = false;
  autoFocusCategory: boolean = false;
  showNewItem: boolean = false;
  showNewCategory: boolean = false;

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
  okAyuda:boolean=false;
  
  constructor(public _itemService: ItemService, public _itemCategoryService: ItemCategoryService, private magnitudService: MagnitudService, private toastr: ToastrService, private _mConexionService: MenuConexionService, private _maquinariaService: MaquinariaService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarDataItem();
    this.cargarDataItemCategory();
    this.cargarDataMagnitud();
    this.resetFormItem();
    this.cargarDataIdentidad();
    this.resetFormCategory();
  }

  //Listo
  cargarDataItem() {
    this._itemService.getItems().subscribe(itemDesdeWS => {
      this.listItemIn = [];
      var flag;
      if (this.mConexionService.UserR.rolAsignado == "adminMaquina" || this.mConexionService.UserR.rolAsignado == "editorMaquina") {
        for (var dato of itemDesdeWS) {
          flag = false;
          for (var datoI of dato.listItem_identidad)
            if (datoI.identidadM.nombre != "Motor")
              flag = true;
          if (flag)
            this.listItemIn.push(dato);
        }
      } else {
        if (this.mConexionService.UserR.rolAsignado == "adminMotor" || this.mConexionService.UserR.rolAsignado == "editorMotor") {
          for (var dato of itemDesdeWS) {
            flag = false;
            for (var datoI of dato.listItem_identidad)
              if (datoI.identidadM.nombre == "Motor Marino")
                flag = true;
            if (flag)
              this.listItemIn.push(dato);
          }
        } else this.listItemIn = itemDesdeWS;
      }
      this.apagarEncerder(this.listItemIn);
      this.getNumberIndex(this.listItemIn.length);
      this.updateIndex(0);
      if (this.selectItem != null && this.indiceEditItem != null) {
        this.selectItem = this.listItemIn[this.indiceEditItem];
        this.onFiltroItem(this.selectItem.listItem_itemCategory);
      }
    },
      error => console.error(error));
  }

  //Listo
  cargarDataItemCategory() {
    this._itemCategoryService.getItemCategories()
      .subscribe(itemCategoryDesdeWS => {
        this.listItemCategoryCopy = itemCategoryDesdeWS;
        this.listItemCategoryIn = [];
        for (var datoC of this.listItemCategoryCopy) {
          if (datoC.estado != 0)
            this.listItemCategoryIn.push(datoC);
        }
      },
        error => console.error(error));
  }

  //Listo
  cargarDataMagnitud() {
    this.magnitudService.getMagnitudes()
      .subscribe(listMaginitudDesdeWS => {
        for (var i = 0; i < listMaginitudDesdeWS.length; i++) {
          if (listMaginitudDesdeWS[i].listUnidad.length != 0)
            this.listMagnitudIn.push(listMaginitudDesdeWS[i]);
        }
      },
        error => console.error(error));
  }

  cargarDataIdentidad() {
    this._maquinariaService.getIdentidadMaquina()
      .subscribe(listIdentidad => {
        if (this.mConexionService.UserR.rolAsignado == "admin")
          this.listIdentidadMostrar = listIdentidad;
        else
          for (var i = 0; i < listIdentidad.length; i++) {
            if (listIdentidad[i].nombre != "Motor")
              this.listIdentidadMostrar.push(listIdentidad[i]);
          }
      },
        error => console.log(error));
  }

  //Listo
  resetFormItem(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this._itemService.formData = {
      nombre: "",
      magnitudId: null,
      estado: 1,
      listItem_identidad: [],
      listItem_itemCategory: []
    }
    if (this.mConexionService.UserR.rolAsignado == "adminMotor" || this.mConexionService.UserR.rolAsignado == "editorMotor")
      this.isCheckMotorItem = false;
    else {
      this.listSelectedIdentidad = [];
      this.listSelectedIdentidad2 = [];
      this.listSelectedIdentidad3 = [];
    }
    this.itemInCopy = JSON.parse(JSON.stringify(this._itemService.formData));
    this.modoEdicionItem = false;
  }

  //Listo
  resetFormCategory(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this._itemCategoryService.formData = {
      idItemCategory: null,
      nombre: "",
      estado: 1,
    }
    this.categortInCopy = JSON.parse(JSON.stringify(this._itemCategoryService.formData));
    this.modoEdicionCategory = false;
  }

  resetSelect(op: number) {
    switch (op) {
      case 1:
        this.selectItem = null;
        this.listItemItemCategoryIn = [];
        this.indiceEditItem = null;
        break;
      case 2:
        this.selectCategory = null
        this.indiceEditCategory = null;
        break;
    }
  }

  completarFormItem(list: cItem, form?: NgForm) {
    if (form == null) {
      this._itemService.formData = {
        idItem: list.idItem,
        nombre: list.nombre,
        magnitudId: list.magnitudId,
        estado: list.estado,
        listItem_itemCategory: list.listItem_itemCategory,
        listItem_identidad: list.listItem_identidad
      }
    }
    if (this.mConexionService.UserR.rolAsignado == "adminMotor" || this.mConexionService.UserR.rolAsignado == "editorMotor") {
      for (var i = 0; i < list.listItem_identidad.length; i++) {
        if (list.listItem_identidad[i].identidadM.nombre == "Motor"){
          this.isCheckMotorItem = !list.listItem_identidad[i].opcional;
        }
      }
    }
    else {
      this.listSelectedIdentidad = [];
      this.listSelectedIdentidad2 = [];
      this.listSelectedIdentidad3 = [];
      var auxNombre;
      for (var i = 0; i < list.listItem_identidad.length; i++) {
        auxNombre = "";
        if (this.mConexionService.UserR.rolAsignado == "adminMaquina" || this.mConexionService.UserR.rolAsignado == "editorMaquina") {
          if (list.listItem_identidad[i].identidadM!.nombre != "Motor")
            auxNombre = list.listItem_identidad[i].identidadM!.nombre;
        } else auxNombre = list.listItem_identidad[i].identidadM!.nombre;
        if (auxNombre != "" && list.listItem_identidad[i].estado == 1) {
          this.listSelectedIdentidad.push(auxNombre);
          var auxOpcional: cAuxOpcional = {
            idIdentidad: list.listItem_identidad[i].identidadMId,
            nombreidentidad: list.listItem_identidad[i].identidadM!.nombre,
            isOrNot: !list.listItem_identidad[i].opcional
          }
          if (list.listItem_identidad[i].opcional == false)
            this.listSelectedIdentidad3.push(auxNombre);
          this.listSelectedIdentidad2.push(auxOpcional);
        }
      }
    }
    this.itemInCopy = JSON.parse(JSON.stringify(this._itemService.formData));
    this.modoEdicionItem = true;
  }

  completarFormCategory(list: cItemCategory, form?: NgForm) {
    if (form == null) {
      this._itemCategoryService.formData = {
        idItemCategory: list.idItemCategory,
        nombre: list.nombre,
        estado: list.estado
      }
    }
    this.categortInCopy = JSON.parse(JSON.stringify(this._itemCategoryService.formData));
    this.modoEdicionCategory = true;
  }

  apagarEncerder(list:any, indice?:number) {
    for (var i = 0; i < list.length; i++) {
      list[i].seleccionActiva = false;
      if (indice != null)
        if (i == indice)
          list[i].seleccionActiva = true;
    }
  }

  /**Paginacion */
  //Listo
  updateSelect(control:any) {
    this.selectPagination = control.value;
    this.getNumberIndex(this.listItemIn.length);
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


  /*Metodos de Categoria********************************************************************************************************/

  //Listo
  onAddCategory() {
    this.showNewCategory = !this.showNewCategory;
    this.resetFormCategory();
    this.resetSelect(1);
    this.resetSelect(2);
    this.apagarEncerder(this.listItemIn);
  }

  //Listo
  onCancelCategory(form: NgForm) {
    this.resetFormCategory(form);
    this.resetSelect(2);
    this.showNewCategory = false;
  }

  //Listo
  onShowCategory(indice:number, datoCategory: cItemCategory) {
    if (this.indiceEditCategory != indice) {
      this.resetFormCategory();
      this.showNewCategory = false
    }
    if (this.indiceEditItem != null) {
      this.selectCategory = JSON.parse(JSON.stringify(datoCategory));
      this.onFiltroCategory(this.selectCategory!);
    }
  }

  //Listo
  onEditCategory(indice:number, datoCategory: cItemCategory) {
    this.indiceEditCategory = indice;
    this.selectCategory = Object.assign(datoCategory);
    this.completarFormCategory(datoCategory);
    this.showNewCategory = true;
  }

  //Listo
  onDeleteCategory(indice:number, datoCategory:cItemCategory) {
    Swal.fire({
      title: 'Está seguro?',
      text: "Desea eliminar esta categoría?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Continuar!',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-info mr-2',
        cancelButton: 'btn btn-danger ml-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        let list: cItemCategory = Object.assign(datoCategory);
        list.estado = 0;
        this._itemCategoryService.actualizarCategory(list).subscribe(
          res => {
            this.toastr.warning('Eliminación satisfactoria', 'Categoría');
            this.listItemCategoryIn.splice(indice, 1);
            this.resetSelect(2);
            this.listItemItemCategoryIn = this.comprobarDatosEliminados(this.listItemItemCategoryIn);
          },
          err => {
            console.log(err);
          }
        )
      }
    })
  }

  //Listo
  onSubmitCategory(form: NgForm) {
    if (this.internetStatus == "nline") {
      if (this.modoEdicionCategory) {
        this._itemCategoryService.actualizarCategory(this._itemCategoryService.formData!).subscribe(
          (res: any) => {
            this.toastr.success('Edición satisfactoria', 'Registro de Categoría');
            this.listItemCategoryIn[this.indiceEditCategory!] = res;
            this.resetFormCategory(form);
            this.resetSelect(2);
            this.showNewCategory = false;
            this.cargarDataItem();
          },
          err => {
            console.log(err);
          }
        )
      }
      else {
        var posICategory = null;
        for (var i = 0; i < this.listItemCategoryCopy.length; i++) {
          if (this.listItemCategoryCopy[i].nombre.toLowerCase() == this._itemCategoryService.formData.nombre.toLowerCase())
            posICategory = i;
        }
        if (posICategory != null) {
          this._itemCategoryService.formData.idItemCategory = this.listItemCategoryCopy[posICategory].idItemCategory;
          this._itemCategoryService.formData.nombre = this.listItemCategoryCopy[posICategory].nombre;
          this._itemCategoryService.actualizarCategory(this._itemCategoryService.formData).subscribe(
            (res: any) => {
              this.toastr.success('Ingreso satisfactorio', 'Registro de Categoría');
              this.resetFormCategory(form);
              this.resetSelect(2);
              this.cargarDataItemCategory();
              this.showNewCategory = false;
            },
            err => {
              console.log(err);
            }
          )
        }
        else {
          let list: cItemCategory = Object.assign({}, form.value);
          list.estado = 1;
          this._itemCategoryService.insertarCategory(list).subscribe(
            (res: any) => {
              if (!res.message) {
                this.toastr.success('Ingreso satisfactorio', 'Registro de Categoría');
                this.listItemCategoryIn.push(res);
                this.resetFormCategory();
                this.resetSelect(2);
                this.showNewCategory = false;
              }
              else {
                this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
                this._itemCategoryService.formData.nombre = null;
                this.autoFocusCategory = !this.autoFocusCategory;
              }
            },
          )
        }
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

  /*Fin de categoria********************************************************************************************************/

  /*Metodos de Items********************************************************************************************************/
  //Listo
  onAddItem() {
    this.showNewItem = !this.showNewItem;
    this.resetFormItem();
    this.resetSelect(1);
    this.apagarEncerder(this.listItemIn);
  }

  //Listo
  onCancelItem() {
    this.resetFormItem();
    this.resetSelect(1);
    this.showNewItem = false;
  }

  //Listo
  onShowItem(indice:number, datoItem: cItem) {
    indice = indice + (this.selectPagination * this.pagActualIndex);
    if (this.indiceEditItem != indice) {
      this.resetFormItem();
      this.showNewItem = false
    }
    this.listDelateIC = [];
    this.indiceEditItem = indice;
    this.apagarEncerder(this.listItemIn, indice);
    this.selectItem = JSON.parse(JSON.stringify(datoItem));
    this.onFiltroItem(this.selectItem!.listItem_itemCategory!);
  }

  //Listo
  onEditItem(indice:number, datoItem: cItem) {
    this.indiceEditItem = indice + (this.selectPagination * this.pagActualIndex);
    this.selectItem = JSON.parse(JSON.stringify(datoItem));
    this.completarFormItem(datoItem);
    this.showNewItem = true;
  }

  //Listo
  onDeleteItem(indice:number, datoItem:cItem) {
    Swal.fire({
      title: 'Está seguro?',
      text: "Desea eliminar este Detalle?",
      icon: 'warning',
      showCancelButton: true,
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
        let list: cItem = Object.assign(datoItem);
        list.estado = 0;
        this._itemService.actualizarItem(list).subscribe(
          res => {
            this.toastr.warning('Eliminación satisfactoria', 'Detalle');
            this.listItemIn.splice(indice, 1);
            this.resetSelect(1);
            this.getNumberIndex(this.listItemIn.length);
            this.updateIndex(0);
          },
          err => {
            console.log(err);
          }
        )
      }
    })
  }

  cambiarOpcional() {
    this.listSelectedIdentidad2 = [];
    var auxOpcionalPrimero: cAuxOpcional;
    var strNombre: any;
    var posIdentidad: number;
    for (var i = 0; i < this.listSelectedIdentidad.length; i++) {
      strNombre = this.listSelectedIdentidad[i];
      posIdentidad = -1;
      for (var j = 0; j < this.listIdentidadMostrar.length; j++) {
        if (strNombre == this.listIdentidadMostrar[j].nombre) {
          posIdentidad = j;
        }
      }
      if (posIdentidad != -1) {
        auxOpcionalPrimero = {
          idIdentidad: this.listIdentidadMostrar[posIdentidad].idIdentidadM,
          nombreidentidad: this.listIdentidadMostrar[posIdentidad].nombre,
          isOrNot: true
        }
        this.listSelectedIdentidad2.push(auxOpcionalPrimero);
      }
    }
    var flag2;
    for (var i = 0; i < this.listSelectedIdentidad3.length; i++) {
      flag2 = false
      for (var j = 0; j < this.listSelectedIdentidad2.length; j++) {
        if (this.listSelectedIdentidad3[i] == this.listSelectedIdentidad2[j].nombreidentidad)
          flag2 = true;
      }
      if (!flag2) {
        this.listSelectedIdentidad3.splice(i, 1);
        i--;
      }
    }
  }
  //Listo
  onSubmitItem(form: NgForm) {
    if (this.internetStatus == "nline") {
      this._itemService.formData!.listItem_identidad = [];
      var auxChange: cItem_identidad;
      if (this.mConexionService.UserR.rolAsignado == "adminMotor" || this.mConexionService.UserR.rolAsignado == "editorMotor") {
        if (this.modoEdicionItem)
          auxChange = {
            identidadMId: 1,
            opcional: !this.isCheckMotorItem,
            estado: 1,
            itemId: this._itemService.formData!.idItem
          }
        else
          auxChange = {
            identidadMId: 1,
            opcional: !this.isCheckMotorItem,
            estado: 1
          }

        this._itemService.formData!.listItem_identidad.push(auxChange);
      } else {
        for (var i = 0; i < this.listSelectedIdentidad2.length; i++) {
          for (var j = 0; j < this.listSelectedIdentidad3.length; j++) {
            if (this.listSelectedIdentidad2[i].nombreidentidad == this.listSelectedIdentidad3[j]) {
              this.listSelectedIdentidad2[i].isOrNot = false;
            }
          }
          if (this.modoEdicionItem)
            auxChange = {
              identidadMId: this.listSelectedIdentidad2[i].idIdentidad,
              opcional: this.listSelectedIdentidad2[i].isOrNot,
              estado: 1,
              itemId: this._itemService.formData!.idItem
            }
          else
            auxChange = {
              identidadMId: this.listSelectedIdentidad2[i].idIdentidad,
              opcional: this.listSelectedIdentidad2[i].isOrNot,
              estado: 1
            }
          this._itemService.formData!.listItem_identidad.push(auxChange);
        }
      }

      if (this.modoEdicionItem) {
        var auxPosMi;
        for (var i = 0; i < this.itemInCopy.listItem_identidad!.length; i++) {
          auxPosMi = null;
          for (var j = 0; j < this._itemService.formData!.listItem_identidad.length; j++) {
            if (this.itemInCopy.listItem_identidad![i].identidadMId == this._itemService.formData!.listItem_identidad[j].identidadMId) {
              auxPosMi = j;
            }
          }
          if (auxPosMi != null) {
            this._itemService.formData.listItem_identidad[auxPosMi].idItem_identidad = this.itemInCopy.listItem_identidad[i].idItem_identidad;
            this._itemService.formData.listItem_identidad[auxPosMi].itemId = this.itemInCopy.listItem_identidad[i].itemId;
          } else {
            this._itemService.formData.listItem_identidad.push(this.itemInCopy.listItem_identidad![i]);
            this._itemService.formData.listItem_identidad[this._itemService.formData.listItem_identidad.length - 1].estado = 0;
            this._itemService.formData.listItem_identidad[this._itemService.formData.listItem_identidad.length - 1].opcional = true;
          }
        }
        this._itemService.actualizarItem(this._itemService.formData).subscribe(
          (res: any) => {
            this.toastr.success('Edición satisfactoria', 'Registro del Detalle');
            this._itemService.getItem(this._itemService.formData!.idItem!).subscribe(listActual => {
              this.listItemIn[this.indiceEditItem!] = listActual;
              this.resetFormItem();
              this.selectItem = this.listItemIn[this.indiceEditItem!];
              this.showNewItem = false;
              this.apagarEncerder(this.listItemIn, this.indiceEditItem);
            },
              err => {
                console.log(err);
              })
          }
        )
      }
      else {
        this._itemService.insertarItem(this._itemService.formData).subscribe(
          (res: any) => {
            if (res.message) {
              this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
              this._itemService.formData.nombre = null;
              this.autoFocusItem = !this.autoFocusItem;
            }
            else {
              this.toastr.success('Ingreso satisfactorio', 'Registro del Detalle');
              this._itemService.getItem(res.idItem).subscribe(listActual => {
                this.listItemIn.push(listActual);
                this.resetFormItem();
                this.selectItem = this.listItemIn[this.listItemIn.length - 1];
                this.getNumberIndex(this.listItemIn.length);
                this.updateIndex(this.pagTotal.length - 1);
                this.showNewItem = false;
                this.apagarEncerder(this.listItemIn, this.listItemIn.length - 1);
              },
                err => {
                  console.log(err);
                })
            }
          })
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

  /*Fin de items********************************************************************************************************/

  /*Medotos para Item-Category********************************************************************************************************/
  //Listo
  onFiltroItem(list: cItem_itemCategory[]) {
    this.listItemItemCategoryIn = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].estado == 1) {

        var aux = {
          idItem_itemCategory: list[i].idItem_itemCategory,
          itemId: list[i].itemId,
          itemCategoryId: list[i].itemCategoryId,
          ItemCategoryNombre: list[i].itemCategory.nombre,
          estado: 1
        }
        this.listItemItemCategoryIn.push(aux);
      }
    }
    this.listItemItemCategoryIn = this.comprobarDatosEliminados(this.listItemItemCategoryIn);
  }

  //Listo Cambio
  onFiltroCategory(list: cItemCategory) {
    var flagOcurrencia = false;
    var posJO = null;
    for (var i = 0; i < this.listItemItemCategoryIn.length; i++) {
      if (this.listItemItemCategoryIn[i].itemCategoryId == list.idItemCategory) {
        flagOcurrencia = true;
      }
    }
    if (!flagOcurrencia) {
      var aux: cItem_itemCategory = {
        itemId: this.selectItem.idItem,
        itemCategoryId: list.idItemCategory,
        ItemCategoryNombre: list.nombre,
        estado: 1
      }
      for (var j = 0; j < this.selectItem.listItem_itemCategory.length; j++) {
        if (this.selectItem.listItem_itemCategory[j].itemCategoryId == list.idItemCategory) {
          posJO = j;
        }
      }
      if (posJO != null)
        aux.idItem_itemCategory = this.selectItem.listItem_itemCategory[posJO].idItem_itemCategory;
      this.listItemItemCategoryIn.push(aux);
    }
  }

  //Listo
  onDeleteIC(indice:number, datoIC: cItem_itemCategory) {
    if (datoIC.idItem_itemCategory != null) {
      datoIC.estado = 0;
      this.listDelateIC.push(datoIC);
    }
    this.listItemItemCategoryIn.splice(indice, 1);
  }

  //Listo
  onCancelIC() {
    this.listDelateIC = [];
    this.onFiltroItem(this.selectItem.listItem_itemCategory);
  }

  //Listo
  onSubmitIC() {
    if (this.internetStatus == "nline") {
      for (var dato of this.listDelateIC) {
        this.listItemItemCategoryIn.push(dato);
      }
      var flag = false;
      for (var i = 0; i < this.selectItem.listItem_itemCategory.length; i++) {
        flag = false;
        for (var j = 0; j < this.listItemItemCategoryIn.length; j++) {
          if (this.selectItem.listItem_itemCategory[i].itemCategoryId == this.listItemItemCategoryIn[j].itemCategoryId) {
            flag = true;
            this.listItemItemCategoryIn[j].idItem_itemCategory = this.selectItem.listItem_itemCategory[i].idItem_itemCategory;
          }
        }
        if (!flag) {
          this.selectItem.listItem_itemCategory[i].estado = 0;
          this.listItemItemCategoryIn.push(this.selectItem.listItem_itemCategory[i]);
        }
      }
      this.selectItem.listItem_itemCategory = this.listItemItemCategoryIn;
      this._itemService.actualizarItem(this.selectItem).subscribe(
        (res: any) => {
          this.toastr.success('Edición satisfactoria', 'Registro del Detalle-Categorías');
          this._itemService.getItem(this.selectItem.idItem).subscribe(listActual => {
            this.listItemIn[this.indiceEditItem] = listActual;
            this.selectItem = this.listItemIn[this.indiceEditItem];
            this.onFiltroItem(this.listItemIn[this.indiceEditItem].listItem_itemCategory);
          },
            err => {
              console.log(err);
            }
          )
        },
        err => {
          console.log(err);
        }
      )
      this.listDelateIC = [];
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
  comprobarDatosEliminados(list: cItem_itemCategory[]) {
    var aux: cItem_itemCategory[] = [];
    for (var i = 0; i < list.length; i++) {
      for (var k = 0; k < this.listItemCategoryIn.length; k++) {
        if (this.listItemCategoryIn[k].idItemCategory == list[i].itemCategoryId) {
          aux.push(list[i]);
        }
      }
    }
    return (aux);
  }
  /*Fin de Item-Categry*/

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (JSON.stringify(this._itemService.formData) == JSON.stringify(this.itemInCopy) && JSON.stringify(this._itemCategoryService.formData) == JSON.stringify(this.categortInCopy)) {
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
}

