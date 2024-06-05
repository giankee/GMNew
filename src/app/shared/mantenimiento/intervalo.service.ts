import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cIntervalo} from './cManModel.model';

@Injectable({
  providedIn: 'root'
})
export class IntervaloService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_intervaloM';
  formData: cIntervalo | undefined;
  
  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_intervaloM';
    }
   }

  //metodo para traer un solo intervalo
  getIntervalo(intervaloMId: number): Observable<cIntervalo> {
    return this.http.get<cIntervalo>(this.serverUrl + '/' + intervaloMId.toString());
  }

  insertarIntervalo(formData: cIntervalo): Observable<cIntervalo> {
    return this.http.post<cIntervalo>(this.serverUrl, formData);
  }

  actualizarIntervalo(formData: cIntervalo): Observable<cIntervalo> {
    return this.http.put<cIntervalo>(this.serverUrl  + '/' + formData.idIntervaloM!.toString(),formData);
  }
}
