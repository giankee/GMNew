import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { cMensaje } from '../basicos';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

    //la ruta del modelo en visual studio 
    serverUrl = environment.baseUrlGML + 'gm_mensaje';
    //formData: cMensaje;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_mensaje';
    }
   }

  getMensajes(): Observable<cMensaje[]> {
    return this.http.get<cMensaje[]>(this.serverUrl);
  }
}
