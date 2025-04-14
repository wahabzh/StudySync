import {
    useBlockNoteEditor,
    useComponentsContext,
    useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { useMemo, useState } from "react";
import { continueWriting } from "@/app/ai";
import { checkBlockIsFileBlock } from "@blocknote/core";
import { useSelectedBlocks } from "@blocknote/react";

export const ContinueWritingButton = () => {
    const editor = useBlockNoteEditor();
    const Components = useComponentsContext()!;

    const selectedBlocks = useSelectedBlocks(editor)
    const isFileBlock = useMemo(() => {
        // Checks if only one block is selected.
        if (selectedBlocks.length !== 1) {
          return false;
        }
        const block = selectedBlocks[0];
        // Return true if it's a file block
        return checkBlockIsFileBlock(block, editor);
      }, [editor, selectedBlocks]);
    
    
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

    // Don't render the button if a file block is selected
    if (isFileBlock) {
        return null;
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