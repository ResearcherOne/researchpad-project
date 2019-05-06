const puppeteer = require('puppeteer');
const searchKey = 'Adenosine triphosphate'; 


let scrape = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('http://scholar.google.com/', {waitUntil: 'networkidle2'});
  await page.waitFor('input[type= "text"]');
  await page.keyboard.type(searchKey);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();



    let div_selector= "h3.gs_rt"; 
    let list_length    = await page.evaluate((sel) => {
            let elements = Array.from(document.querySelectorAll(sel));
            return elements.length;
    }, div_selector);   
    let articleURLs = [];

    for(let i=0; i< list_length; i++){
        var href = await page.evaluate((l, sel) => {
                    let elements= Array.from(document.querySelectorAll(sel));
                    let anchor  = elements[l].getElementsByTagName('a')[0];
                    if(anchor){
                        return anchor.href;
                    }else{
                        return '';
                    }
                }, i, div_selector);
        articleURLs.push(href);
    }


  const result = await page.evaluate(() => {
    //return stuff
    let data = [];
    let elements = document.getElementsByClassName('gs_ri');
   
    for ( var element of elements){  
        title = element.childNodes[0].innerText;
        authors = element.childNodes[1].innerText;
        abstract = element.childNodes[2].innerText; 
        numberOfCitations = element.childNodes[3].innerText; 
        data.push({title, authors, abstract, numberOfCitations});
    }
    return data;
    
  });
  browser.close();
  
  resultWithURLs = [];
 
  for(let i=0; i< list_length; i++){
      resultElement= result[i];
      url = articleURLs[i];
      resultWithURLs.push({resultElement,url});      
  }
 
  return resultWithURLs;
};

scrape().then((value) => {
    console.log(value); // Success!
});
