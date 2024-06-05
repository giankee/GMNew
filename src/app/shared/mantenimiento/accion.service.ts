import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cAccion } from './cManModel.model';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AccionService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_accionM';
  formData: cAccion | undefined;

  private _newAccion =new Subject<cAccion>();
  msg$ = this._newAccion.asObservable();

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_accionM';
    }
   }

  //metodo para traer todos los eventos
  getAcciones(): Observable<cAccion[]> {
    return this.http.get<cAccion[]>(this.serverUrl);
  }

  insertarAccion(formData: cAccion): Observable<cAccion> {
    return this.http.post<cAccion>(this.serverUrl, formData);
  }

  actualizarAccion(formData: cAccion): Observable<cAccion> {
    return this.http.put<cAccion>(this.serverUrl  + '/' + formData.idAccionM!.toString(),formData);
  }

  pasarAccion(formData:cAccion){
    this._newAccion.next(formData);
  }
}
