var hackyParser = require("./hackyPaperParserModule.js");
const jsonfile = require('jsonfile');

var paperName = "1811.11913.pdf"
var pdfPath = "./input/papers/"+paperName;
var outputPath = "./out/"+paperName+".json";
var pageNo = 1;

hackyParser.getPdfFontFlowForSinglePage(pdfPath, pageNo, function(err, pageFontFlow){
	if(!err) {
		jsonfile.writeFile(outputPath, pageFontFlow, { spaces: 1 }, function (err) {
			if (err) console.error(err)
		});
	} else {
		console.log("OOPS");
	}
});