import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { cItemCategory } from './cMaquinaria.model';

@Injectable({
  providedIn: 'root'
})
export class ItemCategoryService {
  serverUrl = environment.baseUrlGML + 'gm_itemCategory';
  formData: cItemCategory | undefined;
  
  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlGMP + 'gm_itemCategory';
    }
  }

  getItemCategories(): Observable<cItemCategory[]> {
    return this.http.get<cItemCategory[]>(this.serverUrl);
  }

  insertarCategory(formData: cItemCategory): Observable<cItemCategory> {
    return this.http.post<cItemCategory>(this.serverUrl, formData);
  }

  //metodo para actualizar y eliminar suave
  actualizarCategory(formData: cItemCategory): Observable<cItemCategory> {
    return this.http.put<cItemCategory>(this.serverUrl  + '/' + formData.idItemCategory!.toString(),formData);
  }
}
