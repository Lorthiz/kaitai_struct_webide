import {defineStore} from "pinia";
import {FileSystem} from "../FileSystemsTypes";

export interface FileSystemsStore {
    fileSystems: FileSystem[];
    openPaths: string[];
    selectedPath: string;
}

const serializeConfigToLocalStorage = (store: FileSystemsStore) => {
    const config = JSON.stringify({
        fileSystems: [],
        selectedPath: store.selectedPath,
        openPaths: store.openPaths,
    });
    localStorage.setItem("FileTree", config);
};


export const useFileSystems = defineStore("FileSystemsStore", {
    state: (): FileSystemsStore => {
        return JSON.parse(localStorage.getItem("FileTree")) || {
            fileSystems: [],
            openPaths: [],
            selectedPath: ""
        };
    },
    actions: {
        addFileSystem(fileSystem: FileSystem) {
            this.fileSystems.push(fileSystem);
        },
        openPath(pathToAdd: string) {
            this.openPaths.push(pathToAdd);
            serializeConfigToLocalStorage(this);
        },
        closePath(pathToRemove: string) {
            this.openPaths = this.openPaths.filter((path: string) => path !== pathToRemove);
            serializeConfigToLocalStorage(this);
        },
        selectPath(path: string) {
            this.selectedPath = path;
            serializeConfigToLocalStorage(this);
        },
        async addFile(storeId: string, path: string, content: string | ArrayBuffer) {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === storeId);
            await fileSystem.put(path, content);
        },
        async createDirectory(storeId: string, path: string) {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === storeId);
            await fileSystem.createDirectory(path);
        },
        async getFile(storeId: string, filePath: string): Promise<string | ArrayBuffer> {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === storeId);
            return !!fileSystem
                ? await fileSystem.get(filePath)
                : "";
        },
        deletePath(storeId: string, filePath: string): void {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === storeId);
            if (fileSystem) {
                fileSystem.delete(filePath);
            } else {
                console.error(`[FileSystemsStore][deletePath] Could not find file system! [${storeId}]`);
            }
        }
    }
});
