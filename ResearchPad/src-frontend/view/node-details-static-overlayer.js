function NodeDetailsStaticOverlayer(
  baseDivId,
  nodeDetailsDivClassName,
  extraUpperDivClassName,
  nodeExtraLowerClassName
) {
  const nodeDivDarkenerClassName = "node-div-darkener";
  const nodeDivAvailableBackgroundColor = "rgba(255,255,255,0.05)";
  const nodeDivNotAvailableBackgroundColor = "rgba(0,0,0,0)";

  this.baseDivId = baseDivId; //knowledge-tree-div
  this.nodeDetailsDivClassName = nodeDetailsDivClassName;
  this.extraUpperDivClassName = extraUpperDivClassName;
  this.extraLowerDivClassName = nodeExtraLowerClassName;

  this.essentialDiv = document.createElement("div");
  this.essentialDiv.setAttribute("class", this.nodeDetailsDivClassName);

  this.essentialContentDiv = document.createElement("div");
  this.essentialDiv.appendChild(this.essentialContentDiv);

  this.extraUpperDiv = document.createElement("div");
  this.extraUpperDiv.setAttribute("class", this.extraUpperDivClassName);
  this.extraUpperDiv.classList.add(nodeDivDarkenerClassName);

  this.extraUpperDivViewDiv = document.createElement("div");
  this.extraUpperDivViewDivP = document.createElement("p");
  this.extraUpperDivViewDivP.innerHTML = "View";
  this.extraUpperDivViewDiv.appendChild(this.extraUpperDivViewDivP);
  this.extraUpperDiv.appendChild(this.extraUpperDivViewDiv);

  this.extraUpperDivPdfDiv = document.createElement("div");
  this.extraUpperDivPdfDivP = document.createElement("p");
  this.extraUpperDivPdfDivP.innerHTML = "PDF";
  this.extraUpperDivPdfDiv.appendChild(this.extraUpperDivPdfDivP);
  this.extraUpperDiv.appendChild(this.extraUpperDivPdfDiv);

  this.extraLowerDiv = document.createElement("div");
  this.extraLowerDiv.setAttribute("class", this.extraLowerDivClassName);
  this.extraLowerDiv.classList.add(nodeDivDarkenerClassName);

  document.getElementById(this.baseDivId).appendChild(this.essentialDiv);
  document.getElementById(this.baseDivId).appendChild(this.extraUpperDiv);
  document.getElementById(this.baseDivId).appendChild(this.extraLowerDiv);

  var lastX = 0;
  var lastY = 0;

  var lastUpperDivX = 0;
  var lastUpperDivY = 0;

  var lastLowerDivX = 0;
  var lastLowerDivY = 0;

  var nodeDetails = {};

  var viewDivClickedCallback = null;

  this.extraUpperDivViewDiv.addEventListener("click", function() {
    if (viewDivClickedCallback && nodeDetails.link)
      viewDivClickedCallback(nodeDetails.link);
  });

  this.setContent = function(
    title,
    year,
    citationCount,
    abstract,
    journal,
    authors,
    link
  ) {
    nodeDetails.title = title;
    nodeDetails.year = year;
    nodeDetails.citationCount = citationCount;
    nodeDetails.abstract = abstract;
    nodeDetails.journal = journal;
    nodeDetails.authors = authors;
    nodeDetails.link = link;
    nodeDetails.isPdfAvailable = false;
  };

  this.showEssential = function(x, y) {
    var title = nodeDetails.title;
    var year = nodeDetails.year;
    var citationCount = nodeDetails.citationCount;

    this.essentialDiv.style.display = "flex";
    var offsetHeight = this.essentialDiv.offsetHeight;

    this.essentialDiv.style.left = x + "px"; //x.
    this.essentialDiv.style.top = y - offsetHeight + "px"; //y
    this.essentialContentDiv.innerHTML =
      "<p>" +
      title +
      "</p>" +
      "" +
      "<p>Citation: " +
      citationCount +
      " Year: " +
      year +
      "</p>";

    lastX = x;
    lastY = y - offsetHeight;
  };

  this.showExtraContent = function(isUpperContentShown) {
    const essentialX = lastX;
    const essentialY = lastY;

    if (isUpperContentShown) this.extraUpperDiv.style.display = "flex";

    const essentialDivGap = 5;
    var offsetHeightUpperDiv = this.extraUpperDiv.offsetHeight;
    const upperDivX = essentialX;
    const upperDivY = essentialY - offsetHeightUpperDiv - essentialDivGap;

    this.extraUpperDiv.style.left = upperDivX + "px"; //x.
    this.extraUpperDiv.style.top = upperDivY + "px"; //y

    if (nodeDetails.link) {
      this.extraUpperDivViewDiv.style.backgroundColor = nodeDivAvailableBackgroundColor;
    } else {
      this.extraUpperDivViewDiv.style.backgroundColor = nodeDivNotAvailableBackgroundColor;
    }

    if (nodeDetails.isPdfAvailable) {
      this.extraUpperDivPdfDiv.style.backgroundColor = nodeDivAvailableBackgroundColor;
    } else {
      this.extraUpperDivPdfDiv.style.backgroundColor = nodeDivNotAvailableBackgroundColor;
    }

    lastUpperDivX = upperDivX;
    lastUpperDivY = upperDivY;

    this.extraLowerDiv.style.display = "flex";
    var offsetHeightEssentialDiv = this.essentialDiv.offsetHeight;
    const lowerDivX = essentialX;
    const lowerDivY = essentialY + offsetHeightEssentialDiv + essentialDivGap;

    this.extraLowerDiv.style.left = lowerDivX + "px"; //x.
    this.extraLowerDiv.style.top = lowerDivY + "px"; //y
    this.extraLowerDiv.innerHTML =
      "<div><p><b>Abstract</b><br>" +
      nodeDetails.abstract +
      "</p></div>" +
      "<div><p><b>Journal</b><br>" +
      nodeDetails.journal +
      "</p></div>" +
      "<div><p><b>Authors</b><br>" +
      nodeDetails.authors +
      "</p></div>";

    lastLowerDivX = lowerDivX;
    lastLowerDivY = lowerDivY;

    this.essentialDiv.classList.add(nodeDivDarkenerClassName);
  };

  this.hideExtraContent = function() {
    this.extraUpperDiv.style.display = "none";
    this.extraLowerDiv.style.display = "none";

    this.essentialDiv.classList.remove(nodeDivDarkenerClassName);
  };

  this.hideEssential = function() {
    this.essentialDiv.style.display = "none";
  };

  this.isExtraContentBeingDisplayed = function() {
    return (
      this.extraUpperDiv.style.display == "flex" ||
      this.extraLowerDiv.style.display == "flex"
    );
  };

  this.updatePosition = function(dx, dy) {
    const newX = dx + lastX;
    const newY = dy + lastY;

    this.essentialDiv.style.left = newX + "px"; //x.
    this.essentialDiv.style.top = newY + "px"; //y

    lastX = newX;
    lastY = newY;

    const newUpperDivX = dx + lastUpperDivX;
    const newUpperDivY = dy + lastUpperDivY;

    this.extraUpperDiv.style.left = newUpperDivX + "px"; //x.
    this.extraUpperDiv.style.top = newUpperDivY + "px"; //y

    lastUpperDivX = newUpperDivX;
    lastUpperDivY = newUpperDivY;

    const newLowerDivX = dx + lastLowerDivX;
    const newLowerDivY = dy + lastLowerDivY;

    this.extraLowerDiv.style.left = newLowerDivX + "px"; //x.
    this.extraLowerDiv.style.top = newLowerDivY + "px"; //y

    lastLowerDivX = newLowerDivX;
    lastLowerDivY = newLowerDivY;
  };

  this.setViewButtonPressedCallback = function(callback) {
    viewDivClickedCallback = callback;
  };

  this.setPdfButtonPressedCallback = function(callback) {};
}
