/**
 * Convert BlockNote JSON content to plain text
 * @param blocks The BlockNote JSON content
 * @returns Plain text representation of the content
 */
export function convertBlocksToText(blocks: any[]): string {
    if (!blocks || !Array.isArray(blocks)) {
        return '';
    }

    return blocks.map(block => {
        let blockText = '';

        // Handle different content formats
        if (typeof block.content === 'string') {
            // Simple string content
            blockText = block.content;
        } else if (Array.isArray(block.content)) {
            // Array of inline content objects
            blockText = block.content.map((item: any) => {
                if (item.type === 'text') {
                    return item.text || '';
                } else if (item.type === 'link') {
                    // For links, include both the text and URL
                    return `${item.content || ''} (${item.href})`;
                }
                return item.content || item.text || '';
            }).join('');
        } else if (block.content && block.content.type === 'tableContent') {
            // Table content
            const rows = block.content.rows || [];
            blockText = rows.map((row: any) => {
                return (row.cells || []).join(' | ');
            }).join('\n');
        }

        // Process children recursively if they exist
        const childrenText = block.children && block.children.length > 0
            ? convertBlocksToText(block.children)
            : '';

        // Format based on block type
        let result = '';

        switch (block.type) {
            case 'heading':
                result = `${blockText}\n\n`;
                break;

            case 'bulletListItem':
                result = `• ${blockText}\n`;
                break;

            case 'numberedListItem':
                result = `- ${blockText}\n`;
                break;

            case 'checkListItem':
                const checkMark = block.props?.checked ? '✓' : '☐';
                result = `${checkMark} ${blockText}\n`;
                break;

            case 'codeBlock':
                result = `${blockText}\n\n`;
                break;

            case 'table':
                result = `${blockText}\n\n`;
                break;

            case 'image':
                const imageCaption = block.props?.caption || '';
                result = imageCaption ? `[Image: ${imageCaption}]\n\n` : '[Image]\n\n';
                break;

            case 'video':
                const videoCaption = block.props?.caption || '';
                result = videoCaption ? `[Video: ${videoCaption}]\n\n` : '[Video]\n\n';
                break;

            case 'audio':
                const audioCaption = block.props?.caption || '';
                result = audioCaption ? `[Audio: ${audioCaption}]\n\n` : '[Audio]\n\n';
                break;

            case 'file':
                const fileName = block.props?.name || block.props?.url || '';
                result = fileName ? `[File: ${fileName}]\n\n` : '[File]\n\n';
                break;

            case 'paragraph':
            default:
                result = blockText ? `${blockText}\n\n` : '\n';
                break;
        }

        // Add children content
        if (childrenText) {
            result += childrenText;
        }

        return result;
    }).join('').trim();
}

/**
 * Convert BlockNote JSON content to Markdown
 * @param blocks The BlockNote JSON content
 * @returns Markdown representation of the content
 */
export function convertBlocksToMarkdown(blocks: any[]): string {
    if (!blocks || !Array.isArray(blocks)) {
        return '';
    }

    return blocks.map(block => {
        let blockText = '';

        // Handle different content formats
        if (typeof block.content === 'string') {
            // Simple string content
            blockText = block.content;
        } else if (Array.isArray(block.content)) {
            // Array of inline content objects
            blockText = block.content.map((item: any) => {
                if (item.type === 'text') {
                    let text = item.text || '';

                    // Apply styles if they exist
                    if (item.styles) {
                        if (item.styles.bold) text = `**${text}**`;
                        if (item.styles.italic) text = `*${text}*`;
                        if (item.styles.underline) text = `<u>${text}</u>`;
                        if (item.styles.strike) text = `~~${text}~~`;
                        if (item.styles.code) text = `\`${text}\``;
                    }

                    return text;
                } else if (item.type === 'link') {
                    // Format as markdown link
                    return `[${item.content || ''}](${item.href})`;
                }
                return item.content || item.text || '';
            }).join('');
        } else if (block.content && block.content.type === 'tableContent') {
            // Table content in markdown format
            const rows = block.content.rows || [];
            if (rows.length > 0) {
                // Create header row
                const headerRow = (rows[0].cells || []).map(() => '---').join(' | ');

                // Format all rows
                const formattedRows = rows.map((row: any) => {
                    return (row.cells || []).join(' | ');
                }).join('\n');

                // Combine with markdown table syntax
                blockText = `${rows[0].cells.join(' | ')}\n${headerRow}\n${formattedRows.substring(formattedRows.indexOf('\n') + 1)}`;
            }
        }

        // Process children recursively
        const childrenText = block.children && block.children.length > 0
            ? convertBlocksToMarkdown(block.children)
            : '';

        // Format based on block type
        let result = '';

        switch (block.type) {
            case 'heading':
                const level = block.props?.level || 1;
                const headingMarker = '#'.repeat(level);
                result = `${headingMarker} ${blockText}\n\n`;
                break;

            case 'bulletListItem':
                result = `- ${blockText}\n`;
                break;

            case 'numberedListItem':
                result = `1. ${blockText}\n`;
                break;

            case 'checkListItem':
                const checkMark = block.props?.checked ? '[x]' : '[ ]';
                result = `- ${checkMark} ${blockText}\n`;
                break;

            case 'codeBlock':
                const language = block.props?.language || '';
                result = `\`\`\`${language}\n${blockText}\n\`\`\`\n\n`;
                break;

            case 'table':
                result = `${blockText}\n\n`;
                break;

            case 'image':
                const imageUrl = block.props?.url || '';
                const imageCaption = block.props?.caption || 'Image';
                result = `![${imageCaption}](${imageUrl})\n\n`;
                break;

            case 'video':
                const videoUrl = block.props?.url || '';
                const videoCaption = block.props?.caption || '';
                result = videoCaption
                    ? `[Video: ${videoCaption}](${videoUrl})\n\n`
                    : `[Video](${videoUrl})\n\n`;
                break;

            case 'audio':
                const audioUrl = block.props?.url || '';
                const audioCaption = block.props?.caption || '';
                result = audioCaption
                    ? `[Audio: ${audioCaption}](${audioUrl})\n\n`
                    : `[Audio](${audioUrl})\n\n`;
                break;

            case 'file':
                const fileUrl = block.props?.url || '';
                const fileName = block.props?.name || 'File';
                result = `[${fileName}](${fileUrl})\n\n`;
                break;

            case 'paragraph':
            default:
                result = blockText ? `${blockText}\n\n` : '\n';
                break;
        }

        // Add children content
        if (childrenText) {
            result += childrenText;
        }

        return result;
    }).join('').trim();
} 