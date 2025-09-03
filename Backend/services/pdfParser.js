const { PDFParse } = require("pdf-parse");

/**
 * Extracts plain text from a PDF file buffer.
 * Throws if the buffer isn't a parseable PDF (e.g. corrupt file, or a
 * scanned/image-only PDF with no text layer — pdf-parse doesn't do OCR).
 *
 * NOTE: pdf-parse v2 uses a class-based API (PDFParse), not the v1
 * `pdf(buffer)` functional call — easy to get wrong if you've used v1 before.
 */
const extractTextFromPDF = async (buffer) => {
    const parser = new PDFParse({ data: buffer });
    let result;
    try {
        result = await parser.getText();
    } finally {
        await parser.destroy();
    }

    let text = (result.text || "").trim();
    // pdf-parse inserts page-separator markers like "-- 1 of 3 --" between
    // pages; strip them since they're not part of the resume content and
    // would otherwise leak into what we send to Groq.
    text = text.replace(/^--\s*\d+\s+of\s+\d+\s*--$/gm, "").trim();

    if (!text) {
        throw new Error(
            "No extractable text found in this PDF. It may be a scanned image without a text layer."
        );
    }

    return text;
};

module.exports = { extractTextFromPDF };
