const pdf2doi = require("pdf2doi");
const doi2bib = require('doi2bib');
 
pdf2doi.fromFile("./input/1806.09514.pdf").then((doi)=>{
  console.log(doi);
  if(doi.doi) doi2bib.getCitation(doi.doi).then(console.log);
})