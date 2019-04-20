function ArxivData(metadata){
	AcademicData.call(this, metadata);
	
	this.getTitle = function() {
		if(this.metadata == null) return null;
		return this.metadata.title;
	}

	this.getYear = function() {
		if(this.metadata == null) return null;
		const extractedYear = new Date(this.metadata.published).getFullYear();
		return extractedYear;
	}

	this.getAbstract = function() {
		if(this.metadata == null) return null;
		return this.metadata.summary;
	}

	this.getAuthorList = function() {
		if(this.metadata == null) return null;
		var authorList = [];
		this.metadata.authors.forEach(function(authorObj){
			if(authorObj.name) {
				authorList.push(authorObj.name);
			}
		});
		return authorList;
	}
	
	this.getArxivId = function() {
		const splittedArxivUrl = this.metadata.id.split("/");
		const arxivId = splittedArxivUrl[splittedArxivUrl.length-1];

		const vSplittedId = arxivId.split("v");
		const versionCleanizedId = vSplittedId[0];

		return versionCleanizedId;
	}
	/*
		this.getArxivUrl = function() {
			return this.metadata.id;
		}

	*/
    
    ArxivData.prototype = Object.create(AcademicData.prototype);
	Object.defineProperty(ArxivData.prototype, 'constructor', { 
	    value: ArxivData, 
	    enumerable: false, // so that it does not appear in 'for in' loop
	    writable: true
	});
}
/* Unused Metadata Parts
{
    "id": "http://arxiv.org/abs/1904.07623v1",
    "updated": "2019-04-16T12:33:56.000Z",
    "published": "2019-04-16T12:33:56.000Z",
    "title": "DeepRadioID: Real-Time Channel-Resilient Optimization of Deep Learning-based Radio Fingerprinting Algorithms",
    "summary": "Radio fingerprinting provides a reliable and energy-efficient IoT authentication strategy. By mapping inputs onto a very large feature space, deep learning algorithms can be trained to fingerprint large populations of devices operating under any wireless standard. One of the most crucial challenges in radio fingerprinting is to counteract the action of the wireless channel, which decreases fingerprinting accuracy significantly by disrupting hardware impairments. On the other hand, due to their sheer size, deep learning algorithms are hardly re-trainable in real-time. Another aspect that is yet to be investigated is whether an adversary can successfully impersonate another device fingerprint. To address these key issues, this paper proposes DeepRadioID, a system to optimize the accuracy of deep-learning-based radio fingerprinting algorithms without retraining the underlying deep learning model. We extensively evaluate DeepRadioID on a experimental testbed of 20 nominally-identical software-defined radios, as well as on two datasets made up by 500 ADS-B devices and by 500 WiFi devices provided by the DARPA RFMLS program. Experimental results show that DeepRadioID (i) increases fingerprinting accuracy by about 35%, 50% and 58% on the three scenarios considered; (ii) decreases an adversary's accuracy by about 54% when trying to imitate other device fingerprints by using their filters; (iii) achieves 27% improvement over the state of the art on a 100-device dataset.",
    "links": [
      {
        "href": "http://arxiv.org/abs/1904.07623v1"
      },
      {
        "href": "http://arxiv.org/pdf/1904.07623v1",
        "title": "pdf"
      }
    ],
    "authors": [
      {
        "name": "Francesco Restuccia"
      },
      {
        "name": "Salvatore D'Oro"
      },
      {
        "name": "Amani Al-Shawabka"
      },
      {
        "name": "Mauro Belgiovine"
      },
      {
        "name": "Luca Angioloni"
      },
      {
        "name": "Stratis Ioannidis"
      },
      {
        "name": "Kaushik Chowdhury"
      },
      {
        "name": "Tommaso Melodia"
      }
    ],
    "categories": [
      "cs.NI"
    ]
*/