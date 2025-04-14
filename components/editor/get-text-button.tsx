import {
    useBlockNoteEditor,
    useComponentsContext,
} from "@blocknote/react";
import "@blocknote/shadcn/style.css";
import { useMemo } from "react";
import { performOCR } from "@/app/ai";
import { checkBlockIsFileBlock } from "@blocknote/core";
import { useSelectedBlocks } from "@blocknote/react";
import { useToast } from "@/hooks/use-toast";

export const GetTextButton = () => {
    const editor = useBlockNoteEditor();
    const Components = useComponentsContext()!;
    const { toast } = useToast();
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

    const handleGetText = async () => {
        try {
            const currentBlock = editor.getTextCursorPosition().block;
            if (currentBlock.type === "image") {
                const imageUrl = currentBlock.props.url;
                const data = await performOCR(imageUrl);
                if (!data.text) {
                    throw new Error('No text detected in the image.');
                }

                // Insert the OCR text into the editor
                editor.insertBlocks(
                    [
                        {
                            type: "paragraph",
                            content: data.text,
                        },
                    ],
                    currentBlock,
                    "after"
                );
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Failed to get text from image.",
            });
        }
    }

    // Don't render the button if a file block is selected or if we're not in an image block
    if (!isFileBlock || editor.getTextCursorPosition().block.type !== "image") {
        return null;
    }

    return (
        <Components.FormattingToolbar.Button
            mainTooltip={"Get Text"}
            onClick={handleGetText}
        >
            Get Text
        </Components.FormattingToolbar.Button>
    );
}