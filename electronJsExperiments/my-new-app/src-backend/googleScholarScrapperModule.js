const puppeteer = require('puppeteer');

var g_isHeadless;
var g_isDevtools;

var browser;

let searchGoogle = async (searchText, isHeadless, isDevtools) => {
  if(!browser) browser = await puppeteer.launch({headless : isHeadless, devtools: isDevtools, dumpio: true});
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
  //browser.close();
  page.close();
  return result;
};

function initializeModule(isHeadless, isDevtools) {
  g_isHeadless = isHeadless;
  g_isDevtools = isDevtools;
}

/*
  resultObjectList = [
    {
      title: "paper title",
      link: "url",
    }
  ]
*/
function searchGoogleScholar(searchText, callback) {
	searchGoogle(searchText, g_isHeadless, g_isDevtools).then((resultObjectList) => {
		callback(null, resultObjectList);
	}).catch(function(err) {
		callback(err, null);
	});
}

function getCitedbyOfArticle(){

}

module.exports = {
  initializeModule: initializeModule,
	searchGoogleScholar: searchGoogleScholar,
	getCitedbyOfArticle: getCitedbyOfArticle
}