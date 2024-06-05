import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cAlerta } from '../basicos';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_alerta';
  formData: cAlerta | undefined;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_alerta';
    }
   }

  getAlertas(): Observable<cAlerta[]> {
    return this.http.get<cAlerta[]>(this.serverUrl);
  }
  
  getAlertaEspecifico(tipo: string): Observable<cAlerta[]> {
    return this.http.get<cAlerta[]>(this.serverUrl + '/getAlertas/' + tipo);
  }

  //metodo para actualizar
  actualizarAlertas(formData: cAlerta[]): Observable<cAlerta[]> {//creo
    return this.http.put<cAlerta[]>(this.serverUrl+ '/Actualiza',formData);
  }
}
