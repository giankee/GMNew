import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cEvento } from './cManModel.model';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_eventoM';
  formData: cEvento | undefined;

  private _newevento =new Subject<cEvento>();
  msg$ = this._newevento.asObservable();

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_eventoM';
    }
   }

  //metodo para traer todos los eventos
  getEventos(): Observable<cEvento[]> {
    return this.http.get<cEvento[]>(this.serverUrl);
  }

  insertarEvento(formData: cEvento): Observable<cEvento> {
    return this.http.post<cEvento>(this.serverUrl, formData);
  }

  actualizarEvento(formData: cEvento): Observable<cEvento> {
    return this.http.put<cEvento>(this.serverUrl  + '/' + formData.idEventoM!.toString(),formData);
  }

  pasarEvento(formData:cEvento){
    this._newevento.next(formData);
  }
}
