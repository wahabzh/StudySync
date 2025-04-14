"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { PDFExporter, pdfDefaultSchemaMappings } from "@blocknote/xl-pdf-exporter";
import { pdf, Image as PdfImage, View } from "@react-pdf/renderer";
import { createClient } from "@/utils/supabase/client";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DOCXExporter,
  docxDefaultSchemaMappings,
} from "@blocknote/xl-docx-exporter";
import { Paragraph, ImageRun } from "docx";

// PDF page dimensions (A4 size in points)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 40;
const CONTENT_HEIGHT = PAGE_HEIGHT - (PAGE_MARGIN * 2);

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
  },
});

// // Helper to get natural image dimensions
// const getImageDimensions = (src: string): Promise<{ width: number, height: number }> => {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.onload = () => {
//       resolve({
//         width: img.naturalWidth,
//         height: img.naturalHeight
//       });
//     };
//     img.onerror = () => resolve({ width: 400, height: 300 }); // Fallback
//     img.src = src;
//   });
// };

// // PDF image mapper with original sizes
// const pdfImageMapper = async (
//   block: any,
//   nestingLevel: number,
//   remainingPageHeight: number
// ) => {
//   const dimensions = await getImageDimensions(block.props.src);
//   const aspectRatio = dimensions.width / dimensions.height;

//   // Scale down if too large for page
//   let displayWidth = dimensions.width;
//   let displayHeight = dimensions.height;

//   if (dimensions.width > PAGE_WIDTH - (PAGE_MARGIN * 2)) {
//     displayWidth = PAGE_WIDTH - (PAGE_MARGIN * 2);
//     displayHeight = displayWidth / aspectRatio;
//   }

//   if (displayHeight > remainingPageHeight) {
//     displayHeight = remainingPageHeight;
//     displayWidth = displayHeight * aspectRatio;
//   }

//   const needsNewPage = displayHeight > remainingPageHeight;

//   return {
//     element: (
//       <View
//         key={`${block.id}-${nestingLevel}`}
//         style={{
//           marginVertical: 8,
//           minHeight: displayHeight,
//           ...(needsNewPage && { pageBreakBefore: "always" }),
//         }}
//         wrap={false}
//       >
//         <PdfImage
//           src={block.props.src}
//           style={{
//             width: displayWidth,
//             height: displayHeight,
//             maxWidth: '100%',
//             objectFit: "contain",
//           }}
//         />
//       </View>
//     ),
//     height: needsNewPage ? displayHeight : 0,
//   };
// };

// // DOCX image mapper with original sizes
// const docxImageMapper = async (block: any) => {
//   try {
//     // Fetch the image data
//     const response = await fetch(block.props.src);
//     const arrayBuffer = await response.arrayBuffer();
//     const imageData = new Uint8Array(arrayBuffer);

//     // Determine image type from URL or content
//     const dimensions = await getImageDimensions(block.props.src);
//     const aspectRatio = dimensions.width / dimensions.height;

//     // Scale down if too large for page
//     let displayWidth = dimensions.width;
//     let displayHeight = dimensions.height;

//     if (dimensions.width > PAGE_WIDTH - (PAGE_MARGIN * 2)) {
//       displayWidth = PAGE_WIDTH - (PAGE_MARGIN * 2);
//       displayHeight = displayWidth / aspectRatio;
//     }
//     const imageType = block.props.src.split('.').pop()?.toLowerCase() || 'png';

//     return new Paragraph({
//       children: [
//         new ImageRun({
//           data: imageData,
//           transformation: {
//             width: displayWidth,
//             height: displayHeight,
//           },
//           type: imageType === 'svg' ? 'svg' : 'png', // Required for SVG
//           fallback: imageType === 'svg' ? 'png' : imageType, // Required for SVG
//         }),
//       ],
//     });
//   } catch (error) {
//     console.error("Failed to process image for DOCX:", error);
//     // Fallback to empty paragraph if image fails to load
//     return new Paragraph({ children: [] });
//   }
// };

export default function DownloadButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState<"pdf" | "docx" | false>(false);

  const handleDownload = async (format: "pdf" | "docx") => {
    setLoading(format);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error || !data) {
        throw new Error("Document not found.");
      }

      const { title, content } = data;

      if (format === "pdf") {
        const exporter = new PDFExporter(schema, {
          blockMapping: pdfDefaultSchemaMappings.blockMapping,
          inlineContentMapping: pdfDefaultSchemaMappings.inlineContentMapping,
          styleMapping: pdfDefaultSchemaMappings.styleMapping,
        });

        // Temporarily override console.error
        const originalConsoleError = console.error;
        console.error = (...args) => {
          if (typeof args[0] === 'string' && args[0].includes('key')) {
            return; // Suppress key warnings
          }
          originalConsoleError.apply(console, args);
        };

        try {
          const pdfDocument = await exporter.toReactPDFDocument(content, title);
          const blob = await pdf(pdfDocument).toBlob();

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${title || "document"}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
        } finally {
          // Restore original console.error
          console.error = originalConsoleError;
        }
      }
      else if (format === "docx") {
        const exporter = new DOCXExporter(schema, {
          blockMapping: docxDefaultSchemaMappings.blockMapping,
          inlineContentMapping: docxDefaultSchemaMappings.inlineContentMapping,
          styleMapping: docxDefaultSchemaMappings.styleMapping,
        });

        const blob = await exporter.toBlob(content, title);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title || "document"}.docx`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error(`Failed to download ${format.toUpperCase()}`, err);
      toast({
        title: `${format.toUpperCase()} download failed`,
        description: err.message || `Something went wrong while generating the ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={!!loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem key="pdf" onClick={() => handleDownload("pdf")}>
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem key="docx" onClick={() => handleDownload("docx")}>
          Download as DOCX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}