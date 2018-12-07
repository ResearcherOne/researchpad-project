const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = "./input/1806.09514.pdf";
let dataBuffer = fs.readFileSync(pdfPath);
 
pdf(dataBuffer).then(function(data) {
 
    // number of pages
    console.log("Number of pages: "+data.numpages);
    // number of rendered pages
    console.log("Number of rendered pages: "+data.numrender);
    // PDF info
    console.log("Data info: "+JSON.stringify(data.info));
    // PDF metadata
    console.log("Meta data: "+JSON.stringify(data.metadata)); 
    // PDF.js version
    // check https://mozilla.github.io/pdf.js/getting_started/
    console.log("Version: "+data.version);
    // PDF text
    console.log(data.text); 
    
    console.log("Object Keys: "+Object.keys(data));
});