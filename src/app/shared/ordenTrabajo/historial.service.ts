import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { cHistorialBM } from './cOrdenModel.model';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_historialBM';
  formData: cHistorialBM | undefined;

  private _newHistorial =new Subject<cHistorialBM>();
  msg$ = this._newHistorial.asObservable();

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_historialBM';
    }
   }

  getHistorialBM(barcoMaquinariaId: number): Observable<cHistorialBM[]> {//nc si se lo usa en otra parte
    return this.http.get<cHistorialBM[]>(this.serverUrl + '/getMaquinariaHistorial/' + barcoMaquinariaId.toString());
  }

  getHistorialBMVigente(strParametros: string): Observable<cHistorialBM[]> {
    return this.http.get<cHistorialBM[]>(this.serverUrl + '/getMaquinariaHistorialVigente/' + strParametros);
  }

  reinicioPeriodoMaquinariaH(strParametros: string): Observable<cHistorialBM[]> {
    return this.http.get<cHistorialBM[]>(this.serverUrl + '/putReinicioPeriodoMaquinariaH/' + strParametros);
  }

  getHistorialB(barcoId: number): Observable<cHistorialBM[]> {
    return this.http.get<cHistorialBM[]>(this.serverUrl + '/getBarcoHistorial/' + barcoId.toString());
  }

  //metodo para actualizar y eliminar suave
  actualizarHBM(formData: cHistorialBM[]): Observable<cHistorialBM[]> {
    return this.http.post<cHistorialBM[]>(this.serverUrl,formData);
  }

  pasarHistorial(formData:cHistorialBM){
    this._newHistorial.next(formData);
  }
}
