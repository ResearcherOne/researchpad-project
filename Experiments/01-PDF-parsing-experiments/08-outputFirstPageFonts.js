/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

//
// Basic node example that prints document metadata and text content.
// Requires single file built version of PDF.js -- please run
// `gulp singlefile` before running the example.
//

// Run `gulp dist-install` to generate 'pdfjs-dist' npm package files.
var pdfjsLib = require('pdfjs-dist');
const jsonfile = require('jsonfile')

// Loading file from file system into typed array
var paperName = "1811.11913.pdf"
var pdfPath = "./input/papers/"+paperName;
var outputPath = "./out/"+paperName+".json";

// Will be using promises to load document, pages and misc data instead of
// callback
var printPageNo = 1;

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

var fontNames;

var loadingTask = pdfjsLib.getDocument(pdfPath);
loadingTask.promise.then(function(doc) {
  var numPages = doc.numPages;
  console.log('# Document Loaded');
  console.log('Number of Pages: ' + numPages);
  console.log();

  var lastPromise; // will be used to chain promises
  lastPromise = doc.getMetadata().then(function (data) {
    return;
  });

  var loadPage = function (pageNum) {
    return doc.getPage(pageNum).then(function (page) {
    	if(pageNum!==printPageNo) return;
      console.log('# Page ' + pageNum);
      var viewport = page.getViewport(1.0 /* scale */);
      console.log('Size: ' + viewport.width + 'x' + viewport.height);
      console.log();
      return page.getTextContent().then(function (content) {
        // Content contains lots of information about the text layout and
        // styles, but we need only strings at the moment
        fontNames = groupTextByConsecutiveFontNames(content.items);
        //var strings = content.items.map(function (item) {
        //  return item.str;
        //});
        //console.log('## Text Content');
        //console.log(strings.join(' '));
      }).then(function () {
        console.log();
      });
    })
  };
  // Loading of the first page will wait on metadata and subsequent loadings
  // will wait on the previous pages.
  for (var i = 1; i <= numPages; i++) {
    lastPromise = lastPromise.then(loadPage.bind(null, i));
  }
  return lastPromise;
}).then(function () {
  console.log('# End of Document');
  //console.log(JSON.stringify(fontNames));
  jsonfile.writeFile(outputPath, fontNames, { spaces: 1 }, function (err) {
	  if (err) console.error(err)
	})

}, function (err) {
  console.error('Error: ' + err);
});