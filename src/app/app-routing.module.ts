import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { AdminGuard } from './auth/admin.guard';
import { BarcoComponent } from './barco/barco.component';
import { CanDeactivateGuard } from './auth/can-deactive.guard';
import { BarcoFormComponent } from './barco/barco-form/barco-form.component';
import { BarcoMaquinariaComponent } from './barco/barco-maquinaria/barco-maquinaria.component';
import { BarcoOneComponent } from './barco/barco-one/barco-one.component';
import { MaquinariaOneComponent } from './barco/barco-maquinaria/maquinaria-one/maquinaria-one.component';
import { MaquinariaComponent } from './maquinaria/maquinaria.component';
import { MaquinariaFormComponent } from './maquinaria/maquinaria-form/maquinaria-form.component';
import { UnidadesComponent } from './unidades/unidades.component';
import { ItemComponent } from './item/item.component';
import { PlanMantenimientoComponent } from './mantenimiento/plan-mantenimiento/plan-mantenimiento.component';
import { PlanIntervaloComponent } from './mantenimiento/plan-intervalo/plan-intervalo.component';
import { OrdenListComponent } from './ordenTrabajo/orden-list/orden-list.component';
import { OrdenTrabajoNuevoComponent } from './ordenTrabajo/orden-trabajo-nuevo/orden-trabajo-nuevo.component';
import { OrdenTrabajoViewComponent } from './ordenTrabajo/orden-trabajo-view/orden-trabajo-view.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { AlertasMotorComponent } from './configuracion/alertasMotor/alertasMotor.component';
import { RegistroComponent } from './user/registro/registro.component';
import { ErrorComponent } from './errores/error/error.component';
import { CalendarioComponent } from './calendario/calendario.component';
import { HistorialComponent } from './historial/historial.component';
import { UserComponent } from './user/user.component';
import { AccessDenegadoComponent } from './errores/access-denegado/access-denegado.component';

const routes: Routes = [
  //ruta por defecto
  { path: '', redirectTo: '/user-Login', pathMatch: 'full' },

  {
    path: '', component: MenuComponent, canActivateChild: [AdminGuard],
    children: [
      {
        path: 'barco', children: [
          { path: '', data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, component: BarcoComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'nuevo', data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, component: BarcoFormComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'editar/:id', data: { permittedRoles: ['admin', 'adminMotor'] }, component: BarcoFormComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'ver/:id', data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, component: BarcoOneComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'agregar/:id', data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, component: BarcoMaquinariaComponent },
          { path: 'verBM/:id', data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, component: MaquinariaOneComponent }
        ]
      },
      {
        path: 'maquinaria', children: [
          { path: '', component: MaquinariaComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'nuevo', component: MaquinariaFormComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'editar/:id', component: MaquinariaFormComponent, canDeactivate: [CanDeactivateGuard] }
        ]
      },
      { path: 'unidades', component: UnidadesComponent, canDeactivate: [CanDeactivateGuard] },
      { path: 'items', component: ItemComponent, canDeactivate: [CanDeactivateGuard] },
      {
        path: 'mantenimiento', children: [
          { path: '', component: PlanMantenimientoComponent,data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, canDeactivate: [CanDeactivateGuard] },
          { path: 'PlanIntervalo/:id', component: PlanIntervaloComponent,data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, canDeactivate: [CanDeactivateGuard] }
        ]
      },
      {
        path: 'ordenTrabajo', children: [
          { path: '', component: OrdenListComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'nuevo/:id', component: OrdenTrabajoNuevoComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'ver/:id', component: OrdenTrabajoViewComponent, canDeactivate: [CanDeactivateGuard] }
        ]
      },
      {
        path: 'configuracion', component: ConfiguracionComponent, data: { permittedRoles: ['admin', 'adminMotor', 'adminMaquina'] },
        children: [
          { path: 'alertas', component: AlertasMotorComponent, data: { permittedRoles: ['admin', 'adminMotor'] } }
        ]
      },
      { path: 'registrar', component: RegistroComponent, data: { permittedRoles: ['admin', 'adminMotor', 'adminMaquina'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'error', component: ErrorComponent },
      { path: 'calendario', component: CalendarioComponent, data: { permittedRoles: ['admin', 'adminMotor', 'editorMotor'] }, canDeactivate: [CanDeactivateGuard] },
      { path: 'historialM', component: HistorialComponent},
    ]
  },

  //ruta para el login
  { path: 'user-Login', component: UserComponent },
  { path: 'denegado', component: AccessDenegadoComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
