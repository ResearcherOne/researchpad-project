const puppeteer = require('puppeteer');

var browser;

let openBrowser = async (isHeadless, isDevtools) => {
  browser = await puppeteer.launch({headless : isHeadless, devtools: isDevtools, dumpio: true});
}

let scrapGoogleScholarPageCodeToRunOnChromium = () => {
  var extractYearFromGoogleScholarAuthorAndYearDiv = function(text) {;
    var regex = /[0-9][0-9][0-9][0-9]/g;
    yearList = text.match(regex);
    if(!yearList) {
      return "";
    }
    if(yearList.length > 1) {
      return yearList[yearList.length-1];
    } else if (yearList.length == 1) {
      return yearList[0];
    } else {
      return "";
    }
  }

  var extractAuthorsFromGoogleScholarAuthorAndYearDiv = function(text) {
    const splittedText = text.split("-");
    if(splittedText.length > 2) {
      const authors = splittedText[0];
      var rawAuthorList = authors.split(",");
      var authorList = [];
      rawAuthorList.forEach(function(element){
        const filteredElement = element.replace(/[^\w\s]/gi, '').trim();
        if(filteredElement.length > 0) authorList.push(filteredElement);
      });
      return authorList;
    } else if (splittedText.length > 0) {
      return [splittedText[0]];
    }
    return [];
  }

  var extractJournalFromGoogleScholarAuthorAndYearDiv = function(text) {
    var splittedTextList = text.split("-");
    if(splittedTextList.length > 1)
      return splittedTextList[1];
    else if (splittedTextList.length > 0)
      return splittedTextList[0];
    else
      return "";
  }

  let data = [];
  let elements = document.querySelectorAll('[data-rp]');

  for ( var element of elements){
    let containerDiv = element.querySelectorAll('.gs_ri')[0];

    let headerTagForTitle = containerDiv.querySelectorAll('.gs_rt')[0];
    const title = headerTagForTitle.innerText;
    var paperLink = null;
    if(headerTagForTitle.childNodes[0].hasAttribute("href")) {
      paperLink = headerTagForTitle.childNodes[0].getAttribute("href");
    }

    var citedByCount = 0;
    var citedByLink = "";
    let extrasDiv = containerDiv.querySelectorAll('.gs_fl')[0];
    let aTags = extrasDiv.querySelectorAll('a');
    aTags.forEach(function(aTag){
      var hrefText = aTag.getAttribute("href");
      const isCitedByHref = (hrefText.search("/scholar\\?cites") !== -1);
      if(isCitedByHref) {
        var splittedInnerHtml = aTag.innerHTML.split(" ");
        citedByCount = parseInt(splittedInnerHtml[2]);
        citedByLink = hrefText;
      } else {
        //not cited by aTag.
      }
    });

    var year = "";
    var authors = [];
    var journal = "";

    const authorAndDivSearchResult = containerDiv.querySelectorAll('.gs_a');
    if(authorAndDivSearchResult.length > 0) {
      let authorAndYearDiv = containerDiv.querySelectorAll('.gs_a')[0];
      const authorAndYearText = authorAndYearDiv.innerText;

      year = extractYearFromGoogleScholarAuthorAndYearDiv(authorAndYearText);
      authors = extractAuthorsFromGoogleScholarAuthorAndYearDiv(authorAndYearText);
      journal = extractJournalFromGoogleScholarAuthorAndYearDiv(authorAndYearText);
    }

    var abstractText = "";
    const abstractDivSearchResult = containerDiv.querySelectorAll('.gs_rs');
    if(abstractDivSearchResult.length > 0) {
      let abstractDiv = containerDiv.querySelectorAll('.gs_rs')[0];
      abstractText = abstractDiv.innerText;    
    }
    const currentElementData = {
      title: title,
      link: paperLink,
      citedByCount: citedByCount,
      citedByLink: citedByLink,
      year: year,
      abstract: abstractText,
      authors: authors,
      journal: journal
    };

    //alert(JSON.stringify(currentElementData));
    data.push(currentElementData);
  }
  
  return data;
};

let searchGoogleAndScrapResults = async (searchText) => {
  const page = await browser.newPage();
  await page.goto('http://scholar.google.com/', {waitUntil: 'networkidle0'});
  await page.waitFor('input[type= "text"]');
  await page.keyboard.type(searchText);

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({waitUntil: 'networkidle0'}),
  ]);

  page.on("console", msg => {
    console.log(msg.text());
  });

  // Scrape
  const result = await page.evaluate(scrapGoogleScholarPageCodeToRunOnChromium);
  page.close();
  return result;
};


let scrapCitedByPage = async (citedByLink) => {

  const page = await browser.newPage();
  await page.goto(citedByLink, {waitUntil: 'networkidle0'});
  await page.waitFor('input[type= "text"]');

  page.on("console", msg => {
    console.log(msg.text());
  });


  // Scrape
  const result = await page.evaluate(scrapGoogleScholarPageCodeToRunOnChromium);
  page.close();
  return result;
};

function initializeModule(isHeadless, isDevtools, callback) {
  openBrowser(isHeadless, isDevtools).then(() => {
    callback(null, true);
  }).catch(function(err){
    callback(err, false);
  });
}

function searchGoogleScholar(searchText, callback) {
	searchGoogleAndScrapResults(searchText).then((resultObjectList) => {
		callback(null, resultObjectList);
	}).catch(function(err) {
		callback(err, null);
	});
}

function getCitedbyOfArticle(citedByLink, callback){
  scrapCitedByPage("http://scholar.google.com"+citedByLink).then( (resultObjectList) => {
    callback(null, resultObjectList);
  }).catch(function(err) {
    callback(err, null);
  });
}

module.exports = {
  initializeModule: initializeModule,
	searchGoogleScholar: searchGoogleScholar,
	getCitedbyOfArticle: getCitedbyOfArticle
}