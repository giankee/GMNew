import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { cMaquinaria, cDetalleFichaM, cDetalleCollect } from 'src/app/shared/maquinaria/cMaquinaria.model';
import { jsPDF } from 'jspdf'
import { BarcoMaquinariasService } from 'src/app/shared/barco-maquinarias.service';
import { Location } from '@angular/common';
import { cBarcoMaquinarias } from 'src/app/shared/barco.model';

@Component({
  selector: 'app-maquinaria-one',
  templateUrl: './maquinaria-one.component.html',
  styles: []
})
export class MaquinariaOneComponent implements OnInit {

  barcoMId: number;
  fichaBM: cBarcoMaquinarias;

  constructor(public bMaquinariaService: BarcoMaquinariasService, private location: Location, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.barcoMId = params["id"];
      this.bMaquinariaService.getBarcoMaquinaria(this.barcoMId)
        .subscribe(bMaquinariaDesdeWS => {
        this.fichaBM = bMaquinariaDesdeWS;
          if (this.fichaBM.unidadId == 2)
            this.fichaBM.unidadNombre = "CV/HP";
          else
            this.fichaBM.unidadNombre = "kW";
          this.arreglarCollection(this.fichaBM.maquinaria!.listdetalleFichaM!);
        },
          error => this.location.back());
    })

  }
  //Listo

  arreglarCollection(list: cDetalleFichaM[]) {
    for (var i = 0; i < list.length; i++) {
      for (var j = 0; j < list[i].listDetalleCollection!.length; j++) {
        for (var k = 0; k < list[i].item!.magnitud!.listUnidad!.length; k++) {
          if (list[i].listDetalleCollection![j].unidadId == list[i].item!.magnitud!.listUnidad![k].idUnidad)
            list[i].listDetalleCollection![j].unidadSimbolo = list[i].item!.magnitud!.listUnidad![k].simbolo;
        }
      }
      this.ordenarCollection(list[i].listDetalleCollection!);
    }
  }

  ordenarCollection(list: cDetalleCollect[]) {
    for (var i = 0; i < list.length - 1; i++) {
      for (var k = i, j = i + 1; j < list.length; j++)
        if (list[j].itemCategoryId! < list[k].itemCategoryId!)
          k = j;
      if (k != i) {
        var aux = list[i];
        list[i] = list[k];
        list[k] = aux;
      }
    }
  }

  onConvertPdf() {
    var x: number;
    var y: number = 30;
    var auxCol: string;
    var auxPos: number = 0;

    var doc = new jsPDF(), margin = 15, verticalOffset = margin;
    var auxdescripcionPlan = this.fichaBM!.maquinaria!.planMantenimiento!.descripcion;
    doc.setFontSize(24);
    doc.setFont("times","bold");
    doc.text("Ficha Técnica de la maquinaria" + this.fichaBM.nombre, 25, 25);

    for (var i = 1; i <= 8; i++) {
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
      if (i == 8 && this.fichaBM!.maquinaria!.planMantenimientoId!=null) {
        y = y + 6;
        doc.setFontSize(12);
        doc.setFont("arial","bold");
        doc.text("Descripción del plan de Mantenimiento:", x, y);
        doc.setFont("arial","normal");
        y=y+5;
        var lines = doc.splitTextToSize(auxdescripcionPlan!, 85);
        doc.text(lines, x, (y) + verticalOffset / 50);
        y = y+ ((2 * lines.length) + 3);
      }
      else {
        var auxNombreId = "contFila" + auxPos + auxCol;
        doc.html(document.getElementById(auxNombreId)!, {x:x, y:y});
      }
    }
    y=y+6;
    doc.setFont("arial","normal");
    doc.line(9, y, 199, y);//up
    doc.line(9, (y+15), 199, (y+15));//down
    doc.setFontSize(16);
    doc.text("Datos Tecnicos del Modelo", 70, (y+10));
    doc.line(9, y, 9, (y+15));//left
    doc.line(199, y, 199, (y+15));//right
    doc.setFontSize(14);
    y=y+15
    doc.line(9, (y+10), 199, (y+10));//down +10y1y2
    doc.line(9, y, 9, (y+10));//left
    doc.line(199, y, 199, (y+10));//right
    doc.text("#", 13, (y+7));
    doc.line(20, y, 20, (y+10));//right
    doc.text("Descripción", 25, (y+7));
    doc.line(85, y, 85, (y+10));//right
    doc.text("Valores", 130, (y+7));
    doc.setFontSize(12);
    y = y+10;
    var valorMayorC: number;
    var valorG: number = 0;
    var auxTexto: string|undefined;
    var lineaDescripcion;
    var lineaC;
    var auxPrueba: number;

    for (var i = 0; i < this.fichaBM!.maquinaria!.listdetalleFichaM!.length; i++) {
      auxTexto = this.fichaBM!.maquinaria!.listdetalleFichaM![i].item!.nombre;
      lineaDescripcion = doc.splitTextToSize(auxTexto!, 57);
      valorG = (3 * lineaDescripcion.length) + 12;
      valorMayorC = y + 3;
      for (var c = 0; c < this.fichaBM!.maquinaria!.listdetalleFichaM![i].listDetalleCollection!.length; c++) {
        lineaC = "";
        if ((c + 1) % 2 == 0) {
          x = 145;
        } else {
          valorMayorC = valorMayorC + 6;
          x = 90;
        }
        if (this.fichaBM!.maquinaria!.listdetalleFichaM![i].listDetalleCollection![c].itemCategoryId != 4 && this.fichaBM!.maquinaria!.listdetalleFichaM![i].listDetalleCollection![c].itemCategoryId != 5)
          lineaC = this.fichaBM!.maquinaria!.listdetalleFichaM![i].listDetalleCollection![c].itemCategory!.nombre + ": ";
        lineaC = lineaC + this.fichaBM!.maquinaria!.listdetalleFichaM![i].listDetalleCollection![c].valor;
        if (this.fichaBM!.maquinaria!.listdetalleFichaM![i].listDetalleCollection![c].itemCategoryId != 5)
          lineaC = lineaC + " " + this.fichaBM!.maquinaria!.listdetalleFichaM![i].listDetalleCollection![c].unidadSimbolo;
        doc.text(lineaC, x, valorMayorC);
      }
      valorMayorC = valorMayorC + 6 - y;
      if (valorMayorC > valorG) {
        valorG = valorMayorC;
      }
      y = y + valorG;
      auxPrueba = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2) + 3;//mega formula para centrar el texto en el espacio establecido
      doc.line(9, y, 199, y);//downG
      doc.line(9, (y - valorG), 9, y);//leftG
      doc.line(199, (y - valorG), 199, y);//rightG
      doc.text("" + (i + 1), 13, (y - ((valorG - 3) / 2)));
      doc.line(20, (y - valorG), 20, y);//right#
      doc.text(lineaDescripcion, 25, (y - valorG + auxPrueba));
      doc.line(85, (y - valorG), 85, y);//rightDescripcion
    }
    doc.save("FichaTecnica" + this.fichaBM.nombre + "_sn" + this.fichaBM.serie);
  }

}
