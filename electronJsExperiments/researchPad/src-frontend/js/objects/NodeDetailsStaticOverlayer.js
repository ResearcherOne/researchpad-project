function NodeDetailsStaticOverlayer(baseDivId, nodeDetailsDivClassName, extraUpperDivClassName){
    this.baseDivId = baseDivId; //knowledge-tree-div
    this.nodeDetailsDivClassName = nodeDetailsDivClassName;
    this.extraUpperDivClassName = extraUpperDivClassName;

    this.essentialDiv =  document.createElement("div");
    this.essentialDiv.setAttribute('class', this.nodeDetailsDivClassName);

    this.essentialContentDiv =  document.createElement("div");
    this.essentialDiv.appendChild(this.essentialContentDiv);

    this.extraUpperDiv =  document.createElement("div");
    console.log("CLASSNAME: "+this.extraUpperDivClassName);
    this.extraUpperDiv.setAttribute('class', this.extraUpperDivClassName);

    document.getElementById(this.baseDivId).appendChild(this.essentialDiv);
    document.getElementById(this.baseDivId).appendChild(this.extraUpperDiv);

    var lastX = 0;
    var lastY = 0;
    
    var nodeDetails = {
        title: "No title",
        year: "1999",
        citationCount: "500"
    }

    this.setContent = function(title, year, citationCount) {
        nodeDetails.title = title;
        nodeDetails.year = year;
        nodeDetails.citationCount = citationCount;
    }

    this.showEssential = function(x, y) {
        var title = nodeDetails.title;
        var year = nodeDetails.year;
        var citationCount = nodeDetails.citationCount;

        this.essentialDiv.style.display = "flex";
        var offsetHeight = this.essentialDiv.offsetHeight;

	    this.essentialDiv.style.left = x+"px"; //x.
        this.essentialDiv.style.top = (y-offsetHeight)+"px"; //y
        this.essentialContentDiv.innerHTML = "<p>"+title+"</p>"+""+"<p>Citation: "+citationCount+" Year: "+year+"</p>";

        lastX = x;
        lastY = y-offsetHeight;
    }

    this.showExtraContent = function() {
        console.log("SHOW EXTRA CONTENT")
        const essentialX = lastX;
        const essentialY = lastY;

        const essentialDivGap = 5;
        this.extraUpperDiv.style.display = "flex";
        var offsetHeightUpperDiv = this.extraUpperDiv.offsetHeight;
        const upperDivX = essentialX;
        const upperDivY = essentialY - offsetHeightUpperDiv - essentialDivGap;

        this.extraUpperDiv.style.left = upperDivX+"px"; //x.
        this.extraUpperDiv.style.top = upperDivY+"px"; //y
        this.extraUpperDiv.innerHTML = "<p> YO YO YO </p>"
    }

    this.hideExtraContent = function() {
        this.extraUpperDiv.style.display = "none";
    }
    
    this.hideEssential = function() {
        this.essentialDiv.style.display = "none";
    }

    this.isExtraContentBeingDisplayed = function() {
        return (this.extraUpperDiv.style.display == "flex")
    }

    this.updatePosition = function(dx, dy) {
        const newX = dx+lastX;
        const newY = dy+lastY;
        
        this.essentialDiv.style.left = newX+"px"; //x.
        this.essentialDiv.style.top = newY+"px"; //y
        
        lastX = newX;
        lastY = newY;
    }
}