const puppeteer = require('puppeteer');

var isHeadless;
var isDevtools;

let searchGoogle = async (searchText, isHeadless, isDevtools) => {
  const browser = await puppeteer.launch({headless : false, devtools: false});
  const page = await browser.newPage();
  await page.goto('http://scholar.google.com/', {waitUntil: 'networkidle2'});
  await page.waitFor('input[type= "text"]');
  await page.keyboard.type(searchText);
  await page.click('button[type="submit"]');

  //await page.waitForNavigation({waitUntil: 'networkidle0'});
  page.waitFor(10000);

  // Scrape
  const result = await page.evaluate(() => {
    let data = [];
    let elements = document.querySelectorAll('[data-rp]');

    for ( var element of elements){
      let containerDiv = element.querySelectorAll('.gs_ri')[0];

      let headerTagForTitle = containerDiv.querySelectorAll('.gs_rt')[0];
      const title = headerTagForTitle.innerText;
      const paperLink = headerTagForTitle.childNodes[0].getAttribute("href");

      data.push({
        title: title,
        link: paperLink
      });
    }

    return data;
  });
  browser.close();
  return result;
};

function initializeModule(isHeadless, isDevtools) {
  isHeadless = isHeadless;
  isDevtools = isDevtools;
}

function searchGoogleScholar(searchText, callback) {
	searchGoogle(searchText, isHeadless, isDevtools).then((resultObjectList) => {
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