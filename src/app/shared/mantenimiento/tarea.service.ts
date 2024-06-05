import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cTarea } from './cManModel.model';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareaService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_tareaM';
  formData: cTarea | undefined;

  private _newTarea =new Subject<cTarea>();
  msg$ = this._newTarea.asObservable();

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_tareaM';
    }
   }

  //metodo para traer todos los eventos
  getTareas(): Observable<cTarea[]> {
    return this.http.get<cTarea[]>(this.serverUrl);
  }

  insertarTarea(formData: cTarea): Observable<cTarea> {
    return this.http.post<cTarea>(this.serverUrl, formData);
  }

  actualizarTarea(formData: cTarea): Observable<cTarea> {
    return this.http.put<cTarea>(this.serverUrl  + '/' + formData.idTareaM!.toString(),formData);
  }

  pasarTarea(formData:cTarea){
    this._newTarea.next(formData);
  }
}
