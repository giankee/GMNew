import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/user.service';
import { ToastrService } from 'ngx-toastr';
import { PuedeDesactivar } from 'src/app/auth/can-deactive.guard';
import Swal from 'sweetalert2';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styles: []
})
export class RegistroComponent implements OnInit, PuedeDesactivar {
  public get mConexionService(): MenuConexionService {
    return this._mConexionService;
  }
  public set mConexionService(value: MenuConexionService) {
    this._mConexionService = value;
  }
  public userData: any;  
  internetStatus: string='nline';

  constructor(public service:UserService, private toastr: ToastrService,  private _mConexionService: MenuConexionService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus=>{
      this.internetStatus=mensajeStatus.connectionStatus;
    });
    this.resetForm();
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null)
      form.resetForm();
    this.service.formData = {
      UserName: "",
      Email: "",
      PasswordHash: "",
      ConfirmPassword: "",
      estado: 1,
      rolAsignado: "visitante"
    }
  }

  onConfirmarPass(form?: NgForm) {//Para saber si coinciden las contrasenias ojo se podria mejorar
    if (this.service.formData.PasswordHash != "" && this.service.formData.ConfirmPassword != "")
      if (this.service.formData.ConfirmPassword.toString().length >= 4) {
        if (this.service.formData.ConfirmPassword.toString().length >= this.service.formData.PasswordHash.toString().length) {
          form.control.controls.ConfirmPassword.setErrors({ 'incompleta': false, 'incorrect': true });
          if (this.service.formData.ConfirmPassword == this.service.formData.PasswordHash) {
            form.control.controls.ConfirmPassword.setErrors({ 'incompleta': false, 'incorrect': false });
            form.control.controls.ConfirmPassword.setErrors(null);
          }
        }
        else form.control.controls.ConfirmPassword.setErrors({ 'incompleta': true });
      }
  }

  onSubmit(form?: NgForm) {
    if(this.internetStatus=="nline"){
      this.service.insertarRegistro(this.service.formData).subscribe(
        (res: any) => {
          if (res.succeeded) {
            this.resetForm(form);
            this.toastr.success('Nuevo usuario creado!', 'Registro Exitoso.');
          } else {
            res.errors.forEach((element: { code: any; description: string; }) => {
              switch (element.code) {
                case 'DuplicateUserName':
                  this.toastr.error('Nombre de usuario existente','Registro fallido.');
                  break;
                default:
                this.toastr.error(element.description,'Registro fallido.');
                  break;
              }
            });
          }
        },
        err => {
          console.log(err);
        }
      );
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

  salirDeRuta() : boolean | import("rxjs").Observable<boolean> | Promise<boolean>
  {
    if (this.service.formModel.value.UserName == null && this.service.formModel.value.Email == null ){
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
