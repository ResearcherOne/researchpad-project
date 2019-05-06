
const puppeteer = require('puppeteer');
const myLocalValue = 'Adenosine triphosphate'; 

let scrape = async () => {
  const browser = await puppeteer.launch({headless : false});
  const page = await browser.newPage();
  await page.goto('http://scholar.google.com/', {waitUntil: 'networkidle2'});
  await page.waitFor('input[type= "text"]');
  await page.keyboard.type(myLocalValue);
  await page.click('button[type="submit"]');

};

scrape().then((value) => {
    console.log(value); // Success!
});
