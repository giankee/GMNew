export class cPlanMantenimiento {
    idPlanMantenimiento?: number;
    nombre?: string;
    descripcion?: string;
    fechaCreacion?: string;
    estado?:number;

    /**Para que coja la parte del plan de otro mantenimiento */
    basadoPlan?:boolean;
    idPlanBasado?:number;

    listIntervalo?: cIntervalo[];
}

export class cIntervalo {
    idIntervaloM?:number;
    planMantenimientoId?:number;
    estadoActivado?:boolean;

    planMantenimiento?:cPlanMantenimiento; 
    listEventoMediciones?: cEventoMediciones[];
    listTareas?: cIntervaloTarea[];

    /**solo para la parte de historial */
    seleccionActiva?:boolean;
}

export class cEventoMediciones {
    idEventoMedicion?: number;
    intervaloId?: number;
    eventoId?: number;
    medicionId?: number;
    valor?: number;

    evento?:cEvento;
    medicion?:cMedicion;
}

export class cEvento {
    idEventoM?: number;
    nombre?: string;
    estado?: number;
    isUnique?: boolean;
    isOne?: boolean;
    /**solo para el select intervalo */
    ocultarSelect?:boolean;
}

export class cMedicion {
    idMedicionM?: number;
    nombre?: string;
    simbolo?: string;
    estado?: number;
}

export class cIntervaloTarea {
    idIntervaloTarea?:number;
    intervaloId?:number;
    tareaId?:number;
    estadoActivado?:boolean;
    listTareaAccion?: cTareaAcciones[];

    tarea?:cTarea;

    /**solo para la parte de 2new y 1old intervaloTarea*/
    disabledSelectTA?:boolean;//tambien sirve para lo de alertas en new ordentrabajo
    advertencia?: boolean; //para q el usuario decidad si esa tarea paso hace cuanto tiempo
    /**fin  */

    /**Solo para la parte de alertas en new ordentrabajo */
    colorAlerta?:string;
    prioridadAlerta?:number;
    /** */

    /**solo para la parte de nuevas acciones de las creadas y para eliminar las creadas*/
    listFiltroAccionP?:cAccion[];
    listFiltroAccionD?:cAccion[];
    listAccionAdicionales?:cAccion[];
    listAccionEliminadas?:cAccion[];
}

export class cTareaAcciones {
    idTareaAccion?: number;
    intervaloTareaId?: number;
    estadoActivado?: boolean;
    accionId?: number;
    accion?:cAccion;
    estado?:number;

    /**Para la parte de nuevo orden de trabajo */
    disabledA?:boolean;
}

export class cTarea {
    idTareaM?: number;
    nombre?: string;
    estado?: number;
    
    /**solo para el select intervalo */
    ocultarSelect?:boolean;
}

export class cAccion {
    idAccionM?: number;
    nombre?: string;
    estado?: number;
}

export class cAuxIT {
    listIntTareas?: cIntervaloTarea[];
    listTareasFiltradas?: cTarea[]; 
    okAddOldIT?: boolean;
    okUpdateIT?: boolean;
    okPlus?:boolean;
}

export class cDialog {
    nombre?: string;
    simbolo?: string; 
    isUnique?: boolean;
    isOne?:boolean;
}

