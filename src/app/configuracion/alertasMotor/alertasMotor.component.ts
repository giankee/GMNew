import { Component, OnInit, Input } from '@angular/core';
import { AlertaService } from 'src/app/shared/otrosServices/alerta.service';
import { ToastrService } from 'ngx-toastr';
import { MenuConexionService } from 'src/app/shared/otrosServices/menu-conexion.service';
import Swal from 'sweetalert2';
import { cAlerta } from 'src/app/shared/basicos';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertasMotor.component.html',
  styles: []
})
export class AlertasMotorComponent implements OnInit {
  @Input()
  rolAsignadoHijo:string;
  titulo:string;
  listAlertasIn: cAlerta[];
  listAlertasCopy: cAlerta[];
  okUpdateAlerta:boolean=true;
  internetStatus: string='nline';
  
  constructor(public alertaService: AlertaService,private toastr: ToastrService,private mConexionService: MenuConexionService) { }
  
  ngOnInit() {
    this.mConexionService.msg$.subscribe(mensajeStatus=>{
      this.internetStatus=mensajeStatus.connectionStatus;
    });
    if(this.rolAsignadoHijo=="Motor")
      this.titulo="Motores";
    else
      this.titulo="Otras Maquinarias";
    this.cargarDataAlerta();
  }

  cargarDataAlerta(){
    this.alertaService.getAlertaEspecifico(this.rolAsignadoHijo).subscribe(alerta =>{ 
      this.listAlertasIn=alerta;
      this.ordenarPrioridad(this.listAlertasIn);
      this.listAlertasCopy=JSON.parse(JSON.stringify(this.listAlertasIn));
    },
      error => console.error(error));
  }

  onUpdateAlertas(){
    if(this.internetStatus=="nline"){
      this.comprobarValidacion();
      if(this.okUpdateAlerta){
        this.alertaService.actualizarAlertas(this.listAlertasIn).subscribe(
          res => {
            this.toastr.success('Se ha actualizado correctamente', 'Alertas Actualización');
          },
          err => {
            console.log(err);
          }
        )
      }
    }else{
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info mr-2'
        },
        buttonsStyling:false
      })
    }   
  }

  ordenarPrioridad (list:cAlerta[])
  {
    for (var i=0; i < list.length - 1; i++){
      if(list[i].rangoFin!>100)
        list[i].rangoFin=100;
      for (var k = i, j = i + 1; j < list.length; j++)
        if (list[j].nivelPrioridad! <= list[k].nivelPrioridad!)
          k = j;
      if (k != i){
        if (list[i].rangoFin! < list[k].rangoFin!) {
        var aux = list[i];
        list[i] = list[k];
        list[k] = aux;
        }
      }
    }
  }

  onCancel(){
    this.listAlertasIn=JSON.parse(JSON.stringify(this.listAlertasCopy));
    this.okUpdateAlerta=true;
  }

  updateRangoInicio(indiceA:number){
    for(var i=0; i<this.listAlertasIn.length;i++){
      if(this.listAlertasIn[indiceA].nivelPrioridad!<this.listAlertasIn[i].nivelPrioridad!){
        this.listAlertasIn[i].rangoFin=this.listAlertasIn[indiceA].rangoInicio!-1;
        indiceA=i;
      }
      if(this.listAlertasIn[i].rangoInicio!>this.listAlertasIn[i].rangoFin!){
        this.listAlertasIn[i].rangoInicio= this.listAlertasIn[i].rangoFin;
      }
    }
    this.comprobarValidacion();
  }
  
  comprobarValidacion(){
    this.okUpdateAlerta=true;
    for(var i=0;i<this.listAlertasIn.length;i++){
      if(this.listAlertasIn[i].rangoInicio!<0 ||this.listAlertasIn[i].rangoFin!<0)
        this.okUpdateAlerta=false;
    }
  }
}
