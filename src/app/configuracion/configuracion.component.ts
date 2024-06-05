import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styles: []
})
export class ConfiguracionComponent implements OnInit {
  public rolAsignado: string = 'none';
  arrayTipo:string[]=[];
  constructor(private service:UserService) { }

  ngOnInit() {
    this.cargarData();
  }

  cargarData() {
    this.service.getUserData().subscribe(
      res => {
        var userData:any = res;
        this.rolAsignado = userData.rolAsignado;
        if(this.rolAsignado=="admin")
          this.arrayTipo=["Motor", "Otra"];
        else{
          if(this.rolAsignado=="adminMotor")
            this.arrayTipo=["Motor"];
          else this.arrayTipo=["Otra"];
        }
      },
      err => {
        console.log(err);
      },
    );
  }
}
