import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'; 

@Component({
  selector: 'app-access-denegado',
  templateUrl: './access-denegado.component.html',
  styles: []
})
export class AccessDenegadoComponent implements OnInit {

  constructor(private location: Location) { }

  ngOnInit() {
  }

  onRegresar(){
    this.location.back();
  }
}
