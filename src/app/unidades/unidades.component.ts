import { Component, OnInit } from '@angular/core';
import { MagnitudService } from '../shared/magnitud.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { PuedeDesactivar } from '../auth/can-deactive.guard';
import { MenuConexionService } from '../shared/otrosServices/menu-conexion.service';
import { cMagnitud, cUnidad } from '../shared/basicos';

@Component({
  selector: 'app-unidades',
  templateUrl: './unidades.component.html',
  styles: []
})
export class UnidadesComponent implements OnInit, PuedeDesactivar {
  
  listMagnitudIn: cMagnitud[];
  magnitudInCopy: cMagnitud;
  unidadInCopy: cUnidad;
  selectMagnitudShow:cMagnitud;
  modoEdicion:boolean=false;
  modoEdicionUnidad:boolean=false;
  indiceEditMag:number;
  indiceEditUnd:number;

  showNewMag:boolean=false;
  autoFocus:boolean=false;
  internetStatus: string='nline';
  okAyuda:boolean=false;
  constructor(public _magnitudService: MagnitudService, private toastr: ToastrService,private mConexionService: MenuConexionService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus=>{
      this.internetStatus=mensajeStatus.connectionStatus;
    });

    this.cargarData();
    this.resetSelect();
    this.resetForm();
    this.resetFormUnidad();
  }

  cargarData() {
    this._magnitudService.getMagnitudes()
    .subscribe(magnitudDesdeWS => {this.listMagnitudIn = magnitudDesdeWS;
      this.apagarEncerder(this.listMagnitudIn);
    },
        error => console.error(error));
  }

  resetForm(form?:NgForm){
    if (form!=null)
      form.resetForm();
    this._magnitudService.formData ={
      idMagnitud: null,
      nombre: "",
      estado:null,
      listUnidad:null
    }
    this.magnitudInCopy=JSON.parse(JSON.stringify(this._magnitudService.formData));
    this.modoEdicion=false;
  }

  resetFormUnidad(form?:NgForm){
    if (form!=null)
      form.resetForm();
    this._magnitudService.formDataUnidad ={
      nombre: "",
      simbolo: "",
      estado:1,
      magnitudId: null
    }
    this.unidadInCopy=JSON.parse(JSON.stringify(this._magnitudService.formDataUnidad));
    this.modoEdicionUnidad=false; 
  }

  //Listo
  resetSelect(){
    this.selectMagnitudShow ={
      idMagnitud: null,
      nombre: "",
      estado:null,
      listUnidad:[]
    }
    this.indiceEditMag=null;
    this.indiceEditUnd=null;
  }

  //listo
  completarForm(list: cMagnitud,form?:NgForm) {
    if (form==null){
      this._magnitudService.formData ={
        idMagnitud: list.idMagnitud,
        nombre: list.nombre,
        estado:list.estado,
        listUnidad:list.listUnidad
      }
    } 
    this.magnitudInCopy=JSON.parse(JSON.stringify(this._magnitudService.formData));
    this.modoEdicion=true;
  }

  //Listo
  completarFormUnidad(list: cUnidad,form?:NgForm) {
    if (form==null){
      this._magnitudService.formDataUnidad ={
        idUnidad: list.idUnidad,
        nombre: list.nombre,
        simbolo: list.simbolo,
        estado:list.estado,
        magnitudId: list.magnitudId
      }
    }
    this.unidadInCopy=JSON.parse(JSON.stringify(this._magnitudService.formDataUnidad));
    this.modoEdicionUnidad=true;
  }
  
  //Listo
  onAdd(){
    this.showNewMag=!this.showNewMag;
    this.resetForm();
    this.resetSelect();
    this.apagarEncerder(this.listMagnitudIn);
  }

  //Listo
  onShow(indice:number,datoMagnitud:cMagnitud){
    if (this.indiceEditMag!=indice)
    {
      this.resetForm();
      this.showNewMag=false
    }
    this.resetFormUnidad();
    this.indiceEditMag=indice;
    this.apagarEncerder(this.listMagnitudIn,indice);
    this.selectMagnitudShow = Object.assign(datoMagnitud);
  }

  //Listo
  onEditMag(indice:number,datoMagnitud:cMagnitud){
    this.indiceEditMag=indice;
    this.selectMagnitudShow = Object.assign(datoMagnitud);
    this.completarForm(this.selectMagnitudShow);
    this.showNewMag=true;
  }

  //Revisar
  onEditUnd(indice:number,datoUnidad: cUnidad){
    this.resetFormUnidad();
    this.indiceEditUnd=indice;
    this.completarFormUnidad(datoUnidad);
  }

  //Listo
  onDeleteMag(indice:number,datoMagnitud:cMagnitud){
    Swal.fire({
      title: 'Está seguro?',
      text: "Desea Eliminar esta magnitud?",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#E53935',
      confirmButtonText: 'Continuar!',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-info mr-2',
        cancelButton: 'btn btn-danger ml-2'
      },
      buttonsStyling:false
    }).then((result) => {
      if (result.value) {
        let list: cMagnitud = Object.assign(datoMagnitud);
        list.estado = 0;
        this._magnitudService.actualizarMagnitud(list).subscribe(
          res => {
            this.toastr.warning('Eliminación satisfactoria', 'Magnitud');
            this.listMagnitudIn[indice]=res;
            this.listMagnitudIn.splice(indice,1);
            this.resetSelect();
          },
          err => {
            console.log(err);
          }
        )
      }
    })
  }

  onDeleteUnd(indice:number,datoUnidad:cUnidad){

    Swal.fire({
      title: 'Está seguro?',
      text: "Desea Eliminar esta unidad?",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#E53935',
      confirmButtonText: 'Continuar!',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-info mr-2',
        cancelButton: 'btn btn-danger ml-2'
      },
      buttonsStyling:false
    }).then((result) => {
      if (result.value) {
        let list: cUnidad = Object.assign(datoUnidad);
        list.estado = 0;
        this.selectMagnitudShow.listUnidad[indice]=list;

        this._magnitudService.actualizarMagnitud(this.selectMagnitudShow).subscribe(
          res => {
            this.toastr.warning('Eliminación satisfactoria', 'Unidad');
            this.listMagnitudIn[this.indiceEditMag].listUnidad.splice(indice,1);
            this.selectMagnitudShow=this.listMagnitudIn[this.indiceEditMag];
          },
          err => {
            console.log(err);
          }
        )
      }
    })
  }

  //Listo
  onSubmit(form:NgForm){
    if(this.internetStatus=="nline"){
      if (this.modoEdicion){
        this._magnitudService.actualizarMagnitud(this._magnitudService.formData).subscribe(
          res => {
            this.toastr.success('Edición satisfactoria', 'Registro de Magnitud');
            this.listMagnitudIn[this.indiceEditMag]=res;
            this.resetForm(form); 
            this.selectMagnitudShow=this.listMagnitudIn[this.indiceEditMag];
            this.showNewMag=false;
            this.apagarEncerder(this.listMagnitudIn,this.indiceEditMag);
          },
          err => {
            console.log(err);
          }
        )
      }
      else{
        let list: cMagnitud = Object.assign({}, form.value);
        list.estado = 1;
        list.listUnidad=[];//Super importante para este caso de que necesito selecionar el objeto luego del ingreso
        this._magnitudService.insertarMagnitud(list).subscribe(
          res => {
            this.toastr.success('Ingreso satisfactorio', 'Registro de Magnitud');
            this.listMagnitudIn.push(res);
            this.resetForm(form);
            this.resetFormUnidad();
            this.selectMagnitudShow=this.listMagnitudIn[this.listMagnitudIn.length-1];
            this.showNewMag=false;
            this.apagarEncerder(this.listMagnitudIn,this.listMagnitudIn.length-1);
          },
          err => {
            if (err.status == 400){
              this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
              this._magnitudService.formData.nombre= null;
              this.autoFocus=!this.autoFocus;
            }
            else
              console.log(err);
          }
        )
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

  //Listo
  onCancel(form:NgForm){
    this.resetForm(form);
    this.resetSelect();
    this.showNewMag=false;
  }

  onSubmitUnidad(form:NgForm)
  {
    if(this.internetStatus=="nline"){
      if (this.modoEdicionUnidad){
        this.selectMagnitudShow.listUnidad[this.indiceEditUnd]=this._magnitudService.formDataUnidad;
      }else{
        this._magnitudService.formDataUnidad.magnitudId =this.selectMagnitudShow.idMagnitud;
        this.selectMagnitudShow.listUnidad.push(this._magnitudService.formDataUnidad);
      }
      this._magnitudService.actualizarMagnitud(this.selectMagnitudShow).subscribe(
        res => {
          if(this.modoEdicionUnidad)
            this.toastr.success('Edición satisfactoria', 'Registro de Unidad');
          else
            this.toastr.success('Ingreso satisfactorio', 'Registro de Unidad');
          this.resetFormUnidad(form);
          this.listMagnitudIn[this.indiceEditMag]=res;
          this.apagarEncerder(this.listMagnitudIn,this.indiceEditMag);
          this.selectMagnitudShow=this.listMagnitudIn[this.indiceEditMag];
        },
        err => {
          console.log(err);
        }
      )
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

  apagarEncerder(list:any,indice?:number){
    for(var i=0; i<list.length;i++){
      list[i].seleccionActiva=false;
      if(indice!=null)
        if(i==indice)
          list[i].seleccionActiva=true;
    }
  }

  salirDeRuta() : boolean | import("rxjs").Observable<boolean> | Promise<boolean>
  {
    if(JSON.stringify(this._magnitudService.formData)==JSON.stringify(this.magnitudInCopy)&&JSON.stringify(this._magnitudService.formDataUnidad)==JSON.stringify(this.unidadInCopy)){
      return true;
    }
    if(this.internetStatus=="nline"){
      const confirmacion = window.confirm('¿Quieres salir del formulario y perder los cambios realizados?');
      return confirmacion;
    }
    if(this.internetStatus=="ffline"){
      const confirmacion = window.confirm('No ahi conexión de Internet, ¿Desea salir de todas formas? No se guardaran los cambios!');
      return confirmacion;
    }
    return false;
  }
  
}
