import { cMaquinaria } from './maquinaria/cMaquinaria.model';
import { cHistorialBM } from './ordenTrabajo/cOrdenModel.model';

export class cBarco {
        idBarco?: number;
        nombre?: string;
        armador?: string;
        constructorB?: string;
        lugarConstruccion?: string;
        anioConstruccion?: string;
        lugarReConstruccion?: string;
        anioReConstruccion?: string;
        numMatricula?: string;
        materialCasco?: string;
        eslora?: number;
        manga?: number;
        puntal?: number;
        calado?: number;
        tonelajeBruto?: number;
        tonelajeNeto?: number;
        desMaximaCarga?: number;
        capacidadBodega?: number;
        tipoBodega?: string;
        metodoPesca?: string;
        estado?: number;
        nombreI?: string;
        listBarcoMaquinarias?: cBarcoMaquinarias[];
        listGaleriaArchivoBarcos?: cGaleriaArchivoBarco[];
}
export class cUpdateImage {
        nombreImage?: string;
        imageFile?: File;
}

export class cGaleriaArchivoBarco {
        idGaleriaGeneral?: number;
        barcoId?: number;
        barcoMaquinariaId?: number;
        tipoArchivo?: string;
        extension?: string;
        nombreArchivo?: string;
        rutaArchivo?: string;
        maquinariaNombre?: string;
}

export class auxBarcoSelect {
        idBarco?: number;
        nombre?: string;
        disabledSelect?: boolean;
}

export class cBarcoMaquinarias {
        idBarcoMaquinaria?: number;
        nombre?: string;
        barcoId?: number;
        maquinariaId?: number;
        serie?: string;
        potencia?: number;
        unidadId?: number;
        horasServicio?: number;
        nombreI?: string;
        estado?: number;
        fechaIncorporacionB?: string;
        checkMaquinaria?: boolean;

        modeloMaquinaria?: string;//
        unidadNombre?: string;//para barcomaquinaria
        controladorActivo?:boolean//para maquinariaform

        barco?: cBarco;
        maquinaria?: cMaquinaria;

        listHistorialBM?: cHistorialBM[];

}