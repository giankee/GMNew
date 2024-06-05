import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { cBarco, cGaleriaArchivoBarco } from './barco.model';
import { environment} from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BarcoService {
  serverUrl = environment.baseUrlGML + 'gm_barco';
  serverUrl2 = environment.baseUrlGML + 'gm_galeriaArchivoBarco';
  formData: cBarco;

  constructor(private http: HttpClient) { 
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlGMP + 'gm_barco';
      this.serverUrl2 = environment.baseUrlGMP + 'gm_galeriaArchivoBarco';
    }
  }

  insertarBarco(formData:cBarco): Observable<cBarco>{
    return this.http.post<cBarco>(this.serverUrl,formData)
  }
  
  actualizarBarco(formData: cBarco): Observable<cBarco> {
    return this.http.put<cBarco>(this.serverUrl  + '/' + formData.idBarco!.toString(),formData);
  }

  getBarcos(): Observable<cBarco[]> {
    return this.http.get<cBarco[]>(this.serverUrl);
  }

  getBarcosSelect2(): Observable<cBarco[]> {//revisar calendario e historial
    return this.http.get<cBarco[]>(this.serverUrl+'/getBarcoSelect2');
  }

  getBarcosMaquinarias(): Observable<cBarco[]> {
    return this.http.get<cBarco[]>(this.serverUrl+'/getBarcosMaquinarias');//para new ordenes debido a que no trae la foto del barco
  }

  getBarco(barcoId: string): Observable<cBarco>{
    return this.http.get<cBarco>(this.serverUrl + '/' + barcoId);
  }

  insertarGaleriarBarco(formDataGaleria: cGaleriaArchivoBarco[]): Observable<cGaleriaArchivoBarco[]> {
    return this.http.post<cGaleriaArchivoBarco[]>(this.serverUrl2 ,formDataGaleria);
  }

  delateGaleriarBarco(formDataGaleria: cGaleriaArchivoBarco[]): Observable<cGaleriaArchivoBarco[]> {
    return this.http.post<cGaleriaArchivoBarco[]>(this.serverUrl2+ '/Delate',formDataGaleria);
  }

}