function cleanGoogleResultList(googleResultList){
    var thingsToRemove = ["[HTML]","[BOOK]","[PDF]"];
    googleResultList.forEach(function(resultObj){
        thingsToRemove.forEach(function(keyword){
            const lowerCaseKeyword = keyword.toLowerCase();
            var result = resultObj.title.replace(keyword,'');
            result = result.replace(lowerCaseKeyword,'');
            resultObj.title = result;
        });
    });
}

module.exports = {
	cleanGoogleResultList: cleanGoogleResultList
}