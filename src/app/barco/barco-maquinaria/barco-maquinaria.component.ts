import { Component, OnInit } from '@angular/core';
import { BarcoMaquinariasService } from 'src/app/shared/barco-maquinarias.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { cMaquinaria } from 'src/app/shared/maquinaria/cMaquinaria.model';
import Swal from 'sweetalert2';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { cBarcoMaquinarias } from 'src/app/shared/barco.model';
import { HistorialService } from 'src/app/shared/ordenTrabajo/historial.service';

@Component({
  selector: 'app-barco-maquinaria',
  templateUrl: './barco-maquinaria.component.html',
  styles: []
})
export class BarcoMaquinariaComponent implements OnInit {
  public get historialBMService(): HistorialService {
    return this._historialBMService;
  }
  public set historialBMService(value: HistorialService) {
    this._historialBMService = value;
  }

  ListMaquinariaIn: cMaquinaria[] = [];
  ListBarcoMaquinariaIn: cBarcoMaquinarias[] = [];
  ListCheked: cBarcoMaquinarias[] = [];
  ListUncheked: cBarcoMaquinarias[] = [];
  ListNewM: cBarcoMaquinarias[] = [];
  barcoId: number;
  strFecha: string;
  internetStatus: string = 'nline';
  spinnerOnOff: boolean = true;
  okAyuda: boolean = false;
  fileToUpload: File| null;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private toastr: ToastrService, private barcoMaquinariasService: BarcoMaquinariasService, private mConexionService: MenuConexionService, private _historialBMService: HistorialService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });

    this.fechaActual();

    this.activatedRoute.params.subscribe(params => {
      this.barcoId = params["id"];
      this.barcoMaquinariasService.getBarcoMaquinarias(this.barcoId)
        .subscribe(listBarcoM => {
          this.ListBarcoMaquinariaIn=listBarcoM;
          var flag1: boolean = false;
          this.ListMaquinariaIn = [];
          for (var i = 0; i < listBarcoM.length; i++) {
            flag1 = false;
            for (var j = 0; j < this.ListMaquinariaIn.length; j++) {
              if (listBarcoM[i].maquinaria!.modelo == this.ListMaquinariaIn[j].modelo)
                flag1 = true;
            }
            if (!flag1) {
              this.ListMaquinariaIn.push(listBarcoM[i].maquinaria!);
            }
          }
          this.filtroData();
        },
          error => this.router.navigate(["/barco"]));
    })
  } 

  filtroData() {
    this.ListCheked = [];
    this.ListUncheked = [];
    var auxNombreU: string;
    var auxFiltro: cBarcoMaquinarias;

    for (var j = 0; j < this.ListBarcoMaquinariaIn.length; j++) {
      if (this.ListBarcoMaquinariaIn[j].estado != 4) {
        if (this.ListBarcoMaquinariaIn[j].unidadId == 2)
          auxNombreU = "CV/HP";
        else
          auxNombreU = "kW";
        auxFiltro = {
          checkMaquinaria: this.ListBarcoMaquinariaIn[j].checkMaquinaria,
          idBarcoMaquinaria: this.ListBarcoMaquinariaIn[j].idBarcoMaquinaria,
          nombre: this.ListBarcoMaquinariaIn[j].nombre,
          barcoId: this.ListBarcoMaquinariaIn[j].barcoId,
          maquinariaId: this.ListBarcoMaquinariaIn[j].maquinariaId,
          potencia: this.ListBarcoMaquinariaIn[j].potencia,
          unidadId: this.ListBarcoMaquinariaIn[j].unidadId,
          serie: this.ListBarcoMaquinariaIn[j].serie,
          horasServicio: this.ListBarcoMaquinariaIn[j].horasServicio,
          fechaIncorporacionB: this.ListBarcoMaquinariaIn[j].fechaIncorporacionB,
          nombreI: this.ListBarcoMaquinariaIn[j].nombreI,
          modeloMaquinaria: this.ListBarcoMaquinariaIn[j].maquinaria!.modelo,
          unidadNombre: auxNombreU,
          estado: this.ListBarcoMaquinariaIn[j].estado
        }
        this.ListCheked.push(auxFiltro);
      } else {
        auxFiltro = {
          checkMaquinaria: false,
          idBarcoMaquinaria: this.ListBarcoMaquinariaIn[j].idBarcoMaquinaria,
          barcoId: this.ListBarcoMaquinariaIn[j].barcoId,
          maquinariaId: this.ListBarcoMaquinariaIn[j].maquinariaId,
          serie: "",
          nombre: "",
          potencia: 0,
          unidadId: 2,
          horasServicio: 0,
          fechaIncorporacionB: this.strFecha,
          nombreI: this.ListBarcoMaquinariaIn[j].nombreI,
          modeloMaquinaria: this.ListBarcoMaquinariaIn[j].maquinaria!.modelo,
          unidadNombre: "",
          estado: 2
        }
        this.ListUncheked.push(auxFiltro);
      }
    }
    this.spinnerOnOff = false;
  }

  onSubmit(form: NgForm) {
    var auxActualizarM:cBarcoMaquinarias[]=[];
    if (this.internetStatus == "nline") {
      auxActualizarM=JSON.parse(JSON.stringify(this.ListCheked));
      this.ListUncheked.forEach(function (obj) {
        if(obj.checkMaquinaria && obj.nombre!=""){
          auxActualizarM.push(obj);
        }
      });
      this.ListNewM.forEach(function (obj) {
        if(obj.checkMaquinaria && obj.nombre!="" && obj.maquinariaId!=null){
          auxActualizarM.push(obj);
        }
      });
      auxActualizarM.forEach(function (obj){
        if(!obj.nombreI!.includes("/assets/img/")){
          var auxBase = obj.nombreI!.split('base64,');
          obj.nombreI=auxBase[1];
        }
      });
      this.barcoMaquinariasService.insertarBarcoMaquinaria(auxActualizarM).subscribe(
        (res: any) => {
          this.router.navigate(["/barco"]);
          this.toastr.success('Maquianrias del Barco', 'Registro satisfactorio');
        },
        err => {
          console.log(err);

        }
      );
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

  onNewMaquinaria() {
    var auxFiltro: cBarcoMaquinarias;
    auxFiltro = {
      checkMaquinaria: true,
      barcoId: this.barcoId,
      maquinariaId: undefined,
      serie: "",
      nombre: "",
      potencia: 0,
      unidadId: 2,
      horasServicio: 0,
      fechaIncorporacionB: this.strFecha,
      nombreI: "/assets/img/imgDefecto.png",
      modeloMaquinaria: "",
      estado: 1
    }
    this.ListNewM.push(auxFiltro);
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

  onImagenSeleccioanda(tipo: number, indice:number, file: FileList) {
    this.fileToUpload = file.item(0);
    //Show image preview
    var reader = new FileReader();
    reader.onload = (event: any) => {
      if (tipo == 1){
        this.ListNewM[indice].nombreI = event.target.result;
      }
        
      if (tipo == 2){
        this.ListCheked[indice].nombreI = event.target.result;
      }
        
      if (tipo == 3){
        this.ListUncheked[indice].nombreI = event.target.result;
      }
    }
    reader.readAsDataURL(this.fileToUpload!);
  }

  onImagenBotton(tipo: number, indice:number) {
    if (tipo == 1)
      document.getElementById('ImgMaquinariaNew' + indice)!.click();
    if (tipo == 2)
      document.getElementById('ImgMaquinariaCheck' + indice)!.click();
    if (tipo == 3)
      document.getElementById('ImgMaquinariaUncheck' + indice)!.click();
  }

  onEstadoMaquinaria(indice:number, tipo: number) {//Para 1=Reinicio, //3=Baja
    var fechaFin: string;
    var auxCadena: any[];
    var strParametros = this.ListCheked[indice].idBarcoMaquinaria + "@" + this.ListCheked[indice].fechaIncorporacionB + "@";
    var texto = "Desea reiniciar las horas de servicio, Ingrese la fecha del reinicio en formato AAAA-MM-DD";
    if (tipo == 3)
      texto = "Desea dar de baja a la Maquinaria, Ingrese la fecha de finalización con en formato AAAA-MM-DD";
    Swal.fire({
      title: 'Está seguro?',
      text: texto,
      input: 'text',
      inputPlaceholder: 'Ej. 2018-05-18',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#E53935',
      confirmButtonText: 'Continuar!',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-info mr-2',
        cancelButton: 'btn btn-danger ml-2'
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (!value) {
            resolve('Ingrese Una fecha!')
          } else {
            if (value.length == 10) {
              auxCadena = value.split("-");
              if (auxCadena.length == 3) {
                fechaFin = value;
                resolve;
              } else resolve ("Formato Erroneo! Falta ' - ' el separador")
            } else resolve ('Formato Erroneo!')
          }
        })
      }
    }).then((result) => {
      if (result.value) {
        strParametros = strParametros + fechaFin;

        this.historialBMService.reinicioPeriodoMaquinariaH(strParametros).subscribe(
          (res: any) => {
            if (tipo == 1) {
              this.ListCheked[indice].horasServicio = 0;
              this.ListCheked[indice].fechaIncorporacionB = fechaFin;
              this.ListCheked[indice].estado = 1;//reinicio
              this.ListCheked[indice].checkMaquinaria = true;
            } else {
              this.ListCheked[indice].estado = 3;//reinicio
              this.ListCheked[indice].checkMaquinaria = false;
            }
            this.barcoMaquinariasService.actualizarBM(this.ListCheked[indice]).subscribe(
              (res: any) => {
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

      }
    })
  }
}
