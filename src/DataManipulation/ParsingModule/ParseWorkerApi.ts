import {KaitaiCodeWorkerWrapper} from "./CodeExecution/KaitaiCodeWorkerWrapper";
import {WorkerFunctionStack} from "./CodeExecution/WorkerFunctionStack";
import {IWorkerMessageInit} from "./CodeExecution/WorkerMessages";
import {INIT_WORKER_SCRIPTS, IWorkerApiMethods} from "./CodeExecution/Types";

const codeExecutorWorker = new Worker(new URL("data-url:./CodeExecution/KaitaiCodeWorker.ts", import.meta.url));
const workerFunctionStack = new WorkerFunctionStack();
const workerWrapper = new KaitaiCodeWorkerWrapper(workerFunctionStack, codeExecutorWorker);

const initScriptsMessage: IWorkerMessageInit = {
    type: INIT_WORKER_SCRIPTS,
    scripts: {
        kaitaiStream: `${location.protocol}//${location.host}/KaitaiStream.js`,
        zlib: `${location.protocol}//${location.host}/pako_inflate.js`
    }
};
workerWrapper.sendMessageToWorker(initScriptsMessage);

export const codeExecutionWorkerApi: IWorkerApiMethods = {
    setCodeAction: workerWrapper.setCodeAction,
    setInputAction: workerWrapper.setInputAction,
    parseAction: workerWrapper.parseAction,
    getPropertyByPathAction: workerWrapper.getPropertyByPathAction
};