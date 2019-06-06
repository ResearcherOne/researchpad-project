function cleanGoogleResultList(googleResultList){
    var bracket_regex = /\[(.*?)]/g ;

    googleResultList.forEach(function(resultObj){
            var result = resultObj.title.replace(bracket_regex,'');
            resultObj.title = result;
    });
}

module.exports = {
	cleanGoogleResultList: cleanGoogleResultList
}