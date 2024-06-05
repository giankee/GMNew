import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms'; //para los formularios tanto normales como reactivos
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ColorPickerModule } from 'ngx-color-picker';
//import { NgxGalleryModule  } from 'ngx-gallery';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { ToastrModule} from 'ngx-toastr'; //las notificaciones al ingresar modificar, elimianr
import { MatRadioModule} from '@angular/material/radio'; //para las ventanas modales que seran hechas con angular material
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatDialogModule} from '@angular/material/dialog';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatSelectModule} from '@angular/material/select';
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
//import interactionPlugin from '@fullcalendar/interaction'; // a plugin

import { SearchPipe } from './pipes/search.pipe';
import { FiltroListOPipe } from './pipes/filtro-listO.pipe'; //para los filtros de busqueda
import { HorasServicioPipe } from './pipes/horasServicio.pipe';//para q ingrese un valor hora servicio mayor
import { Interceptor } from './auth/interceptor';//interceptar y les poner header para pasar el token

import { UserComponent } from './user/user.component';
import { UserService } from './shared/user.service';
import { RegistroComponent } from './user/registro/registro.component';
import { MenuComponent } from './menu/menu.component';

//barco : servicio, barcoComponet , etc
import { BarcoService } from './shared/barco.service';
import { BarcoComponent } from './barco/barco.component';
import { BarcoFormComponent } from './barco/barco-form/barco-form.component';
import { BarcoOneComponent } from './barco/barco-one/barco-one.component';
import { BarcoMaquinariaComponent } from './barco/barco-maquinaria/barco-maquinaria.component';
import { MaquinariaOneComponent } from './barco/barco-maquinaria/maquinaria-one/maquinaria-one.component';

//maquinaria : servicio, maquinariaCmponet , etc
import { MaquinariaService } from './shared/maquinaria/maquinaria.service';
import { MaquinariaComponent } from './maquinaria/maquinaria.component';
import { MaquinariaItemsComponent } from './maquinaria/maquinaria-items/maquinaria-items.component';
import { MaquinariaItembaseComponent } from './maquinaria/maquinaria-itembase/maquinaria-itembase.component';
import { MaquinariaFormComponent } from './maquinaria/maquinaria-form/maquinaria-form.component';

//unidades de medicion: servicios: magnitud y unidades,  
import { MagnitudService } from './shared/magnitud.service';
import { UnidadesComponent } from './unidades/unidades.component';

//Items
import { ItemComponent } from './item/item.component';
import { ItemService } from './shared/maquinaria/item.service';
import { ItemCategoryService } from './shared/maquinaria/item-category.service';


/**Mantenimiento */
import { PlanMantenimientoComponent } from './mantenimiento/plan-mantenimiento/plan-mantenimiento.component';
import { PlanIntervaloComponent } from './mantenimiento/plan-intervalo/plan-intervalo.component';

import { PlanMantenimientoService } from './shared/mantenimiento/plan-mantenimiento.service';
import { IntervaloService } from './shared/mantenimiento/intervalo.service';
import { DialogBaseComponent } from './mantenimiento/dialog-base/dialog-base.component';
import { OrdenListComponent } from './ordenTrabajo/orden-list/orden-list.component';
import { OrdenTrabajoNuevoComponent } from './ordenTrabajo/orden-trabajo-nuevo/orden-trabajo-nuevo.component';
import { OrdenTrabajoViewComponent } from './ordenTrabajo/orden-trabajo-view/orden-trabajo-view.component';
import { OrdenTrabajoOldComponent } from './ordenTrabajo/orden-trabajo-old/orden-trabajo-old.component';
/**Fin Mantenimiento */

/**Otros */
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { AlertasMotorComponent } from './configuracion/alertasMotor/alertasMotor.component';
import { MensajeService } from './shared/otrosServices/mensaje.service';
import { NotificacionService } from './shared/otrosServices/notificacion.service';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { AlertaService } from './shared/otrosServices/alerta.service';
import { AccessDenegadoComponent } from './errores/access-denegado/access-denegado.component';
import { ErrorComponent } from './errores/error/error.component';
import { InterceptorError } from './errores/error/interceptorError';
import { MenuConexionService } from './shared/otrosServices/menu-conexion.service';
import { CalendarioComponent } from './calendario/calendario.component';
import { GaleriaArchivosComponent } from './ordenTrabajo/galeria-archivos/galeria-archivos.component';
import { HistorialComponent } from './historial/historial.component';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  //interactionPlugin
]);

@NgModule({
  declarations: [
    AppComponent,
    SearchPipe,
    FiltroListOPipe,
    HorasServicioPipe,
    AutoFocusDirective,
    RegistroComponent,
    UserComponent,

    BarcoComponent,
    BarcoFormComponent,
    BarcoOneComponent,
    BarcoMaquinariaComponent,

    MaquinariaComponent,
    MaquinariaItemsComponent,
    MaquinariaFormComponent,
    MaquinariaOneComponent,
    MaquinariaItembaseComponent,

    MenuComponent,

    UnidadesComponent,
    ItemComponent,

    PlanMantenimientoComponent,
    PlanIntervaloComponent,
    DialogBaseComponent,
    
    OrdenListComponent,
    
    OrdenTrabajoNuevoComponent,
    
    OrdenTrabajoViewComponent,
    
    AlertasMotorComponent,
    
    ConfiguracionComponent,
    
    AccessDenegadoComponent,
    ErrorComponent,
    CalendarioComponent,
    GaleriaArchivosComponent,
    HistorialComponent,
    OrdenTrabajoOldComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatCheckboxModule,
    ColorPickerModule,
    NgxGalleryModule,
    FullCalendarModule, // register FullCalendar with you app
    ToastrModule.forRoot()
  ],
  entryComponents: [MaquinariaItemsComponent,MaquinariaItembaseComponent,DialogBaseComponent, GaleriaArchivosComponent, OrdenTrabajoOldComponent],
  providers: [BarcoService, MaquinariaService, ItemService, UserService , MagnitudService,ItemCategoryService,PlanMantenimientoService,IntervaloService, AlertaService, MenuConexionService, MensajeService, NotificacionService,
    {provide: HTTP_INTERCEPTORS, useClass: InterceptorError, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: Interceptor,multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
