import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaquinariaService } from 'src/app/shared/maquinaria/maquinaria.service';
import { cDetalleCollect, cDetalleFichaM } from 'src/app/shared/maquinaria/cMaquinaria.model';
import { ItemService } from 'src/app/shared/maquinaria/item.service';

@Component({
  selector: 'app-maquinaria-itembase',
  templateUrl: './maquinaria-itembase.component.html',
  styles: []
})
export class MaquinariaItembaseComponent implements OnInit {

  listDetalleFicha: cDetalleFichaM[] = [];
  selectDetalleFShow: cDetalleFichaM;

  constructor(@Inject(MAT_DIALOG_DATA) public dato:any, public dialogRef: MatDialogRef<MaquinariaItembaseComponent>, private maquinariaService: MaquinariaService, private itemService: ItemService) { }

  ngOnInit() {
    this.maquinariaService.getMaquina(this.dato.idObj)
      .subscribe(maquinariaSelected => {
        let auxTipoItems = maquinariaSelected.tipoMaquinaria + "@true";
        this.itemService.getItemTipo(auxTipoItems)
          .subscribe(listItems => {
            var auxCollectionC: cDetalleCollect[];
            for (var i = 0; i < listItems.length; i++) {
              for (var j = 0; j < maquinariaSelected.listdetalleFichaM.length; j++) {
                if (listItems[i].idItem == maquinariaSelected.listdetalleFichaM[j].itemId) {
                  auxCollectionC = [];
                  for (var k = 0; k < maquinariaSelected.listdetalleFichaM[j].listDetalleCollection.length; k++) {
                    var auxCollection: cDetalleCollect = {
                      itemCategoryId: maquinariaSelected.listdetalleFichaM[j].listDetalleCollection[k].itemCategoryId,
                      categoryNombre: maquinariaSelected.listdetalleFichaM[j].listDetalleCollection[k].itemCategory.nombre,
                      valor: maquinariaSelected.listdetalleFichaM[j].listDetalleCollection[k].valor,
                      unidadId: maquinariaSelected.listdetalleFichaM[j].listDetalleCollection[k].unidadId,
                      unidadSimbolo:""
                    }
                    auxCollectionC.push(auxCollection);
                  }
                  var auxDetalle: cDetalleFichaM = {
                    mostrar: true,
                    itemId: listItems[i].idItem,
                    item: { nombre: listItems[i].nombre, magnitud: listItems[i].magnitud },
                    listDetalleCollection: auxCollectionC,
                    estado:1
                  }
                  this.listDetalleFicha.push(auxDetalle);
                }
              }

            }
          },
            error => console.error(error));
      });
  }

  onShowDetalle(datoDetalleF: cDetalleFichaM) {
    this.selectDetalleFShow = Object.assign(datoDetalleF);
  }

  onSubmitCollection() {
    for (var i = 0; i < this.listDetalleFicha.length; i++) {
      if (this.listDetalleFicha[i].mostrar) {
        for(var j=0;j<this.listDetalleFicha[i].listDetalleCollection.length;j++){
          this.listDetalleFicha[i].listDetalleCollection[j].unidadSimbolo= this.listDetalleFicha[i].item.magnitud.listUnidad.find(x=>x.idUnidad==this.listDetalleFicha[i].listDetalleCollection[j].unidadId).simbolo
        }
        this.maquinariaService.formData.listdetalleFichaM.push(this.listDetalleFicha[i]);
      }
    }
    this.dialogRef.close();
  }
}
