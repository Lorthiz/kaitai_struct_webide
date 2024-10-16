import GoldenLayout from "golden-layout";
import Ace from "ace-builds";
import "ace-builds/esm-resolver";
import "ace-builds/src-noconflict/theme-monokai";
import {LanguageProvider} from "ace-linters";

export interface IAceEditorComponentOptions {
    lang: string;
    isReadOnly?: boolean;
    data?: string;
}

let worker = new Worker(new URL("./AceLanguageProvider.ts", import.meta.url), {type: "module"});
let languageProvider = LanguageProvider.create(worker);


export const AceEditorComponent = (container: GoldenLayout.Container, {isReadOnly, lang, data}: IAceEditorComponentOptions) => {
    const editor = Ace.edit(container.getElement().get(0), {
        useWorker: false,
        theme: "ace/theme/monokai",
        mode: `ace/mode/${lang}`,
        tabSize: lang === "yaml" ? 2 : 4,
        readOnly: isReadOnly,
        value: data,
    });

    languageProvider.registerEditor(editor);
    return editor;
};