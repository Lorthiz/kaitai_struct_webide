import {TreeNodeDisplay, TreeNodeDisplayType} from "../../FileSystemVisitors/FileSystemFileTreeMapper";
import {MenuItem} from "@imengyu/vue3-context-menu/lib/ContextMenuDefine";
import {h} from "vue";
import {useFileSystems} from "../../Store/FileSystemsStore";
import {FILE_SYSTEM_TYPE_KAITAI} from "../../FileSystems/KaitaiFileSystem";
import {FolderPlusIcon} from "@heroicons/vue/16/solid";
import {FileSystemPath} from "../../FileSystemsTypes";

export const FileTreeCtxActionCreateDirectory = (item: TreeNodeDisplay): MenuItem => {
    const action = () => {
        const fileStore = useFileSystems();
        const newFolderName = "New folder";
        const fullPathToNewFolder = item.fullPath
            ? `${item.fullPath}/${newFolderName}`
            : newFolderName;
        fileStore.createDirectory(item.storeId, fullPathToNewFolder);
        fileStore.openPath(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
        fileStore.selectPath(FileSystemPath.of(item.storeId, fullPathToNewFolder));
    };

    return {
        label: "New Folder...",
        onClick: action,
        hidden: [TreeNodeDisplayType.OPEN_FOLDER, TreeNodeDisplayType.CLOSED_FOLDER, TreeNodeDisplayType.EMPTY_FOLDER].indexOf(item.type) === -1,
        customClass: "context-menu-item",
        disabled: item.storeId === FILE_SYSTEM_TYPE_KAITAI,
        icon: () => h(FolderPlusIcon),
    };
};