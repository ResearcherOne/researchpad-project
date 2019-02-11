const puppeteer = require('puppeteer');

var g_isHeadless;
var g_isDevtools;

let searchGoogle = async (searchText, isHeadless, isDevtools) => {
  const browser = await puppeteer.launch({headless : isHeadless, devtools: isDevtools});
  const page = await browser.newPage();
  await page.goto('http://scholar.google.com/', {waitUntil: 'networkidle0'});
  await page.waitFor('input[type= "text"]');
  await page.keyboard.type(searchText);
  //page.click('button[type="submit"]');
  //await page.waitForNavigation({waitUntil: 'networkidle0'});
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({waitUntil: 'networkidle0'}),
  ]);
  //page.waitFor(1000);

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
  g_isHeadless = isHeadless;
  g_isDevtools = isDevtools;
}

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