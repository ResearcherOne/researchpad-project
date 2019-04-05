const rp = require('request-promise');
const puppeteer = require('puppeteer')

function createUrlWithSemanticPaper(id){
    return "http://api.semanticscholar.org/v1/paper/"+id
        +"?include_unknown_references=true";
}

function createUrlWithDOI(doi){
    return "http://api.semanticscholar.org/v1/paper/"+doi
        +"?include_unknown_references=true";
}


function createUrlWithArxiv(id){
    return "http://api.semanticscholar.org/v1/paper/"+id
        +"?include_unknown_references=true";
}


function createUrlWithSemanticAuthor(id){
    return "http://api.semanticscholar.org/v1/paper/"+id
        +"?include_unknown_references=true";
}


function createOptions(url){
    return {
        method: 'POST',
        uri: url,
        json: true
    }
}

let scrape = async (url) => {
    const browser = await puppeteer.launch({headless : false, devtools: true});
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2'});

    await page.waitForNavigation({waitUntil: 'networkidle0'});

    // Scrape
    const result = await page.evaluate(() => {
        let data = [];
        let elements = document.querySelectorAll(document.querySelectorAll(".treeTable > tbody:nth-child(2)"));
        for (let element of elements){
            arxivIdDiv = element.getElementById("/arxivId").children[1].assignedSlot                  ;
            authorsDiv = element.getElementById("/authors");
            citationVelocityDiv = element.getElementById("/citationVelocity").innerText;
            citationsDiv = element.getElementById("/citations");
            influentialCitationCountDiv = element.getElementById("/influentialCitationCount").innerText;
            paperID = element.getElementById("/paperId").innerText;
            referencesDiv = element.getElementById("/references");
            title = element.getElementById("/title").children[1].innerText;
            topicsDiv = element.getElementById("/topics");
            urlDiv = element.getElementById("/url");
            venueDiv = element.getElementById("/venue");
            year = element.getElementById("/year");

            data.push({
                title: title,
            });
        }

        return data;
    });
    browser.close();
    return result;
};

