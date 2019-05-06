const puppeteer = require('puppeteer');
const myLocalValue = 'birkan kolcu'; 

let scrape = async () => {
  const browser = await puppeteer.launch({headless : false});
  const page = await browser.newPage();
  await page.goto('http://scholar.google.com/', {waitUntil: 'networkidle2'});
  await page.waitFor('input[type= "text"]');
  await page.keyboard.type(myLocalValue);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({waitUntil: 'networkidle0'});
  console.log("LOADED");
  browser.close();
};

scrape().then((value) => {
    console.log(value); // Success!
});