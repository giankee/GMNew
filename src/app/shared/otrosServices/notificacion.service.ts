import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cNotificacion } from '../basicos';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_notificacion';
  //formData: cMensaje;

constructor(private http: HttpClient) {
  var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_notificacion';
    }
 }

getNotificaciones(): Observable<cNotificacion[]> {
  return this.http.get<cNotificacion[]>(this.serverUrl);
}
actualizarNotificacion(formData: cNotificacion): Observable<cNotificacion> {
  return this.http.put<cNotificacion>(this.serverUrl  + '/' + formData.idNotificacion!.toString(),formData);
}
}
