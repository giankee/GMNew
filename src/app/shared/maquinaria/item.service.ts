import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cItem } from './cMaquinaria.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  //la ruta del modelo en visual studio 
  serverUrl = environment.baseUrlGML + 'gm_item';
  formData: cItem | undefined;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_item';
    }
   }

  getItem(itemId: number): Observable<cItem> {
    return this.http.get<cItem>(this.serverUrl + '/' + itemId.toString());
  }

  //Si para llamar en el componente item
  getItems(): Observable<cItem[]> {
    return this.http.get<cItem[]>(this.serverUrl);
  }

  getItemTipo(parametros: string): Observable<cItem[]> {
    return this.http.get<cItem[]>(this.serverUrl + '/getItemTipo/' + parametros);
  }

  insertarItem(formData: cItem): Observable<cItem> {
    return this.http.post<cItem>(this.serverUrl, formData);
  }

  //metodo para actualizar y eliminar suave
  actualizarItem(formData: cItem): Observable<cItem> {
    return this.http.put<cItem>(this.serverUrl  + '/' + formData.idItem!.toString(),formData);
  }
}
