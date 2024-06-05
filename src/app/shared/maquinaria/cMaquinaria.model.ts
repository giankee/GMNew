
import { cBarcoMaquinarias } from '../barco.model';
import { cMagnitud } from '../basicos';
import { cPlanMantenimiento } from '../mantenimiento/cManModel.model';

export class cMaquinaria {
    idMaquina?: number;
    tipoMaquinaria?: string;
    marca? : string;
    modelo? : string;
    estado?:number;
    planMantenimientoId?:number;
    listdetalleFichaM?: cDetalleFichaM[];
    planMantenimiento?: cPlanMantenimiento;
    listBarcoMaquinaria?: cBarcoMaquinarias[];
}

export class cItem {
    idItem?: number;
    nombre?: string;
    estado?: number;
    magnitudId?: number;

    magnitud?: cMagnitud;

    /**Solo para seleccionar dicho elemento */
    seleccionActiva?:Boolean;

    listItem_itemCategory?: cItem_itemCategory[];
    listItem_identidad?: cItem_identidad[];
}

export class cDetalleFichaM {
    idDetalleFichaM?: number;
    maquinariaId?: number;
    itemId?:number;
    estado?:number;
    item?:cItem;
    listDetalleCollection?: cDetalleCollect[];
    mostrar?:boolean;

    //
    itemNombre?:string;
}

export class cDetalleCollect {
    idDetalleCollection?: number;
    detalleFichaMId?:number;
    itemCategoryId?:number;
    categoryNombre?:string;
    valor: any; 
    unidadId?: number;
    unidadSimbolo?:string;
    itemCategory?: cItemCategory;
    detalleFichaM?: cDetalleFichaM;
}

export class cItemCategory {
    idItemCategory?: number;
    nombre?: string; 
    estado?: number;

    /**Solo para seleccionar dicho elemento */
    seleccionActiva?:Boolean;
}

export class cItem_itemCategory {
    idItem_itemCategory?: number;
    itemId?: number;
    itemCategoryId?: number;

    ItemCategoryNombre?: string;
    estado?: number;

    itemCategory?:cItemCategory; 
    
}

export class cIdentidadM {
    idIdentidadM?: number;
    nombre?: string; 
    estado?: number;
}

export class cItem_identidad {
    idItem_identidad?: number;
    itemId?: number;
    identidadMId?: number;
    opcional?: boolean;
    estado?: number;
    identidadM?:cIdentidadM; 
}

export class cAuxOpcional{
    idItem_identidad?: number;
    itemId?: number;
    
    idIdentidad?:number;
    nombreidentidad?:string;
    isOrNot?:boolean;
}

export class cSelectorObejos {
    idObjeto?: number; //para MaquininaItemComponent y itemComponet
    nombreObjeto?: string; //para MaquininaItemComponent y itemComponet
}

export interface iSelectorCategory {
    idItem_itemCategory:number;
    idItemCategory:number;
    nombre:string;
    valor?:number; //solo para MaquinariaitemComponent
}