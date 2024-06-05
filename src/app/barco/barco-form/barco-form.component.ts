import { Component, OnInit } from '@angular/core';
import { BarcoService } from 'src/app/shared/barco.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { cBarco } from 'src/app/shared/barco.model';
import { PuedeDesactivar } from 'src/app/auth/can-deactive.guard';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-barco-form',
  templateUrl: './barco-form.component.html',
  styles: []
})
export class BarcoFormComponent implements OnInit, PuedeDesactivar {
 
  constructor(public service:BarcoService, private toastr: ToastrService, private router: Router, private activatedRoute: ActivatedRoute, private mConexionService: MenuConexionService) { }

  modoEdicion:boolean= false;
  barcoId: number;
  strFecha:string="";
  strDate:string="";
  autoFocus:boolean=false;
  barcoInCopy:cBarco;
  internetStatus: string='nline';
  okGuardado:boolean=false;


  fileToUpload: File|null; 
  strImgURL = "/assets/img/imgDefecto.png";

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus=>{
      this.internetStatus=mensajeStatus.connectionStatus;
    });
    this.fechaActual();
    this.activatedRoute.params.subscribe(params => {
      if (params["id"] == undefined){
        this.resetForm();
        return;
      }
      this.modoEdicion=true;
      this.barcoId = params["id"];
      this.service.getBarco(this.barcoId.toString())
        .subscribe(list => this.completarForm(list),
          error => this.router.navigate(["/barco"]));
    })
  }
  
  resetForm(form?:NgForm){
    if (form!=null)
      form.resetForm();
    this.service.formData ={
      nombre: "",
      armador : "",
      constructorB : "", 
      lugarConstruccion:"" ,
      anioConstruccion :"",
      lugarReConstruccion:"" ,
      anioReConstruccion :"",
      numMatricula :"" ,
      materialCasco :"" ,
      eslora: undefined,
      manga: undefined,
      puntal : undefined,
      calado:undefined,
      tonelajeBruto :undefined,
      tonelajeNeto :undefined,
      desMaximaCarga :0,
      capacidadBodega :undefined,
      tipoBodega :"",
      metodoPesca:"",
      estado:1,
      nombreI:"/assets/img/imgDefecto.png"
    }
    this.barcoInCopy=JSON.parse(JSON.stringify(this.service.formData));
  }

  completarForm(list: cBarco,form?:NgForm) {
    if (form==null)
    this.service.formData ={
      idBarco: list.idBarco,
      nombre: list.nombre,
      armador : list.armador,
      constructorB : list.constructorB, 
      lugarConstruccion:list.lugarConstruccion ,
      anioConstruccion :list.anioConstruccion,
      lugarReConstruccion:list.lugarReConstruccion ,
      anioReConstruccion :list.anioReConstruccion,
      numMatricula :list.numMatricula ,
      materialCasco :list.materialCasco ,
      eslora: list.eslora,
      manga: list.manga,
      puntal : list.puntal,
      calado: list.calado,
      tonelajeBruto :list.tonelajeBruto,
      tonelajeNeto :list.tonelajeNeto,
      desMaximaCarga :list.desMaximaCarga,
      capacidadBodega :list.capacidadBodega,
      tipoBodega :list.tipoBodega,
      metodoPesca:list.metodoPesca,
      estado:list.estado,
      nombreI:list.nombreI
    }
    this.barcoInCopy=JSON.parse(JSON.stringify(this.service.formData));
    if(list.nombreI!= null)
      this.strImgURL=list.nombreI;     
  }

  onSubmit(form:NgForm){
    if(this.internetStatus=="nline"){
      var auxBase = this.strImgURL.split('base64,');
      if(auxBase.length>1)
      this.service.formData.nombreI= auxBase[1];

      if (this.modoEdicion){
        this.service.actualizarBarco(this.service.formData).subscribe(
          res => {
            this.onSaveSuccess();
            this.toastr.success('Edición satisfactoria', 'Registro de Barco');
          },
          err => {
            console.log(err);
          }
        );
      }
      else{
        this.service.insertarBarco(this.service.formData).subscribe(
          (res:any) => {
            if(!res.message){
              this.onSaveSuccess();
              this.toastr.success('Ingreso satisfactorio', 'Registro de Barco');
            }
            else{
              this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
              this.service.formData.nombre= undefined;
              this.autoFocus=!this.autoFocus;
            }
          },
        );
      }
    }else{
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info mr-2'
        },
        buttonsStyling:false
      })
    }   
  }

  onSaveSuccess() {
    this.okGuardado=true;
    this.router.navigate(["/barco"]);
  }

  onImagenSeleccioanda(file: FileList) {
    this.fileToUpload = file.item(0);
    
    //Show image preview
    var reader = new FileReader();
    reader.onload = (event:any) => {
      this.strImgURL = event.target.result;
    }
    
    reader.readAsDataURL(this.fileToUpload!);
  }

  fechaActual()
  {
    let hoy = new Date();
    let anio= hoy.getFullYear();
    let mes = hoy.getMonth();
    let hora = hoy.getHours();
    let dia = hoy.getDate();
    let segundos = hoy.getSeconds();
    let minutos = hoy.getMinutes();
    var strmonth="";
    mes=mes+1;
    if (mes <10)
      strmonth="0"+mes;
    else
      strmonth=""+mes     
    this.strFecha = anio + '-' + strmonth;
    this.strDate = anio + '-' + strmonth + '-' + dia + '-' + hora + '-' + minutos + '-' + segundos;
  }

  salirDeRuta() : boolean | import("rxjs").Observable<boolean> | Promise<boolean>
  {
    if(JSON.stringify(this.service.formData)==JSON.stringify(this.barcoInCopy)){
      return true;
    }
    if(this.internetStatus=="nline" && this.okGuardado==false){
      const confirmacion = window.confirm('¿Quieres salir del formulario y perder los cambios realizados?');
      return confirmacion;
    }
    if(this.internetStatus=="ffline"){
      const confirmacion = window.confirm('No ahi conexión de Internet, ¿Desea salir de todas formas? No se guardaran los cambios!');
      return confirmacion;
    }
    return true;
  }
}
