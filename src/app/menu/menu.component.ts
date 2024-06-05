import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogBaseComponent } from '../mantenimiento/dialog-base/dialog-base.component';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { MenuConexionService } from '../shared/otrosServices/menu-conexion.service';
import Swal from 'sweetalert2';
import { MensajeService } from '../shared/otrosServices/mensaje.service';
import { NotificacionService } from '../shared/otrosServices/notificacion.service';
import { cMensaje, cNotificacion } from '../shared/basicos';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  public userData: any = null;
  tooglebtn: boolean = true;
  public showCollapseMagnitud = false;
  public showCollapseRegistro = false;
  opcMantenimiento: boolean[] = [false, false, false, false];
  /**Parte Online */
  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  public subscriptions: Subscription[] = [];
  /**Fin parte online*/
  listMensajes: cMensaje[] = [];
  listNotificacion: cNotificacion[] = [];
  strFecha: string;
  
  constructor(private service: UserService, private router: Router, private dialog: MatDialog, public MconexionService: MenuConexionService, public mensajeService: MensajeService, public notificacionService: NotificacionService) { }

  ngOnInit() {
    this.mIniciarConexion();
    if (this.service.estaLogueado){
      this.cargarData();
      this.fechaActual();
    }
    else
      this.router.navigate(["/user-Login"]);

    //this.onStar();
  }

  mIniciarConexion() {//Revisa si esta Online o Offline con sus respectivos mensajes
    this.MconexionService.formData = {
      connectionStatusMessage: "",
      connectionStatus: "nline"
    }

    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this.MconexionService.formData.connectionStatusMessage = 'Regreso la conexión';
      this.MconexionService.formData.connectionStatus = 'nline';
      this.MconexionService.pasarStatus(this.MconexionService.formData);
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.MconexionService.formData.connectionStatusMessage = 'Conexión perdida! No estas conectado a Internet';
      this.MconexionService.formData.connectionStatus = 'ffline';
      this.MconexionService.pasarStatus(this.MconexionService.formData);
    }));
  }

  logout() {
    this.service.logout();
  }

  cargarData() {
    this.service.getUserData().subscribe(
      (res: any) => {
        this.MconexionService.UserR = {
          UserName: res.userName,
          rolAsignado: res.rolAsignado
        }
        this.cargarDataMyN();
      },
      err => {
        console.log(err);
      },
    );
  }

  cargarDataMyN() {
    this.mensajeService.getMensajes().subscribe(
      res => {
        this.listMensajes = res;
        this.filtrarMensajes(this.listMensajes);
      },
      err => {
        console.log(err);
      },
    );
    this.notificacionService.getNotificaciones().subscribe(
      res => {
        this.filtrarNotificaciones(res);
      },
      err => {
        console.log(err);
      },
    );


  }

  onEcenderApagar(diferente?: number) {
    if (diferente == 1) {
      this.opcMantenimiento=[false,false,false,false];
      this.showCollapseMagnitud = !this.showCollapseMagnitud;
    }
    if (diferente == 2) {
      this.showCollapseRegistro = !this.showCollapseRegistro;
    }
  }

  addEditOneObjeto(tipoObjeto: number) {
    if (this.MconexionService.formData.connectionStatus == "nline") {
      this.opcMantenimiento=[false,false,false,false];
      this.opcMantenimiento[tipoObjeto-1]=true;
      const dialoConfig = new MatDialogConfig();
      dialoConfig.autoFocus = false;
      dialoConfig.disableClose = true;
      dialoConfig.data = { tipoObjeto };
      this.dialog.open(DialogBaseComponent, dialoConfig);
      this.dialog.afterAllClosed.subscribe(x=> this.opcMantenimiento[tipoObjeto-1]=false)
    } else {
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info mr-2'
        },
        buttonsStyling: false
      })
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  //Listo
  fechaActual() {
    let hoy = new Date();
    let dia = hoy.getDate();
    let anio = hoy.getFullYear();
    let mes = hoy.getMonth() + 1;
    var strmonth = "";
    var strday = "";
    if (mes < 10)
      strmonth = "0" + mes;
    else
      strmonth = "" + mes;
    if (dia < 10)
      strday = "0" + dia;
    else
      strday = "" + dia;
    this.strFecha = anio + '-' + strmonth + '-' + strday;

  }
  //Listo
  compararFechas(fecha1:any[], fecha2:any[], negativo: boolean) {
    var diferenciaAnio;
    var diferenciaMes;
    var diferenciaDia;
    diferenciaAnio = Number(fecha2[0] - Number(fecha1[0]));
    diferenciaMes = Number(fecha2[1] - Number(fecha1[1]));
    diferenciaMes = Number((diferenciaAnio * 12) + diferenciaMes);
    diferenciaDia = Number(fecha2[2] - Number(fecha1[2]));
    diferenciaDia = Number((diferenciaMes * 30) + diferenciaDia);
    if (diferenciaDia < 0 && negativo)
      diferenciaDia = diferenciaDia * -1;
    return diferenciaDia;
  }

  //Listo
  filtrarMensajes(list: cMensaje[]) {
    var auxFecha;
    var auxUser;
    var fechaU = this.strFecha.split("-");
    var diaDiferencia;
    var flagS = false;
    for (var i = 0; i < list.length; i++) {
      auxUser = list[i].destinatrarios.split("-");
      for (var j = 0; j < auxUser.length; j++) {
        if (auxUser[j] == this.MconexionService.UserR.rolAsignado)
          flagS = true;
      }
      auxFecha = list[i].fechaCreacion.split("-");
      diaDiferencia = this.compararFechas(auxFecha, fechaU, true);
      list[i].tiempoCreacion = diaDiferencia + " dias atras";
      if (diaDiferencia >= 15 || !flagS) {
        list.splice(i, 1);
        i--;
      }
    }
  }

  filtrarNotificaciones(list: cNotificacion[]) {
    var auxFecha;
    var fechaU = this.strFecha.split("-");
    var diaDiferencia;
    for (var i = 0; i < list.length; i++) {
      auxFecha = list[i].recordatorioHasta.split("-");
      if (list[i].estadoProceso == "Pendiente") {
        diaDiferencia = this.compararFechas(fechaU, auxFecha, true);
        this.listNotificacion.push(list[i]);
      } else {
        diaDiferencia = this.compararFechas(fechaU, auxFecha, false);
        if (diaDiferencia <= 0) {
          list[i].estadoProceso = "Pendiente";
          this.listNotificacion.push(list[i]);
          diaDiferencia = diaDiferencia * -1;
          this.notificacionService.actualizarNotificacion(list[i]).subscribe(
            res => { },
            err => {
              console.log(err);
            }
          )
        }
      }
      list[i].tiempoCreacion = diaDiferencia + " dias atras";
    }
  }
}
