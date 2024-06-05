import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { cUsuario } from './user-info';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  serverUrl = environment.baseUrlGML + 'account';
  serverUrl2 =environment.baseUrlGML + 'perfilUsuario';

  formData: cUsuario | undefined;

  constructor(private fb:FormBuilder, private http: HttpClient, private router: Router) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'account';
      this.serverUrl2 =environment.baseUrlGMP + 'perfilUsuario';
    }
   }
 
  //esto debe estar en el componente unicamente y solo el metodo registro aqui cambiar
  formModel = this.fb.group({
    UserName: [''],
    Email: ['',Validators.email],
    Passwords: this.fb.group({
      PasswordHash: ['', Validators.minLength(4)],
      ConfirmPassword: ['']
    }, { validator: this.comparePasswords }),
  });

  comparePasswords(fb: FormGroup) {
    let confirmPswrdCtrl = fb.get('ConfirmPassword');
    if(confirmPswrdCtrl!=null){
      if (confirmPswrdCtrl.errors == null || 'passwordMismatch' in confirmPswrdCtrl.errors) {
        if (fb.get('PasswordHash')!.value != confirmPswrdCtrl.value)
          confirmPswrdCtrl.setErrors({ passwordMismatch: true });
        else
          confirmPswrdCtrl.setErrors(null);
      }
    }
    
  }

  //Listo
  insertarRegistro(formData: cUsuario){
    return this.http.post(this.serverUrl + '/Registro',formData)
  }

  //Listo
  login(formData:any) {
    return this.http.post(this.serverUrl + '/Login', formData);
  }

  getUserData() {
    return this.http.get(this.serverUrl2);
  }

  //Listo
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    this.router.navigate(["/user-Login"]);
  }

  estaLogueado(): boolean {

    var exp = localStorage.getItem("tokenExpiration");

    if (!exp) {
      // el token no existe
      return false;
    }
    var now = new Date().getTime();
    var dateExp = new Date(exp);

    if (now >= dateExp.getTime()) {
      // ya expiró el token
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      return false;
    } else {
      return true;
    } 
  }

  roleMatch(allowedRoles: any[]): boolean {
    var isMatch = false;
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token')!.split('.')[1]));
    var userRole = payLoad.role;
    if(allowedRoles.find(x=>x==userRole)!=undefined)
      isMatch = true;
    return isMatch;
  }
}
