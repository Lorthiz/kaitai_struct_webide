import {IExportedValue} from "../../ExportedValueTypes";


export const INIT_WORKER_SCRIPTS = "INIT_WORKER_SCRIPTS";
export const PARSE_SCRIPTS = "PARSE_SCRIPTS";


export interface IWorkerParsedResponse {
    error?: Error;
    resultObject: any;
}

export interface IKsyTypes {
    [name: string]: KsySchema.IType;
}

export interface IWorkerApiMethods {
    setCodeAction(sourceCode: string, mainClassName: string, ksyTypes: IKsyTypes): void;

    setInputAction(inputBuffer: ArrayBuffer): void;

    parseAction(eagerMode: boolean): Promise<IWorkerParsedResponse>;

    getPropertyByPathAction(path: string[]): Promise<IExportedValue>;
}
