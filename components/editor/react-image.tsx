import { BlockNoteEditor, defaultProps } from "@blocknote/core";
import { createReactBlockSpec, ReactImageBlock } from "@blocknote/react";
import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { performOCR, askAIAboutImage } from "@/app/ai";

export const ReactImage = createReactBlockSpec(
    {
        type: "reactImage",
        propSchema: {
            ...defaultProps,
            src: {
                default: "https://via.placeholder.com/1000",
            },
        },
        content: "inline",
    },
    {
        render: ({ block, contentRef, editor }) => {
            return (
                <div className="relative">
                    <div className="absolute right-2 top-2 flex gap-2">
                        <Button className="w-20 bg-primary text-white" onClick={() => askAI(editor, block.props.src)}>Ask AI</Button>
                        <Button className="w-20 bg-primary text-white" onClick={() => getText(editor, block.props.src)}>Get Text</Button>
                    </div>
                    <div className="flex flex-col">
                        <img
                            className="w-full"
                            src={block.props.src}
                            alt={"test"}
                            contentEditable={false}
                        />
                        <span ref={contentRef} className="flex-grow" />
                    </div>
                </div>
            );
        },
    }
);

const getText = async (editor: BlockNoteEditor<any, any, any>, imageUrl: string) => {
    try {
        const data = await performOCR(imageUrl);
        if (!data.text) {
            throw new Error('No text detected in the image.');
        }

        // insert the text into the editor
        editor.insertBlocks(
            [
                {
                    type: "paragraph",
                    content: data.text,
                },
            ],
            editor.getTextCursorPosition().block,
            "after"
        );
    } catch (error) {
        console.error('Error:', error);
        throw new Error('An error occurred while performing OCR.');
    }
};

// ask ai fn, inserts some placeholder text beloe the image for now
const askAI = async (editor: BlockNoteEditor<any, any, any>, imageUrl: string) => {
    // AI call here
    console.log(imageUrl);
    const response = await askAIAboutImage(imageUrl);
    if (!response) {
        throw new Error('Failed to ask AI about the image.');
    }

    // insert the text into the editor
    editor.insertBlocks(
        [
            {
                type: "paragraph",
                content: response,
            },
        ],
        editor.getTextCursorPosition().block,
        "after"
    );
};

export const insertReactImage = (editor: BlockNoteEditor<any, any, any>) => ({
    title: "Insert React Image",
    onItemClick: () => {
        const src = prompt("Enter image URL") || "https://via.placeholder.com/1000";
        editor.insertBlocks(
            [
                {
                    type: "reactImage",
                    props: {
                        src,
                    },
                },
            ],
            editor.getTextCursorPosition().block,
            "after"
        );
    },
    subtext: "Insert an image",
    icon: <Image />,
    aliases: [
        "react",
        "reactImage",
        "react image",
        "image",
        "img",
        "picture",
        "media",
    ],
    group: "Media2",
});