import {IFileSystem, IFsItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../../../v1/FileSystems/FileSystemsTypes";

export enum TreeNodeDisplayType {
    OPEN_FOLDER,
    CLOSED_FOLDER,
    EMPTY_FOLDER,
    BINARY_FILE,
    KSY_FILE
}

export interface TreeNodeDisplay {
    fullPathWithStore: string;
    fullPath: string;
    fileName: string;
    type: TreeNodeDisplayType;
    storeId: string;
    depth: number;
}

interface TempFileSystemVisitorDirectory {
    treeNodeDisplay: TreeNodeDisplay;
    directories: TempFileSystemVisitorDirectory[];
    files: TreeNodeDisplay[];
}

export const prepareFilePathFromNode = (node: TreeNodeDisplay) => node.fullPath;

export class FileSystemVisitor {
    public static collectTreeNodesFromFileSystem(fileSystem: IFileSystem, openPaths: string[]): TreeNodeDisplay[] {
        return new FileSystemVisitor().collectVisibleFileTreeItems(fileSystem, openPaths);
    }

    private openPaths: string[];
    private currentPathParts: string[] = [];
    private collectedPaths: TreeNodeDisplay[] = [];
    private currentDirectoryPathStack: TempFileSystemVisitorDirectory[] = [];
    private currentDirectory: TempFileSystemVisitorDirectory;
    private rootDirectory: TempFileSystemVisitorDirectory;

    private constructor() {
    }

    private collectVisibleFileTreeItems(fileSystem: IFileSystem, openPaths: string[]) {
        this.openPaths = openPaths;
        this.visitFileSystem(fileSystem);
        return this.collectedPaths;
    }

    private visitFileSystem(fileSystem: IFileSystem) {
        const rootNode = fileSystem.getRootNode();
        if (!rootNode) {
            return;
        }

        this.visitRootNode(rootNode);
        this.collectPathsFromDirectory(this.rootDirectory);
    }

    private visitRootNode(rootNode: IFsItem) {
        const rootNodeDirectory = this.mapToTempTreeNodeDisplay(rootNode, rootNode.fn);
        this.rootDirectory = rootNodeDirectory;
        this.currentDirectory = rootNodeDirectory;

        if (rootNodeDirectory.treeNodeDisplay.type === TreeNodeDisplayType.OPEN_FOLDER) {
            this.visitChildrenNodes(rootNode);
        }
    }

    private visitChildrenNodes(fsItem: IFsItem) {
        Object.entries(fsItem.children || {})
            .forEach(([key, child]) => {
                this.visitNode(key, child);
            });
    }

    private visitNode(nodeName: string, fsItem: IFsItem) {
        this.currentPathParts.push(nodeName);

        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                this.visitFileNode(fsItem, nodeName);
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                this.visitDirectoryNode(fsItem, nodeName);
                break;
            }
        }

        this.currentPathParts.pop();
    }

    private visitFileNode(fsItem: IFsItem, nodeName: string) {
        const newNode = this.mapToTreeNodeDisplay(fsItem, nodeName);
        this.currentDirectory.files.push(newNode);
    }

    private visitDirectoryNode(fsItem: IFsItem, nodeName: string) {
        const newDirectory = this.mapToTempTreeNodeDisplay(fsItem, nodeName);
        this.currentDirectory.directories.push(newDirectory);

        if (newDirectory.treeNodeDisplay.type !== TreeNodeDisplayType.OPEN_FOLDER) {
            return;
        }

        this.currentDirectoryPathStack.push(this.currentDirectory);
        this.currentDirectory = newDirectory;
        this.visitChildrenNodes(fsItem);

        this.currentDirectory = this.currentDirectoryPathStack.pop();
    }

    private collectPathsFromDirectory(tempDirectory: TempFileSystemVisitorDirectory) {
        this.collectedPaths.push(tempDirectory.treeNodeDisplay);
        tempDirectory.directories.sort((d1, d2) => d1.treeNodeDisplay.fileName.localeCompare(d2.treeNodeDisplay.fileName));
        tempDirectory.directories.forEach((dir) => this.collectPathsFromDirectory(dir));
        tempDirectory.files.sort((d1, d2) => d1.fileName.localeCompare(d2.fileName));
        this.collectedPaths.push(...tempDirectory.files);
    }

    private mapToTempTreeNodeDisplay(fsItem: IFsItem, nodeName: string): TempFileSystemVisitorDirectory {
        const baseInfo = this.mapToTreeNodeDisplay(fsItem, nodeName);
        return {
            treeNodeDisplay: baseInfo,
            directories: [],
            files: []
        };
    }

    private mapToTreeNodeDisplay(fsItem: IFsItem, name: string): TreeNodeDisplay {
        const fullPath = this.currentPathParts.join("/");
        const fullPathWithStore = `${fsItem.fsType}:${fullPath}`;
        const isOpen = this.isDirectoryOpen(fullPathWithStore);
        return {
            fileName: name,
            fullPath: fullPath,
            fullPathWithStore: fullPathWithStore,
            type: this.getNodeType(isOpen, fsItem),
            storeId: fsItem.fsType,
            depth: this.currentPathParts.length
        };
    }

    private getNodeType(isOpen: boolean, fsItem: IFsItem): TreeNodeDisplayType {
        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                return fsItem.fn.endsWith(".ksy") ? TreeNodeDisplayType.KSY_FILE : TreeNodeDisplayType.BINARY_FILE;
            }
            case ITEM_MODE_DIRECTORY: {
                if (Object.keys(fsItem.children).length === 0) return TreeNodeDisplayType.EMPTY_FOLDER;
                return isOpen ? TreeNodeDisplayType.OPEN_FOLDER : TreeNodeDisplayType.CLOSED_FOLDER;
            }
        }
    }

    private isDirectoryOpen(path: string) {
        return !!this.openPaths.find(openPath => openPath === path);
    }
}