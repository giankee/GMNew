import { Component, OnInit } from '@angular/core';
import { cBarco } from '../shared/barco.model';
import { BarcoService } from '../shared/barco.service';
import { ToastrService } from 'ngx-toastr';
import { MenuConexionService } from '../shared/otrosServices/menu-conexion.service';

@Component({
  selector: 'app-barco',
  templateUrl: './barco.component.html',
  styles: []
})
export class BarcoComponent implements OnInit {
  public get mConexionService(): MenuConexionService {
    return this._mConexionService;
  }
  public set mConexionService(value: MenuConexionService) {
    this._mConexionService = value;
  }

  list: cBarco[];
  internetStatus: string='nline';
  okAyuda:boolean=false;
  filtroBarco = '';
  resultBusquedaMostrar:cBarco[]=[];
  spinnerOnOff: boolean = true;
  
  constructor(private service:BarcoService, private toastr: ToastrService, private _mConexionService: MenuConexionService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus=>{
      this.internetStatus=mensajeStatus.connectionStatus;
    });
    this.cargarData();
  }

  cargarData() {
    this.service.getBarcos()
      .subscribe(barcosDesdeWS => {
        this.list = barcosDesdeWS;
        this.spinnerOnOff = false;
      },error => console.error(error));
  }

  onDelete(datoBarco:cBarco){
   if(confirm("Esta seguro que desea eliminar este barco?"))
    {
      let list: cBarco = Object.assign( datoBarco);
      list.estado = 0;
      this.service.actualizarBarco(list).subscribe(
        res => {
          this.cargarData();
          this.toastr.warning('Eliminación satisfactoria', 'Barco');
        },
        err => {
          console.log(err);
        }
      )
    } 
  }

  getDataFiltro(data:any, op: number) {//Para q la filtracion de datos se automatica
    if (op == 1) {
      if (this.resultBusquedaMostrar.length == 0) {
        this.resultBusquedaMostrar = JSON.parse(JSON.stringify(data));
      } else {
        if (JSON.stringify(data) != JSON.stringify(this.resultBusquedaMostrar)) {
          this.resultBusquedaMostrar = JSON.parse(JSON.stringify(data));
        }
      }
    }
  }

  salirDeRuta() : boolean | import("rxjs").Observable<boolean> | Promise<boolean>
  {
    if(this.internetStatus=="ffline"){
      window.alert('No ahi conexión de Internet! no se puede proseguir');
      return false
    }
    return true;
  }
}
