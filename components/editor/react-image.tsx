// "use client";

// import { createBlockSpec, InlineContent, defaultProps } from "@blocknote/core";

// import * as React from "react";

// const CustomImageBlock = createBlockSpec({
//     type: "image",
//     propSchema: {
//         ...defaultProps
//     },
//     content: "none",
// },
//     {
//         render: ({ block, contentRef }) => {
//             return <div></div>
//         }
//     });
import { ImageBlock } from "@blocknote/react";

import { BlockNoteEditor, defaultProps } from "@blocknote/core";
import { createReactBlockSpec, ReactImageBlock } from "@blocknote/react";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";

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
    // AI call here
    // TODO
    console.log(imageUrl);

    try {
        const response = await fetch('/api/ocr', {
            method: 'POST',
            body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) {
            throw new Error('Failed to process the image.');
        }

        const data = await response.json();
        
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
    // TODO
    console.log(imageUrl);

    // insert the text into the editor
    editor.insertBlocks(
        [
            {
                type: "paragraph",
                content: "AI Analysis: This image appears to be...",
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