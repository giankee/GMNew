import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { cPlanMantenimiento } from './cManModel.model';

@Injectable({
  providedIn: 'root'
})
export class PlanMantenimientoService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_planmantenimiento';
  formData: cPlanMantenimiento | undefined;
  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_planmantenimiento';
    }
   }

  //metodo para traer todos los planes de mantenimiento
  getMantenimientos(): Observable<cPlanMantenimiento[]> {
    return this.http.get<cPlanMantenimiento[]>(this.serverUrl);
  }

  getPlanMantenimiento(planMantenimientoId: string): Observable<cPlanMantenimiento> {
    return this.http.get<cPlanMantenimiento>(this.serverUrl + '/' + planMantenimientoId);
  }

  getPlanMantenimientoOrden(planMantenimientoId: number): Observable<cPlanMantenimiento> {
    return this.http.get<cPlanMantenimiento>(this.serverUrl + '/getPlanOrden/' + planMantenimientoId.toString());
  }

  insertarPlanMantenimiento(formData: cPlanMantenimiento): Observable<cPlanMantenimiento> {
    return this.http.post<cPlanMantenimiento>(this.serverUrl, formData);
  }

  //metodo para actualizar y eliminar suave
  actualizarPlanMantenimiento(formData: cPlanMantenimiento): Observable<cPlanMantenimiento> {
    return this.http.put<cPlanMantenimiento>(this.serverUrl  + '/' + formData.idPlanMantenimiento!.toString(),formData);
  }
}
