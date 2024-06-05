import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styles: []
})
export class UserComponent implements OnInit {
  formModel={
    UserName: '',
    PasswordHash: ''
  }
  rolAsignado:string;
  constructor(private service:UserService,private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    if (localStorage.getItem('token') != null){
      this.cargarDataUser();
    }
  }

  //Listo
  onSubmit(form: NgForm) {
    this.service.login(form.value).subscribe(
      (res: any) => {
        if(!res.message){
          localStorage.setItem('token', res.token);
          this.cargarDataUser();
        }else
          this.toastr.error('Nombre de usuario o contraseña incorrecto.', 'Inicio de sessión fallido.');
      },
      err => {
        console.log(err);    
      }
    );
  }

  cargarDataUser() {
    this.service.getUserData().subscribe(
      res => {
        var a: any = res;
        this.rolAsignado = a.rolAsignado;
        if (this.rolAsignado == "adminMaquina" ||this.rolAsignado == "editorMaquina") {
          this.router.navigateByUrl('/maquinaria');
        } 
        else {
          this.router.navigateByUrl('/barco');
        }
      },
      err => {
        console.log(err);
      },
    );
  }
}
