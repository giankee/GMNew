import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemService } from 'src/app/shared/maquinaria/item.service';
import { MaquinariaService } from 'src/app/shared/maquinaria/maquinaria.service';
import { cItem, cDetalleFichaM, cDetalleCollect } from 'src/app/shared/maquinaria/cMaquinaria.model';

@Component({
  selector: 'app-maquinaria-items',
  templateUrl: './maquinaria-items.component.html',
  styles: []
})
export class MaquinariaItemsComponent implements OnInit {

  modoEdicion: boolean = false;
  itemListFiltro: cItem[] = [];
  selectDataFicha: cDetalleFichaM;
  constructor(@Inject(MAT_DIALOG_DATA) public dato:any, public dialogRef: MatDialogRef<MaquinariaItemsComponent>, private itemService: ItemService, private maquinariaService: MaquinariaService) { }

  //Listo
  ngOnInit() {
    if (this.dato.idItem != null) {
      this.modoEdicion = true;
      this.selectDataFicha = this.maquinariaService.formData.listdetalleFichaM.find(x => x.itemId == this.dato.idItem);
    } else {
      this.cargarDataItemNuevo();
      this.selectDataFicha = {
        itemId: null,
        listDetalleCollection: [],
        estado: 1,
        mostrar: true,
      }
    }
  }

  //Listo
  cargarDataItemNuevo() {
    let auxTipoItems = this.maquinariaService.formData.tipoMaquinaria + "@true";
    this.itemListFiltro = [];
    this.itemService.getItemTipo(auxTipoItems)
      .subscribe(listItems => {
        for (var i = 0; i < listItems.length; i++) {
          if (this.maquinariaService.formData.listdetalleFichaM.find(x => x.itemId == listItems[i].idItem) == null)
            this.itemListFiltro.push(listItems[i]);
        }
      },
        error => console.error(error));
  }

  //Listo
  updateSelect(control:any) {
    var auxCollectionC: cDetalleCollect[] = [];
    this.selectDataFicha.itemId = this.itemListFiltro[control.selectedIndex - 1].idItem;
    this.selectDataFicha.item = { nombre: this.itemListFiltro[control.selectedIndex - 1].nombre, magnitud: this.itemListFiltro[control.selectedIndex - 1].magnitud};
    for (var j = 0; j < this.itemListFiltro[control.selectedIndex - 1].listItem_itemCategory.length; j++) {
      var auxCollection: cDetalleCollect = {
        itemCategoryId: this.itemListFiltro[control.selectedIndex - 1].listItem_itemCategory[j].itemCategoryId,
        categoryNombre: this.itemListFiltro[control.selectedIndex - 1].listItem_itemCategory[j].itemCategory.nombre,
        valor: 0,
        unidadId: null,
        unidadSimbolo:""
      }
      auxCollectionC.push(auxCollection);
    }
    this.selectDataFicha.listDetalleCollection = auxCollectionC;
  }

  onSubmitCollection() {
    for(var dato of this.selectDataFicha.listDetalleCollection){
      dato.unidadSimbolo=this.selectDataFicha.item.magnitud.listUnidad.find(x=>x.idUnidad== dato.unidadId).simbolo;
    }
    if (this.modoEdicion) {
      this.maquinariaService.formData.listdetalleFichaM[this.maquinariaService.formData.listdetalleFichaM.findIndex(x => x.itemId == this.dato.idItem)] = this.selectDataFicha;
    } else {
      this.maquinariaService.formData.listdetalleFichaM.push(this.selectDataFicha);
    }
    this.dialogRef.close();
  }
}
