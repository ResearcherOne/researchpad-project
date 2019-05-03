function Node(ID, academicDataLibrary){ //Abstract Class
	this.ID = ID;
	this.academicDataLibrary = academicDataLibrary;

	this.isHidden = false;

	this.getID = function() {
		return this.ID;
	}

	this.getAbsolutePosition = function(visualObjID) {
		return {x: visualizerModule.getNodeCenterById(visualObjID).x, y:visualizerModule.getNodeCenterById(visualObjID).y};
	}

	this.getPositionOnCamera = function(visualObjID) {
		var cameraPos = visualizerModule.getCanvasPos();
		var nodePos = visualizerModule.getNodeCenterById(visualObjID);
		var nodeOnCameraPos = {x: cameraPos.x+nodePos.x, y: cameraPos.y+nodePos.y};
		return nodeOnCameraPos;
	}
	
	this.isHiddenNode = function() {
		return this.isHidden;
	}

	this.changeStrokeColor = function(visualObjID, color) {
        visualizerModule.setStrokeColor(visualObjID, color);
	}

	this.addAcademicData = function(key, value) {
		this.academicDataLibrary[key] = value;
	}
	this.getAcademicDataLibrary = function() {
		return this.academicDataLibrary;
	}
}