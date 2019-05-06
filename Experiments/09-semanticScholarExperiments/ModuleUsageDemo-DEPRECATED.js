const semantic = require("./SemanticScholarModule")

citationsAndReferencesOfArxivPaper = semantic.getCitationsAndReferencesOfArxivPaper("1406.1078").then((value) => {console.log(value)})

//stringifiedCitAndRefOfArxivPaper = semantic.getStringifiedCitationsAndReferencesOfArxivPaper(1406.1078).then((value) => {console.log(value)})

//semWithAuthorID = semantic.getSemanticScholarDataWithAuthorID(1979489).then((value) => {console.log(value)})
//semWithPaperID = semantic.getSemanticScholarDataWithPaperID("146f6f6ed688c905fb6e346ad02332efd5464616").then((value) => {console.log(value)})


