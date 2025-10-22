export interface InvoiceAdditionalInformation {
    FechaLimite?: string;
    Status?: 0;
    PagosAsociados?: string[],
    Saldo?: number
}


export interface InvoiceEmitter {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
}

export interface InvoiceReceiver {
    Rfc: string;
    Nombre: string;
    DomicilioFiscalReceptor: string;
    RegimenFiscalReceptor: string;
    UsoCFDI: string;
}

export interface InvoiceConcept {
    ClaveProdServ: string;
    NoIdentificacion: string;
    Cantidad: string;
    ClaveUnidad: string;
    Unidad: string;
    Descripcion: string;
    ValorUnitario: string;
    Importe: string;
    Descuento: string
    ObjetoImp: string;
    Impuestos: {

        Traslados?: ImpuestoConcepto[],
        Retenciones?: ImpuestoConcepto[]

    }
}

export interface ImpuestoGeneral {
    TotalImpuestosTrasladados?: string;
    TotalImpuestosRetenidos?: string;

    Retenciones?: [{ Importe: string; Impuesto: string }],
    Traslados?: ImpuestoConcepto[]
}

export interface ImpuestoConcepto {
    Base: string;
    Importe: string;
    Impuesto: string;
    TasaOCuota: string;
    TipoFactor: string;
}


export interface InvoiceSATData {
    cadenaOriginalSAT: string;
    noCertificadoSAT: string;
    noCertificadoCFDI: string;
    uuid: string;
    selloSAT: string;
    selloCFDI: string;
    fechaTimbrado: string;
    qrCode: string;
    cfdi: any;
    pdfUrl?: string;
    xmlUrl?: string;
}

export interface InvoiceMailRequest {
    pdfUrl: string;
    xmlUrl: string;
    uuid?: string;
    emailList: string[];
    ccList: string[];
}