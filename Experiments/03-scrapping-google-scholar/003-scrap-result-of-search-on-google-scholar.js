const puppeteer = require('puppeteer');
const myLocalValue = 'birkan kolcu'; 

let scrape = async () => {
	const browser = await puppeteer.launch({headless : false, devtools: true});
	const page = await browser.newPage();
	await page.goto('http://scholar.google.com/', {waitUntil: 'networkidle2'});
	await page.waitFor('input[type= "text"]');
	await page.keyboard.type(myLocalValue);
	await page.click('button[type="submit"]');

	await page.waitForNavigation({waitUntil: 'networkidle0'});

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

scrape().then((value) => {
	console.log(value); // Success!
});

/* Result Page structure for "birkan kolcu"
	All results have data-rp="0" to data-rp="9" class. Div with that attribute is container for each result element.
		div with gs_ri class contains the following properties:
			1- Result element for a paper has following properties:
				h3 tag with class="gs_rt": Title
				div with class="gs_a": Authors
				div with class="gs_rs": Abstract
				div with class="gs_fl": Citedby count, related articles, etc.
					a tag: citedby link & count
						can identify by going over all 'a' tags in parent div and looking for "Cited By X" innerText
			2- Result element for a citation looks like following
				h3 tag with class="gs_rt": Title
				div with class="gs_a": Authors
				div with class="gs_fl": Citedby count, related articles, etc.
					No citedby

*/