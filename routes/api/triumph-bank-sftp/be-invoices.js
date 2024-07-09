const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const Load = require('../../../models/Load');
const { createCanvas, loadImage } = require('canvas');


const BEInvoices = async (loadIds, res) => {
    console.log("LoadIds for which invoices needs to be generated : ", loadIds)
    try {
        await Promise.all(loadIds.map(loadId => {
            createInvoicePDF(loadId)
        }))

        res.send({ success: true, message: "generated all invoices on the backend dynamically !" })
    }
    catch (err) {
        console.log("Error Message :", err.message)
    }
}


const createInvoicePDF = async (loadID) => {

    const loadData = await Load.findOne({ loadNumber: loadID })

    console.log("loadData", loadData.bucketFiles)

    if (loadData.bucketFiles) {
        mergePDFs(loadData.bucketFiles, loadData)
    }
}


const addTopPortionOfThePDF = async (mergedPdf, loadData) => {
    const customPdf = await PDFDocument.create();
    const page = customPdf.addPage([612, 792]);

    const helveticaFont = await customPdf.embedFont(StandardFonts.Helvetica);

    // Draw header
    page.drawText('Sunny Freight', {
        x: 50,
        y: 750, // Adjusted to start closer to the top
        size: 20,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('Invoice', {
        x: 500,
        y: 750, // Adjusted to start closer to the top
        size: 20,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    // Draw Bill To and Load Number
    page.drawText('Bill To:', {
        x: 50,
        y: 700, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('Arrive Logistics', {
        x: 100,
        y: 700, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Load Number: ${loadData.loadNumber}`, {
        x: 400,
        y: 700, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    // Draw services table headers
    page.drawText('Services', {
        x: 50,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('Quantity', {
        x: 200,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('Price', {
        x: 300,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText('Amount', {
        x: 400,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    // Draw table line
    page.drawLine({
        start: { x: 50, y: 640 }, // Adjusted y position
        end: { x: 550, y: 640 }, // Adjusted y position
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    // Draw total
    page.drawText('Total: $0.00', {
        x: 500,
        y: 600, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    // Merge the custom PDF page first
    const [customPage] = await mergedPdf.copyPages(customPdf, [0]);
    mergedPdf.addPage(customPage);
}

async function mergePDFs(files, loadData) {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    addTopPortionOfThePDF(mergedPdf, loadData)

    // Iterate over each file
    for (const file of files) {
        if (file.fileType === 'proofDelivery') {
            // Handle proofDelivery as an image or any type
            const response = await fetch(file.fileLocation);
            const arrayBuffer = await response.arrayBuffer();
            console.log("ArrayBuffer", arrayBuffer)
            console.log("ArrayBuffer", response.headers)
            // Check if it's an image (you can add other type checks here)
            if (response.headers.get('content-type').startsWith('image')) {
                console.log("Its an Image ")
                convertImageToPdf(arrayBuffer, mergedPdf, response.headers.get('content-type'))

            } else {
                // Treat non-image proofDelivery files (e.g., other types) as regular PDFs
                const pdfDoc = await PDFDocument.load(arrayBuffer);

                // Copy pages to merged PDF
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }
        } else {
            // Handle rateConfirmation and accessorialsFiles as PDFs
            const response = await fetch(file.fileLocation);
            const arrayBuffer = await response.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Copy pages to merged PDF
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }
    }

    // Serialize the merged document to bytes (a Uint8Array)
    const mergedPdfBytes = await mergedPdf.save();

    // Save the merged PDF to a file
    fs.writeFileSync('merged.pdf', mergedPdfBytes);
}


async function convertImageToPdf(arrayBuffer, mergedPdf, filetype) {
    try {
        const base64String = Buffer.from(arrayBuffer).toString('base64');
        const img = await loadImage(`data:${filetype};base64,${base64String}`);

        // Calculate scale to fit image within page dimensions
        const pageWidth = 612;  // Width of the page
        const pageHeight = 792; // Height of the page
        const imgWidth = img.width;
        const imgHeight = img.height;

        const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

        // Calculate scaled dimensions
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Create new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Embed image into PDF document
        const pngImage = await pdfDoc.embedJpg(arrayBuffer);
        page.drawImage(pngImage, {
            x: (pageWidth - scaledWidth) / 2, // Center the image horizontally
            y: (pageHeight - scaledHeight) / 2, // Center the image vertically
            width: scaledWidth,
            height: scaledHeight,
        });

        // Copy pages to merged PDF
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
        });

    } catch (error) {
        console.error("An error occurred during the conversion process:", error);
    }
}

module.exports = BEInvoices;