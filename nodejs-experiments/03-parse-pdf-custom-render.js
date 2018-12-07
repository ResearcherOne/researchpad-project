const fs = require('fs');
const pdf = require('pdf-parse');

//const pdfPath = "./input/1806.09514.pdf";
const pdfPath = "./input/1811.11913.pdf";

let dataBuffer = fs.readFileSync(pdfPath);

function collectFontNamesForWholePage(pageRows) {
    var fontNames = {};
    for (let row of pageRows) {
        if(!fontNames[row.fontName]) {
            fontNames[row.fontName] = [];
            fontNames[row.fontName].push(row.str);
        } else {
            fontNames[row.fontName].push(row.str);
        }
    }
    return fontNames;
}

function groupTextByConsecutiveFontNames(pageRows) {
    var fontNamesArray = [];
    var previousRowFont = "";

    for (let row of pageRows) {
        if(row.fontName !== previousRowFont) {
            var fontName = {
                name: row.fontName,
                rowTexts: [row.str]
            };
            fontNamesArray.push(fontName);
            previousRowFont = row.fontName;
        } else {
            var lastItemIndex = fontNamesArray.length-1;
            fontNamesArray[lastItemIndex].rowTexts.push(row.str);
        }
    }
    return fontNamesArray;
}

// default render callback
var render_page = function(pageData) {
    //check documents https://mozilla.github.io/pdf.js/
    let render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: false,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: false
    }
 
    return pageData.getTextContent(render_options)
    .then(function(textContent) {
        let lastY, text = '';
        console.log("textContent.items length: "+textContent.items.length);
        
        //var fontNames = collectFontNamesForWholePage(textContent.items);
        var fontNames = groupTextByConsecutiveFontNames(textContent.items);
        console.log("Object Keys: "+Object.keys(fontNames));
        console.log(JSON.stringify(fontNames));

        /*
        for (let item of textContent.items) {
            console.log("Text: "+item.str+" Font name: "+item.fontName);
            if (lastY == item.transform[5] || !lastY){
                text += item.str;
            }  
            else{
                text += '\n' + item.str;
            }    
            lastY = item.transform[5];
        }
        */
        return "text";
    });
}

let options = {
    pagerender: render_page
}
 
pdf(dataBuffer, options).then(function(data) {
 
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
});