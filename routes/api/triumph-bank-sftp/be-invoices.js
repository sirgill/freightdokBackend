const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const Load = require('../../../models/Load');
const { createCanvas, loadImage } = require('canvas');
const Invoice_v2 = require('../../../models/Invoice_v2');


const BEInvoices = async (req, res) => {
    const { body: { loadIds } = {}, user: { orgName } = {} } = req;
    console.log("LoadIds for which invoices needs to be generated : ", loadIds)
    try {
        const invoices_in_creation = await Promise.all(loadIds.map(loadId => {
            return createInvoicePDF({ loadId, orgName })
        }))
        console.log(invoices_in_creation)
        res.send({ success: true,data:invoices_in_creation,message: "Invoices Created Sucessfully !" })
    }
    catch (err) {
        console.log("Error Message :", err.message)
    }
}


const createInvoicePDF = async ({ loadId, orgName }) => {

    try {
        const loadData = await Load.findOne({ loadNumber: loadId });
        const { services = [], notes = '' } = await Invoice_v2.findOne({ loadNumber: loadId })
            .sort({ createdAt: -1 })
            .limit(1);


        if (services.length && loadData.bucketFiles) {
            mergePDFs(loadData.bucketFiles, loadData, orgName, services, notes)
            return {loadId,invoiceCreated:true,message:'Invoice generated successfully for loadId: ' + loadId};
        } else {
            return {loadId,invoiceCreated:false,message:'Invoice not generated for loadId: ' + loadId};
        }
    } catch (e) {
        console.log(e.message);
        return {loadId,invoiceCreated:false,message:'Invoice not generated for loadId: ' + loadId};
    }
}


const addTopPortionOfThePDF = async (mergedPdf, loadData, { orgName, services, notes }) => {
    const customPdf = await PDFDocument.create();
    const page = customPdf.addPage([612, 792]),
        { brokerage = '--' } = loadData || {};

    const helveticaFont = await customPdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await customPdf.embedFont(StandardFonts.HelveticaBold);

    // Draw header
    page.drawText(orgName, {
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

    page.drawText(brokerage, {
        x: 100,
        y: 700, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Load Number: ${loadData.loadNumber}`, {
        x: 450,
        y: 700, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });


    // Draw a line to separate the header from the table
    page.drawLine({
        start: { x: 50, y: 680 },
        end: { x: 550, y: 680 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    // Define table layout
    const startX = 50;
    const startY = 660;
    const rowHeight = 25;
    const columnWidths = [100, 150, 100, 100, 100];
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

    const totalAmount = services.reduce((sum, row) => sum + Number(row.amount), 0);

    page.drawRectangle({
        x: startX,
        y: startY,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText('Services', { x: startX + 5, y: startY + 5, font: boldFont, size: 12, });
    page.drawText('Description', { x: startX + columnWidths[0] + 5, y: startY + 5, font: boldFont, size: 12, });
    page.drawText('Quantity', { x: startX + columnWidths[0] + columnWidths[1] + 5, y: startY + 5, font: boldFont, size: 12, });
    page.drawText('Price', { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y: startY + 5, font: boldFont, size: 12, });
    page.drawText('Amount', { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, y: startY + 5, font: boldFont, size: 12, });

    // Draw rows
    services.forEach((row, index) => {
        const y = startY - (index + 1) * rowHeight;
        page.drawText(row.serviceName, { x: startX + 5, y: y + 5, font: helveticaFont, size: 12, });
        page.drawText(row.description, { x: startX + columnWidths[0] + 5, y: y + 5, font: helveticaFont, size: 12, });
        page.drawText(row.quantity.toString(), { x: startX + columnWidths[0] + columnWidths[1] + 5, y: y + 5, font: helveticaFont, size: 12, });
        page.drawText(row.price.toString(), { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y: y + 5, font: helveticaFont, size: 12, });
        page.drawText(`$${Number(row.amount).toFixed(2)}`, { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, y: y + 5, font: helveticaFont, size: 12, });
    });

    page.drawLine({
        start: { x: 50, y: startY - (services.length + 1) * rowHeight + 5 },
        end: { x: 600, y: startY - (services.length + 1) * rowHeight + 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    page.drawText(`Notes: ${notes}`, { x: startX, y: startY - (services.length + 1) * rowHeight - 10, font: boldFont, size: 12, });

    // Draw total
    page.drawText(`Total: $${totalAmount.toFixed(2)}`, { x: startX + tableWidth - 100, y: startY - (services.length + 1) * rowHeight - 10, font: boldFont, size: 12, });


    // Merge the custom PDF page first
    const [customPage] = await mergedPdf.copyPages(customPdf, [0]);
    mergedPdf.addPage(customPage);
}

async function mergePDFs(files, loadData, orgName, services, notes) {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    addTopPortionOfThePDF(mergedPdf, loadData, { orgName, services, notes })

    // Iterate over each file
    for (const file of files) {
        if (file.fileType === 'proofDelivery') {
            // Handle proofDelivery as an image or any type
            const response = await fetch(file.fileLocation);
            const arrayBuffer = await response.arrayBuffer();
            // Check if it's an image (you can add other type checks here)
            if (response.headers.get('content-type').startsWith('image')) {
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
    fs.writeFile(`${loadData.loadNumber}.pdf`, mergedPdfBytes, (err, res) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('File Saved Successfully');
        }
    });
}

function createServicesTable({ serviceName, quantity, price, description, amount }) {
    page.drawText(serviceName, {
        x: 50,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(description, {
        x: 200,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(quantity, {
        x: 200,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(price, {
        x: 300,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });

    page.drawText(amount, {
        x: 400,
        y: 650, // Adjusted to start closer to the top
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });
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