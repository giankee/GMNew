import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cMedicion } from './cManModel.model';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicionService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_medicionM';
  formData: cMedicion | undefined;

  private _newMedicion =new Subject<cMedicion>();
  msg$ = this._newMedicion.asObservable();

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_medicionM';
    }
   }

  //metodo para traer todos las mediciones
  getMediciones(): Observable<cMedicion[]> {
    return this.http.get<cMedicion[]>(this.serverUrl);
  }

  insertarMedicion(formData: cMedicion): Observable<cMedicion> {
    return this.http.post<cMedicion>(this.serverUrl, formData);
  }

  actualizarMedicion(formData: cMedicion): Observable<cMedicion> {
    return this.http.put<cMedicion>(this.serverUrl  + '/' + formData.idMedicionM!.toString(),formData);
  }

  pasarMedicion(formData:cMedicion){
    this._newMedicion.next(formData);
  }
}
