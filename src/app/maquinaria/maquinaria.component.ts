import { Component, OnInit } from '@angular/core';
import { cMaquinaria } from 'src/app/shared/maquinaria/cMaquinaria.model';
import { ToastrService } from 'ngx-toastr';
import { MaquinariaService } from '../shared/maquinaria/maquinaria.service';
import Swal from 'sweetalert2';
import { MenuConexionService } from '../shared/otrosServices/menu-conexion.service';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.component.html',
  styles: []
})

export class MaquinariaComponent implements OnInit {
  public get mConexionService(): MenuConexionService {
    return this._mConexionService;
  }
  public set mConexionService(value: MenuConexionService) {
    this._mConexionService = value;
  }

  listMaquinariaIn: cMaquinaria[];
  
  internetStatus: string = 'nline';
  okAyuda:boolean=false;

  filtroMaquinaria = '';
  resultBusquedaMostrar:cMaquinaria[]=[];
  spinnerOnOff: boolean = true;

  constructor(private MaquinariaService: MaquinariaService, private toastr: ToastrService, private _mConexionService: MenuConexionService, private serviceUser: UserService) { }

  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    if (this.mConexionService.UserR.rolAsignado == "admin") {
      this.cargarDataAll();
    } 
    else {
      if (this.mConexionService.UserR.rolAsignado == "adminMotor" || this.mConexionService.UserR.rolAsignado == "editorMotor") {
        this.cargarDataEspecifico("Motor Marino");
      } else {
        this.cargarDataEspecifico("Otro");
      }
    }
  }

  cargarDataAll() {
    this.MaquinariaService.getMaquinarias()
      .subscribe(maquinariaDesdeWS => {
        this.listMaquinariaIn = maquinariaDesdeWS;
        this.spinnerOnOff = false;
      },
        error => console.error(error));
  }
  
  cargarDataEspecifico(tipo :string) {
    this.MaquinariaService.getMaquinariasEspecifico(tipo)
      .subscribe(maquinariaDesdeWS => {
        this.listMaquinariaIn = maquinariaDesdeWS;
        this.spinnerOnOff = false;
      },
        error => console.error(error));
  }

  getDataFiltro(data:cMaquinaria[], op: number) {//Para q la filtracion de datos se automatica
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

  onDelete(datoMaquinaria:cMaquinaria) {
    Swal.fire({
      title: 'Está seguro?',
      text: "Desea Eliminar esta maquinaria?",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#E53935',
      confirmButtonText: 'Continuar!',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-info mr-2',
        cancelButton: 'btn btn-danger ml-2'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        let list: cMaquinaria = Object.assign(datoMaquinaria);
        list.estado = 0;
        this.MaquinariaService.actualizarMaquinaria(list).subscribe(
          res => {
            if (this.mConexionService.UserR.rolAsignado == "admin") {
              this.cargarDataAll();
            } 
            else {
              if (this.mConexionService.UserR.rolAsignado == "adminMotor" || this.mConexionService.UserR.rolAsignado == "editorMotor") {
                this.cargarDataEspecifico("Motor");
              } else {
                console.log("es otro maquina")
                this.cargarDataEspecifico("Otro");
              }
            }
            this.toastr.warning('Eliminación satisfactoria', 'Maquinaria');
          },
          err => {
            console.log(err);
          }
        )
      }
    })
  }
  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (this.internetStatus == "ffline") {
      window.alert('No ahi conexión de Internet! no se puede proseguir');
      return false
    }
    return true;
  }
}
