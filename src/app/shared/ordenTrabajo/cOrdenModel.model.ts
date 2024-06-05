
import { cBarcoMaquinarias } from '../barco.model';
import { cNotificacion } from '../basicos';
import { cIntervalo, cTarea, cPlanMantenimiento } from '../mantenimiento/cManModel.model';

export class cOrdenTrabajoB {
    idOrdenT?: number;
    titulo?: string;
    tipoMantenimiento?:string;
    barcoMaquinariaId?: number;
    valorHS?: number;
    fechaIngreso?: string;
    fechaFinalizacion?: string;
    responsable?: string;
    supervisor?: string;
    estadoProceso?: string;
    descripcionSolicitud?: string;
    marea?:string;
    barcoMaquinaria?: cBarcoMaquinarias;

    listTareaO?: cTareaO[];
    listGaleriaArchivoOrdenes?:cGaleriaArchivoOrden[];

    //para validar el formulario
    barcoSelected?: number;
    //para multiples maquinarias;
    nombreMaquinaria?:string;
}

export class cTareaO {
    idTareaO?: number;
    ordenTrabajoId?: number;
    tareaMId?: number;
    observacion?: string;
    reponsableTarea?: string;
    estadoRealizado?: boolean;
    notificacionId?:number;
    
    /**Para ocultar las tareas Adicionales para el componente ordenesTrabajoNew*/
    seleccionActiva?:Boolean;
    disabledSelectTA?:boolean;
    mostrarbtnNotify?:boolean;
    error?:boolean;//para el view
    /**fin ocultar */

    intervaloM?: cIntervalo;
    tareaM?:cTarea;
    notificacion?:cNotificacion;
    listAccionesRealizadaO?: cAccionO[];
}

export class cAccionO {
    idAccionO?: number;
    tareaOId?: number;
    accionId?: number;
    nombreAccionM?: string;
    strIntervalos?:string;
    estadoRealizado?: boolean;

    tareaO?: cTareaO;
}

export class cHistorialBM{
    idHistorialBM?:number;
    barcoMaquinariaId?:number;
    tareaMId?:number;
    intervaloId?:number;
    periodoVigente?:string;    
    barcoMaquinaria?:cBarcoMaquinarias;
    listHistoTaOrdenes?:cHistorialTaOrden[];
}

export class cHistorialTaOrden{
    idHistorialTaOrden?:number;
    historialBMID?:number; 
    ordenTId?:number;
    listAcciones?:string;
    ordenT?: cOrdenTrabajoB;
}

export class cHistorialProyeccion{
    barcoMaquinariaId?:number
    tareaMId?:number;
    intervaloId?:number;
    fechaFinalizacion?:string;
    valorHS?:number;
}

export class cHistorialesProyeccion{
    idBarcoMaquinaria?:number;
    idPlanMantenimiento?:number;
    nombreMaquinaria?:string;
    listOrdenesMaquinaria?:cOrdenTrabajoB[];
    planMaquinaria?: cPlanMantenimiento;
    historialMaquinaria?:cHistorialProyeccion[];//para el calendario
    historialMaquinaria2?:cHistorialBM[];//para el historial
    //para tener este dato presente
    fechaIncorporacionBM?:string;
}

export class cGaleriaArchivoOrden{
    idArchivo?:number;
    ordenTrabajoId?:number;
    tareaOId?:number;
    tipoArchivo?: string;
    extension?:string;
    nombreArchivo?:string;
    rutaArchivo?:string;
    tareaNombre?:string;
}

export class cHistorialIn{
    indiceIntervalo?:number;
    indiceTarea?:number;
    listFechas?:cListaHistorialHechas[];
}

export class cListaHistorialHechas{
    historialTaOrdenId?:number;
    ordenTId?:number;
    ordenT?:cOrdenTrabajoB;
    marcar?:boolean;
}