
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const invoiceMapping=({loadNumber,brokerage,invoiceDate,PO,amount})=>{
return { DTR_NAME:`${brokerage}`, INVOICE_NUMBER: `${loadNumber}`, INV_DATE: getFormattedDate(invoiceDate), PO: "123456", INVAMT: `$${amount}` }  
}

function getFormattedDate() {
    try{
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      const year = today.getFullYear().toString().slice(-2);
      return `${month}/${day}/${year}`;
    }
    catch(err){
      console.log("Error Encountered :",err.message)
    }
}

const TriumphCSVWriter = async(s_invoices = []) => {

  let overall_total = 0;
  const invoices = s_invoices.map(inv => {
    const totalAmount = inv.services.reduce((total, item) => {
      return total + parseFloat(item.amount);
    }, 0);
    console.log("###########TOTAL###############", totalAmount);
    overall_total += totalAmount;
    return invoiceMapping({ loadNumber: inv.loadNumber, brokerage: inv.brokerage, invoiceDate: inv.invoiceCreatedAt, amount: totalAmount });
  });

  const constantHeader = [
    { id: 'DTR_NAME', title: 'DTR_NAME' },
    { id: 'INVOICE_NUMBER', title: 'INVOICE#' },
    { id: 'INV_DATE', title: 'INV_DATE' },
    { id: 'PO', title: 'PO' },
    { id: 'INVAMT', title: 'INVAMT' },
  ];

  const filePath = `${s_invoices[0].loadNumber}.csv`;

  const csvWriter = createCsvWriter({
    path: filePath,
    header: constantHeader,
    append: false
  });

  return csvWriter.writeRecords(invoices)
    .then(() => {
      console.log('CSV file has been generated successfully.');

      const additionalValues = `\n\n1,INVOICES - THIS SCHEDULE:,,, $${overall_total}\n\n`;

      const constantText = `
For valuable consideration, receipt of which is hereby acknowledged, the undersigned hereby SELLS, assigns, sets over and transfers to Advance Business Capital LLC d/b/a Triumph Business Capital ("TRIUMPH"), its successors or assigns, all its rights, title and interest in and to the following described accounts receivable ("Accounts") arising out of goods sold and/or services rendered by the undersigned.

Company Name
Authorization Signature
Date of Assignment
`;

      // Add vertical spacing before the constant text and include the additional values
      const contentToAppend = additionalValues + constantText;

      return new Promise((resolve, reject) => {
        fs.appendFile(filePath, contentToAppend, (err) => {
          if (err) {
            console.error("Error appending the additional values and constant text to the CSV file:", err);
            reject(err);
          } else {
            console.log('Additional values and constant text have been appended to the CSV file successfully.');
            resolve(filePath);
          }
        });
      });
    })
    .catch((err) => {
      console.error("Error writing the CSV file:", err);
      throw err;
    });
};

module.exports=TriumphCSVWriter