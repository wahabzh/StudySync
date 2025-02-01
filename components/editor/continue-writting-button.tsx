import {
    useBlockNoteEditor,
    useComponentsContext,
    useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { useState } from "react";
import { continueWriting } from "@/app/ai";

export const ContinueWritingButton = () => {
    const editor = useBlockNoteEditor();
    const Components = useComponentsContext()!;

    // state to store selected text
    const [selectedText, setSelectedText] = useState(editor.getSelectedText());

    // update selected text when the editor content or selection changes
    useEditorContentOrSelectionChange(() => {
        setSelectedText(editor.getSelectedText());
    }, editor);

    const handleContinueWriting = async () => {
        console.log(selectedText);
        // TODO: call AI API here
        const documentMarkdown = await editor.blocksToMarkdownLossy(editor.document);
        const response = await continueWriting(selectedText, documentMarkdown);


        editor.insertInlineContent([
            { type: "text", text: response, styles: {} }
        ]);

    }

    return (
        <Components.FormattingToolbar.Button
            mainTooltip={"Continue Writing"}
            onClick={handleContinueWriting}
        >
            Continue Writing
        </Components.FormattingToolbar.Button>
    );
}