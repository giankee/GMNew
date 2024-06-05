import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrdenTrabajoService } from 'src/app/shared/ordenTrabajo/orden-trabajoB.service';
import { cOrdenTrabajoB, cGaleriaArchivoOrden } from 'src/app/shared/ordenTrabajo/cOrdenModel.model';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation, NgxGalleryComponent } from 'ngx-gallery';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-galeria-archivos',
  templateUrl: './galeria-archivos.component.html',
  styles: []
})
export class GaleriaArchivosComponent implements OnInit {
  public get ordenTrabajoService(): OrdenTrabajoService {
    return this._ordenTrabajoService;
  }
  public set ordenTrabajoService(value: OrdenTrabajoService) {
    this._ordenTrabajoService = value;
  }

  okArchivos: boolean = true;
  okAddFiles: boolean = false;
  listImagen: cGaleriaArchivoOrden[] = [];
  listOtros: cGaleriaArchivoOrden[] = [];
  newArchivos: cGaleriaArchivoOrden[] = [];
  arrayFilesRutas: any[] = [];

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  spinnerOnOffUpload: boolean = false;


  @ViewChild('gallery') gallery: NgxGalleryComponent;

  constructor(@Inject(MAT_DIALOG_DATA) public dato:any, public dialogRef: MatDialogRef<GaleriaArchivosComponent>, private _ordenTrabajoService: OrdenTrabajoService, private myElement: ElementRef, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.galleryOptions = [
      {
        width: '600px',
        height: '400px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        imageDescription: true
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];
    this.onFiltrarArchivos(this.ordenTrabajoService.formData);

  }

  onFiltrarArchivos(list: cOrdenTrabajoB) {
    this.listImagen = [];
    this.listOtros = [];
    this.galleryImages = [];
    var auxGalleryImage: NgxGalleryImage;
    var descripcion: string;
    var auxTipo;
    if (list.listGaleriaArchivoOrdenes.length > 0) {
      for (var i = 0; i < list.listGaleriaArchivoOrdenes.length; i++) {
        auxTipo = list.listGaleriaArchivoOrdenes[i].tipoArchivo.split("/");
        list.listGaleriaArchivoOrdenes[i].extension = auxTipo[1];
        if (auxTipo[0] == "image") {
          var descripcion = "Nombre: " + list.listGaleriaArchivoOrdenes[i].nombreArchivo;
          if (list.listGaleriaArchivoOrdenes[i].tareaOId != null) {
            for (var j = 0; j < list.listTareaO.length; j++) {
              if (list.listGaleriaArchivoOrdenes[i].tareaOId == list.listTareaO[j].idTareaO) {
                list.listGaleriaArchivoOrdenes[i].tareaNombre = list.listTareaO[j].tareaM.nombre;
                descripcion = descripcion + ", Adjunto a la tarea: " + list.listTareaO[j].tareaM.nombre;
              }
            }
          } else list.listGaleriaArchivoOrdenes[i].tareaNombre = "";
          this.listImagen.push(list.listGaleriaArchivoOrdenes[i]);
          auxGalleryImage = {
            small: list.listGaleriaArchivoOrdenes[i].rutaArchivo,
            medium: list.listGaleriaArchivoOrdenes[i].rutaArchivo,
            big: list.listGaleriaArchivoOrdenes[i].rutaArchivo,
            description: descripcion,
          }
          this.galleryImages.push(auxGalleryImage);
        }
        else this.listOtros.push(list.listGaleriaArchivoOrdenes[i]);
      }
    } else this.okArchivos = false;
  }

  onNewFiles(file: FileList) {
    var auxNewArchivos: cGaleriaArchivoOrden;
    var auxNombre;
    var self = this;
    for (var i = 0; i < file.length; i++) {
      var reader = new FileReader();
      reader.readAsDataURL(file[i]);
      auxNombre = file[i].name.split(".");
      auxNewArchivos = {
        ordenTrabajoId: this.ordenTrabajoService.formData.idOrdenT,
        tareaOId: -1,
        tipoArchivo: file[i].type,
        nombreArchivo: auxNombre[0],
        rutaArchivo: "",
        tareaNombre: ""
      }
      this.newArchivos.push(auxNewArchivos);
      reader.addEventListener("load", function (event: any) {
        self.arrayFilesRutas.push(event.target.result.toString());
      });
    }
    this.okAddFiles = true;
  }

  onSubirArchivos() {
    this.spinnerOnOffUpload = true;
    this.okAddFiles = false;
    var strBase64: String;
    for (var i = 0; i < this.newArchivos.length; i++) {
      strBase64 = this.arrayFilesRutas[i].split('base64,');
      if (this.newArchivos[i].tareaOId == -1)
        this.newArchivos[i].tareaOId = null;
      this.newArchivos[i].rutaArchivo = this.arrayFilesRutas[i];
      this.ordenTrabajoService.formData.listGaleriaArchivoOrdenes.push(JSON.parse(JSON.stringify(this.newArchivos[i])));
      this.newArchivos[i].rutaArchivo = strBase64[1];
    }
    this.ordenTrabajoService.insertarGaleriarOrden(this.newArchivos).subscribe(
      (res: any) => {
        this.newArchivos = [];
        this.arrayFilesRutas = [];
        this.spinnerOnOffUpload = false;
        this.onFiltrarArchivos(this.ordenTrabajoService.formData);
      },
      err => {
        console.log(err);
      }
    );
  }

  onDescargarOne(indice:number, op: number) {
    var auxArchivo: cGaleriaArchivoOrden;
    if (op == 1)
      auxArchivo = this.listImagen[indice];
    else
      auxArchivo = this.listOtros[indice];

    const linkSource = auxArchivo.rutaArchivo;
    const downloadLink = document.createElement("a");
    const fileName = auxArchivo.nombreArchivo + "." + auxArchivo.extension;

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  onDeleteOne(indice:number, op: number) {
    var aux: any[] = [];
    var auxD: cGaleriaArchivoOrden[] = [];
    if (op == 1) {
      auxD.push(JSON.parse(JSON.stringify(this.listImagen[indice])));
      this.listImagen.splice(indice, 1);
      aux = JSON.parse(JSON.stringify(this.listImagen));
      this.listImagen = [];
      this.listImagen = JSON.parse(JSON.stringify(aux));
      this.onRefrescarImagenes();
    }
    else {
      auxD.push(JSON.parse(JSON.stringify(this.listOtros[indice])));
      this.listOtros.splice(indice, 1);
      aux = JSON.parse(JSON.stringify(this.listOtros));
      this.listOtros = [];
      this.listOtros = JSON.parse(JSON.stringify(aux));
    }
    this.ordenTrabajoService.delateGaleriarOrden(auxD).subscribe(
      (res: any) => {
        var auxPosGaleria: number = -1;
        var aux: cGaleriaArchivoOrden[] = [];
        if ((auxPosGaleria = this.ordenTrabajoService.formData.listGaleriaArchivoOrdenes.findIndex(x => x.nombreArchivo == auxD[0].nombreArchivo)) != -1) {
          this.ordenTrabajoService.formData.listGaleriaArchivoOrdenes.splice(auxPosGaleria, 1);
          aux = JSON.parse(JSON.stringify(this.ordenTrabajoService.formData.listGaleriaArchivoOrdenes));
          this.ordenTrabajoService.formData.listGaleriaArchivoOrdenes = [];
          this.ordenTrabajoService.formData.listGaleriaArchivoOrdenes = JSON.parse(JSON.stringify(aux));
        }
      },
      err => {
        console.log(err);
      }
    )
  }

  onRefrescarImagenes() {
    this.galleryImages = [];
    var descripcion: string;
    var auxGalleryImage: NgxGalleryImage;
    for (var i = 0; i < this.listImagen.length; i++) {
      var descripcion = "Nombre: " + this.listImagen[i].nombreArchivo;
      if (this.listImagen[i].tareaOId != null)
        descripcion = descripcion + ", Adjunto a la tarea: " + this.listImagen[i].tareaNombre;
      auxGalleryImage = {
        small: this.listImagen[i].rutaArchivo,
        medium: this.listImagen[i].rutaArchivo,
        big: this.listImagen[i].rutaArchivo,
        description: descripcion,
      }
      this.galleryImages.push(auxGalleryImage);
    }
  }

  onExit() {
    this.dialogRef.close();
  }
}
