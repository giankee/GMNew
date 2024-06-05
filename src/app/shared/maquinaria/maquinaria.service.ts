import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { cMaquinaria, cIdentidadM } from 'src/app/shared/maquinaria/cMaquinaria.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaquinariaService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_maquinaria';
  serverUrl2 = environment.baseUrlGML + 'gm_identidadM';
  
  formData: cMaquinaria | undefined;
  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_maquinaria';
      this.serverUrl2=environment.baseUrlGMP + 'gm_identidadM';
    }
   }

  //metodo para traer todos las maquinarias
  getMaquinarias(): Observable<cMaquinaria[]> {
    return this.http.get<cMaquinaria[]>(this.serverUrl);
  }
  
  getMaquinariasEspecifico(tipo: string): Observable<cMaquinaria[]> {
    return this.http.get<cMaquinaria[]>(this.serverUrl + '/getMaquinariasEspecifico/' + tipo);
  }
  
  getIdentidadMaquina(): Observable<cIdentidadM[]> {
    return this.http.get<cIdentidadM[]>(this.serverUrl2);
  }

  insertarMaquinaria(formData: cMaquinaria): Observable<cMaquinaria> {
    return this.http.post<cMaquinaria>(this.serverUrl, formData);
  }

  //metodo para actualizar y eliminar suave
  actualizarMaquinaria(formData: cMaquinaria): Observable<cMaquinaria> {
    return this.http.put<cMaquinaria>(this.serverUrl  + '/' + formData.idMaquina!.toString(),formData);
  }

  getMaquina(maquinaId: string): Observable<cMaquinaria> {
    return this.http.get<cMaquinaria>(this.serverUrl + '/' + maquinaId);
  }
}
