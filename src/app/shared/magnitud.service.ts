import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cMagnitud, cUnidad } from './basicos';

@Injectable({
  providedIn: 'root'
})
export class MagnitudService {

  serverUrl = environment.baseUrlGML + 'gm_magnitud';

  formData: cMagnitud | undefined;
  formDataUnidad: cUnidad | undefined;
  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlGMP + 'gm_magnitud';
    }
  }

  getMagnitudes(): Observable<cMagnitud[]> {
    return this.http.get<cMagnitud[]>(this.serverUrl);
  }

  insertarMagnitud(formData: cMagnitud): Observable<cMagnitud> {
    return this.http.post<cMagnitud>(this.serverUrl, formData);
  }

  //metodo para actualizar y eliminar suave
  actualizarMagnitud(formData: cMagnitud): Observable<cMagnitud> {
    return this.http.put<cMagnitud>(this.serverUrl + '/' + formData.idMagnitud!.toString(), formData);
  }
}
