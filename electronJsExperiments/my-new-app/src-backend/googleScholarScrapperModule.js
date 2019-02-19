const puppeteer = require('puppeteer');

var browser;

let openBrowser = async (isHeadless, isDevtools) => {
  browser = await puppeteer.launch({headless : isHeadless, devtools: isDevtools, dumpio: true});
}

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
  const result = await page.evaluate(() => {
    let data = [];
    let elements = document.querySelectorAll('[data-rp]');

    for ( var element of elements){
      let containerDiv = element.querySelectorAll('.gs_ri')[0];

      let headerTagForTitle = containerDiv.querySelectorAll('.gs_rt')[0];
      const title = headerTagForTitle.innerText;
      const paperLink = headerTagForTitle.childNodes[0].getAttribute("href");

      var citedByCount = 0;
      var citedByLink = "";
      let extrasDiv = containerDiv.querySelectorAll('.gs_fl')[0];
      let aTags = extrasDiv.querySelectorAll('a');
      aTags.forEach(function(aTag){
        var splittedInnerHtml = aTag.innerHTML.split(" ");
        if(splittedInnerHtml[0] == "Cited") {
          console.log("Found: "+aTag.innerHTML);
          citedByCount = parseInt(splittedInnerHtml[2]);
          citedByLink = aTag.getAttribute("href");
        } else {
          //not cited by aTag.
        }
      });

      data.push({
        title: title,
        link: paperLink,
        citedByCount: citedByCount,
        citedByLink: citedByLink
      });
    }

    return data;
  });
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
  const result = await page.evaluate(() => {
    let data = [];
    let elements = document.querySelectorAll('[data-rp]');

    for ( var element of elements){
      let containerDiv = element.querySelectorAll('.gs_ri')[0];

      let headerTagForTitle = containerDiv.querySelectorAll('.gs_rt')[0];
      const title = headerTagForTitle.innerText;
      const paperLink = headerTagForTitle.childNodes[0].getAttribute("href");

      var citedByCount = 0;
      var citedByLink = "";
      let extrasDiv = containerDiv.querySelectorAll('.gs_fl')[0];
      let aTags = extrasDiv.querySelectorAll('a');
      aTags.forEach(function(aTag){
        var splittedInnerHtml = aTag.innerHTML.split(" ");
        if(splittedInnerHtml[0] == "Cited") {
          console.log("Found: "+aTag.innerHTML);
          citedByCount = parseInt(splittedInnerHtml[2]);
          citedByLink = aTag.getAttribute("href");
        } else {
          //not cited by aTag.
        }
      });

      data.push({
        title: title,
        link: paperLink,
        citedByCount: citedByCount,
        citedByLink: citedByLink
      });
    }

    return data;
  });
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

/*
  resultObjectList = [
    {
      title: title,
      link: paperLink,
      citedByCount: citedByCount,
      citedByLink: citedByLink
    }
  ]
*/
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