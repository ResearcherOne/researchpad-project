function NodeDetailsStaticOverlayer(baseDivId, nodeDetailsDivClassName){
    this.baseDivId = baseDivId; //knowledge-tree-div
    this.nodeDetailsDivClassName = nodeDetailsDivClassName;

    this.detailsDiv =  document.createElement("div");
    this.detailsDiv.setAttribute('class', this.nodeDetailsDivClassName); //USE CLASSES INSTEAD OF DOING THIS BULLSHIT.
    document.getElementById(this.baseDivId).appendChild(this.detailsDiv);

    var lastX = 0;
    var lastY = 0;
    
    var nodeDetails = {
        title: "No title",
        year: "1999",
        citationCount: "500"
    }

    this.setDetails = function(title, year, citationCount) {
        nodeDetails.title = title;
        nodeDetails.year = year;
        nodeDetails.citationCount = citationCount;
    }

    this.show = function(x, y) {
        lastX = x;
        lastY = y;

        var title = nodeDetails.title;
        var year = nodeDetails.year;
        var citationCount = nodeDetails.citationCount;

        this.detailsDiv.style.display = "block";

        var offsetHeight = this.detailsDiv.offsetHeight;

	    this.detailsDiv.style.left = x+"px"; //x.
	    this.detailsDiv.style.top = (y-offsetHeight)+"px"; //y
		this.detailsDiv.innerHTML = title+"<br><br>"+"Citation: "+citationCount+" Year: "+year;
    }
    
    this.hide = function() {
        this.detailsDiv.style.display = "none";
    }

    this.updatePosition = function(dx, dy) {
        const newX = dx+lastX;
        const newY = dy+lastY;
        
        this.detailsDiv.style.left = newX+"px"; //x.
        this.detailsDiv.style.top = newY+"px"; //y
        
        lastX = newX;
        lastY = newY;
    }
}