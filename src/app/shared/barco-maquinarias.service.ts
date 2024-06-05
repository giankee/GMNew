import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cBarcoMaquinarias } from './barco.model';

@Injectable({
  providedIn: 'root'
})

export class BarcoMaquinariasService {
//la ruta del modelo en visual studio 
serverUrl = environment.baseUrlGML + 'gm_barcoMaquinaria';

constructor(private http: HttpClient) {
  var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_barcoMaquinaria';
    }
 }

  //Si para llamar en el componente item
  getBarcoMaquinarias(barcoId: number): Observable<cBarcoMaquinarias[]> {
    return this.http.get<cBarcoMaquinarias[]>(this.serverUrl  + '/getBarcoMaquinarias/' + barcoId.toString());
  }

  getBarcoMaquinaria(barcoMId: number): Observable<cBarcoMaquinarias> {
    return this.http.get<cBarcoMaquinarias>(this.serverUrl  + '/' + barcoMId.toString());
  }

  insertarBarcoMaquinaria(formData: cBarcoMaquinarias[]): Observable<cBarcoMaquinarias> {
    return this.http.post<cBarcoMaquinarias>(this.serverUrl, formData);
  }

  actualizarBM(formData: cBarcoMaquinarias): Observable<cBarcoMaquinarias> {//para barco maquinaria en ese caso un reinicio
    return this.http.put<cBarcoMaquinarias>(this.serverUrl  + '/' + formData.idBarcoMaquinaria!.toString(),formData);
  }

  actualizarBMOrden(formData: cBarcoMaquinarias): Observable<cBarcoMaquinarias> {//solo actualizar horas de servicio a lo q finaliza la orden
    return this.http.put<cBarcoMaquinarias>(this.serverUrl  + '/updateBM/' + formData.idBarcoMaquinaria!.toString(),formData);
  }
}
