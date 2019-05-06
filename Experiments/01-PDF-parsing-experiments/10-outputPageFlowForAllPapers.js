var hackyParser = require("./hackyPaperParserModule.js");
const jsonfile = require('jsonfile');

var pdfFolder = "./input/papers/";
var outputFolder = "./out/";
var pageNo = 1;


const testFolder = './input/papers/';
const fs = require('fs');

var fileList = [];
fs.readdirSync(testFolder).forEach(file => {
  fileList.push(file);
})

fileList.forEach(function(pdfName){
	var pdfPath = pdfFolder + pdfName;
	var outputPath = outputFolder + pdfName + ".json";
	
	hackyParser.getPdfFontFlowForSinglePage(pdfPath, pageNo, function(err, pageFontFlow){
		if(!err) {
			jsonfile.writeFile(outputPath, pageFontFlow, { spaces: 1 }, function (err) {
				if (err) console.error(err)
			});
		} else {
			console.log("OOPS");
		}
	});
});
