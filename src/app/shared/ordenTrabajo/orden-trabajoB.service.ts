import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cOrdenTrabajoB, cGaleriaArchivoOrden } from './cOrdenModel.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrdenTrabajoService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_ordenTrabajo';
  serverUrl2 = environment.baseUrlGML + 'gm_galeriaArchivoOrden';
  formData: cOrdenTrabajoB | undefined;
  formDataOld: cOrdenTrabajoB | undefined;
  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_ordenTrabajo';
      this.serverUrl2 = environment.baseUrlGMP + 'gm_galeriaArchivoOrden';
    }
   }

  //metodo para traer todos las ordenes Trabajo
  getOrdenes(): Observable<cOrdenTrabajoB[]> {
    return this.http.get<cOrdenTrabajoB[]>(this.serverUrl);
  }

  getOrdenesMaquinaria(barcoMaquinariaId: number): Observable<cOrdenTrabajoB[]> {
    return this.http.get<cOrdenTrabajoB[]>(this.serverUrl + '/getOrdenTrabajoAnteriores/' + barcoMaquinariaId.toString());
  }

  insertarOrden(formData: cOrdenTrabajoB): Observable<cOrdenTrabajoB> {
    return this.http.post<cOrdenTrabajoB>(this.serverUrl, formData);
  }

  insertarGaleriarOrden(formDataGaleria: cGaleriaArchivoOrden[]): Observable<cGaleriaArchivoOrden[]> {
    return this.http.post<cGaleriaArchivoOrden[]>(this.serverUrl2 ,formDataGaleria);
  }

  delateGaleriarOrden(formDataGaleria: cGaleriaArchivoOrden[]): Observable<cGaleriaArchivoOrden[]> {
    return this.http.post<cGaleriaArchivoOrden[]>(this.serverUrl2  + '/Delate',formDataGaleria);
  }

  getOrdenTrabajo(ordenTId: string): Observable<cOrdenTrabajoB> {
    return this.http.get<cOrdenTrabajoB>(this.serverUrl + '/' + ordenTId);
  }

  getBuscarOrdenPre(strParametros: string):Observable<cOrdenTrabajoB>{//prueba
    return this.http.get<cOrdenTrabajoB>(this.serverUrl  + '/getBuscarOrdenPre/'+strParametros);
  }
  
  actualizarOrdenT(formData: cOrdenTrabajoB): Observable<cOrdenTrabajoB> {
    return this.http.put<cOrdenTrabajoB>(this.serverUrl  + '/' + formData.idOrdenT!.toString(),formData);
  }
}
