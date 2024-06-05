import { Component, OnInit, ViewChild } from '@angular/core';
import { BarcoService } from 'src/app/shared/barco.service';
import { Router, ActivatedRoute } from '@angular/router';
import { cBarco, cGaleriaArchivoBarco } from 'src/app/shared/barco.model';
import { jsPDF } from 'jspdf'
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryComponent, NgxGalleryAnimation } from '@kolkov/ngx-gallery';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-barco-one',
  templateUrl: './barco-one.component.html',
  styles: []
})
export class BarcoOneComponent implements OnInit {

  barcoId: number;
  list: cBarco;
  listImagen: cGaleriaArchivoBarco[] = [];
  listOtros: cGaleriaArchivoBarco[] = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  internetStatus: string = 'nline';
  spinnerOnOff: boolean = true;
  spinnerOnOffUpload: boolean = false;

  newArchivos: cGaleriaArchivoBarco[] = [];
  arrayFilesRutas: any[] = [];
  okAddFiles: boolean = false;
  okAyuda: boolean = false;

  @ViewChild('gallery') gallery: NgxGalleryComponent;

  constructor(public barcoService: BarcoService,private toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute, private mConexionService: MenuConexionService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });

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
        thumbnailMargin: 20,
        preview:false
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];

    this.activatedRoute.params.subscribe(params => {
      this.barcoId = params["id"];
      this.barcoService.getBarco(this.barcoId.toString())
        .subscribe(barcoDesdeWS => {
          this.list = barcoDesdeWS;
          this.spinnerOnOff = false;
          this.onFiltrarArchivos(this.list);
        },
          error => this.router.navigate(["/barco"]));
    });
  }

  onConvertPdf() {
    var y: number;

    var doc = new jsPDF(), margin = 15, verticalOffset = margin;

    var idTitulo = document.getElementById("contPrint1");
    doc.html(idTitulo!, {x:50, y:10});
    var logo = new Image();
    logo.src = this.list.nombreI!;
    doc.addImage(logo, 'JPEG', 46, 40, 116, 55);

    /**Primera fila titulo */
    doc.line(9, 105, 199, 105);//up
    doc.line(9, 120, 199, 120);//down
    doc.setFontSize(14);


    doc.text("Ficha Técnica", 90, 115);
    doc.line(9, 105, 9, 120);//left
    doc.line(199, 105, 199, 120);//right
    doc.setFontSize(11);


    y = 120;
    var valorC1=0;
    var valorC2=0;
    var valorG: number = 0;

    var auxD: string="";
    var lineaC1;
    var lineaC2;


    for (var i = 1; i <= 18; i++) {
      switch (i) {
        case 1:
          auxD = "Armador: " + this.list.armador;
          break;
        case 2:
          auxD = "Constructor: " + this.list.constructorB;
          break;
        case 3:
          auxD = "Lugar de Construcción: " + this.list.lugarConstruccion;
          break;
        case 4:
          auxD = "Año de Construcción: " + this.list.anioConstruccion;
          break;
        case 5:
          auxD = "Lugar de Re-Construcción: " + this.list.lugarReConstruccion;
          break;
        case 6:
          auxD = "Año de Re-Construcción: " + this.list.anioReConstruccion;
          break;
        case 7:
          auxD = "Número de Matricula: " + this.list.numMatricula;
          break;
        case 8:
          auxD = "Material del Casco: " + this.list.materialCasco;
          break;
        case 9:
          auxD = "Eslora: " + this.list.eslora;
          break;
        case 10:
          auxD = "Manga: " + this.list.manga;
          break;
        case 11:
          auxD = "Puntal: " + this.list.puntal;
          break;
        case 12:
          auxD = "Calado: " + this.list.calado;
          break;
        case 13:
          auxD = "Tonelaje Bruto: " + this.list.tonelajeBruto;
          break;
        case 14:
          auxD = "Tonelaje Neto: " + this.list.tonelajeNeto;
          break;
        case 15:
          auxD = "Capacidad Bodega: " + this.list.capacidadBodega;
          break;
        case 16:
          auxD = "Tipo Bodega: " + this.list.tipoBodega;
          break;
        case 17:
          auxD = "Método de Pesca: " + this.list.metodoPesca;
          break;
        case 18:
          auxD = "Desplazamiento Maxima Carga: " + this.list.desMaximaCarga;
          break;
      }

      if (i % 2 == 0) {
        lineaC2 = doc.splitTextToSize(auxD, 85);
        valorC2 = (2 * lineaC2.length) + 13;
        if (valorC1 >= valorC2)
          valorG = valorC1;
        else valorG = valorC2;
        y = y + valorG;
        doc.text(lineaC1, 15, (y - ((valorG - (2 * lineaC1.length)) / 2)));
        doc.text(lineaC2, 110, (y - ((valorG - (2 * lineaC2.length)) / 2)));
        doc.line(9, (y - valorG), 9, y);//left
        doc.line(199, (y - valorG), 199, y);//right
        doc.line(105, (y - valorG), 105, y);//rightCentro

        doc.line(9, y, 199, y);//downn

      } else {
        lineaC1 = doc.splitTextToSize(auxD, 85);
        valorC1 = (2 * lineaC1.length) + 13;
      }
    }
    doc.save("FichaTecnica" + this.list.nombre);
  }

  onFiltrarArchivos(list: cBarco) {
    this.listImagen = [];
    this.listOtros = [];
    this.galleryImages = [];
    var auxGalleryImage: NgxGalleryImage;
    var descripcion: string;
    var auxTipo;

    auxGalleryImage = {
      small: list.nombreI,
      medium: list.nombreI,
      big: list.nombreI,
      description: "Imagen del Barco",
    }
    this.galleryImages.push(auxGalleryImage);

    if (list.listGaleriaArchivoBarcos!.length > 0) {
      for (var i = 0; i < list.listGaleriaArchivoBarcos!.length; i++) {
        auxTipo = list.listGaleriaArchivoBarcos![i].tipoArchivo!.split("/");
        list.listGaleriaArchivoBarcos![i].extension = auxTipo[1];
        if (auxTipo[0] == "image") {
          var descripcion = "Nombre: " + list.listGaleriaArchivoBarcos![i].nombreArchivo;
          if (list.listGaleriaArchivoBarcos![i].barcoMaquinariaId != null) {
            for (var j = 0; j < list.listBarcoMaquinarias!!.length; j++) {
              if (list.listGaleriaArchivoBarcos![i].barcoMaquinariaId == list.listBarcoMaquinarias![j].idBarcoMaquinaria && list.listBarcoMaquinarias![j].checkMaquinaria == true) {
                list.listGaleriaArchivoBarcos![i].maquinariaNombre = list.listBarcoMaquinarias![j].nombre;
                descripcion = descripcion + ", Adjunto a la tarea: " + list.listBarcoMaquinarias![j].nombre;
              }
            }
          } else list.listGaleriaArchivoBarcos![i].maquinariaNombre = "";
          this.listImagen.push(list.listGaleriaArchivoBarcos![i]);
          auxGalleryImage = {
            small: list.listGaleriaArchivoBarcos![i].rutaArchivo,
            medium: list.listGaleriaArchivoBarcos![i].rutaArchivo,
            big: list.listGaleriaArchivoBarcos![i].rutaArchivo,
            description: descripcion,
          }
          this.galleryImages.push(auxGalleryImage);
        } else this.listOtros.push(list.listGaleriaArchivoBarcos![i]);
      }
    }
  }

  onNewFiles(file: FileList) {
    var auxNewArchivos: cGaleriaArchivoBarco;
    var auxNombre;
    var self = this;
    for (var i = 0; i < file.length; i++) {
      var reader = new FileReader();
      reader.readAsDataURL(file[i]);
      auxNombre = file[i].name.split(".");
      auxNewArchivos = {
        barcoId: this.list.idBarco,
        barcoMaquinariaId: -1,
        tipoArchivo: file[i].type,
        nombreArchivo: auxNombre[0],
        rutaArchivo: "",
        maquinariaNombre: ""
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
      if (this.newArchivos[i].barcoMaquinariaId == -1)
        this.newArchivos![i].barcoMaquinariaId = undefined;
      this.newArchivos[i].rutaArchivo=this.arrayFilesRutas[i];
      this.list.listGaleriaArchivoBarcos!.push(JSON.parse(JSON.stringify(this.newArchivos[i])));
      this.newArchivos[i].rutaArchivo = strBase64[1];
    }
    this.barcoService.insertarGaleriarBarco(this.newArchivos).subscribe(
      (res: any) => {
        this.newArchivos = [];
        this.arrayFilesRutas=[];
        this.spinnerOnOffUpload=false;
        this.onFiltrarArchivos(this.list);
      },
      err => {
        console.log(err);
      }
    )
  }

  onDescargarOne(indice:number, op: number) {
    var auxArchivo: cGaleriaArchivoBarco;
    if (op == 1)
      auxArchivo = this.listImagen[indice];
    else
      auxArchivo = this.listOtros[indice];

    const linkSource = auxArchivo.rutaArchivo;
    const downloadLink = document.createElement("a");
    const fileName = auxArchivo.nombreArchivo + "." + auxArchivo.extension;

    downloadLink.href = linkSource!;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  onDeleteOne(indice:number, op: number) {//toca cambiar
    var aux: any[] = [];
    var auxD: cGaleriaArchivoBarco[] = [];
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
    this.barcoService.delateGaleriarBarco(auxD).subscribe(
      (res: any) => {
        this.toastr.success('Eliminación satisfactoria', 'Galería Del Barco');
      },
      err => {
        console.log(err);
      }
    );
  }

  onRefrescarImagenes() {
    this.galleryImages = [];
    auxGalleryImage = {
      small: this.list.nombreI,
      medium: this.list.nombreI,
      big: this.list.nombreI,
      description: "Imagen del Barco",
    }
    this.galleryImages.push(auxGalleryImage);
    var descripcion: string;
    var auxGalleryImage: NgxGalleryImage;
    for (var i = 0; i < this.listImagen.length; i++) {
      var descripcion = "Nombre: " + this.listImagen[i].nombreArchivo;
      if (this.listImagen[i].barcoMaquinariaId != null)
        descripcion = descripcion + ", Adjunto a la tarea: " + this.listImagen[i].maquinariaNombre;
      auxGalleryImage = {
        small: this.listImagen[i].rutaArchivo,
        medium: this.listImagen[i].rutaArchivo,
        big: this.listImagen[i].rutaArchivo,
        description: descripcion,
      }
      this.galleryImages.push(auxGalleryImage);
    }
  }

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (this.internetStatus == "nline") {
      return true;
    }
    if (this.internetStatus == "ffline") {
      const confirmacion = window.confirm('No ahi conexión de Internet, ¿Desea salir de todas formas? No se guardaran los cambios!');
      return confirmacion;
    }
    return true;
  }
}
