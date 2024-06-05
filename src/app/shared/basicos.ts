export class cUnidad {
    idUnidad?: number;
    nombre?: string;
    simbolo?: string;
    estado?: number;
    magnitudId?: number;
}

export class cMagnitud {
    idMagnitud?: number;
    nombre?: string;
    estado?:number;
    listUnidad?: cUnidad[];

    /**Solo para seleccionar dicho elemento */
    seleccionActiva?:Boolean;
}

export class cAlerta {
    idAlerta?: number;
    color?: string;
    rangoInicio?:number;
    rangoFin?: number;
    nivelPrioridad?: number;
    tipoMaquinaria?:string;
}

export class cMensaje {
    idMensaje?: number;
    mensaje?: string;
    fechaCreacion?:string;
    emisor?: string;
    destinatrarios?: string;
    
    tiempoCreacion?:string;

    
}

export class cNotificacion {
    idNotificacion?: number;
    descripcion?: string;
    ordenTrabajoId?:number;
    recordatorio?:string;
    fechaCreacion?:string;
    emisor?: string;
    recordatorioHasta?:string;
    estadoProceso?: string;

    realizada?:boolean;
    tiempoCreacion?:string;
}

export class cWhatsapp{
    phone?:string;
    chatname?:string;
    message?:string;
    media?:string;
    caption?:string;
    type?:string;
    title?:string;
    password?:string;

    /**prueba */
    phones?:string[];
}