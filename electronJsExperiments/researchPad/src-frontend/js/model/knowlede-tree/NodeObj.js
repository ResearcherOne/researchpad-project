function Node(ID, academicData, radius){ //Abstract Class
	this.ID = ID;
	this.academicDataLibrary = academicData;
	this.radius = radius;

	this.visualObject;
	
	this.isHidden = false;

	this.getVisualObject = function() {
		return this.visualObject;
	}

	this.getID = function() {
		return this.ID;
	}

	this.getAbsolutePosition = function() {
		return {x: visualizerModule.getNodeCenterById(this.ID).x, y:visualizerModule.getNodeCenterById(this.ID).y};
	}

	this.getPositionOnCamera = function() {
		var cameraPos = visualizerModule.getCanvasPos();
		var nodePos = visualizerModule.getNodeCenterById(this.ID);
		var nodeOnCameraPos = {x: cameraPos.x+nodePos.x, y: cameraPos.y+nodePos.y};
		return nodeOnCameraPos;
	}

	this.destroy = function() {
		visualizerModule.removeVisualObject(this.visualObject);
	}

	this.setPosition = function(x, y) {
		visualizerModule.setPosition(this.visualObject, x,y);
	}

	this.move = function(x, y) {
		visualizerModule.moveObject(this.visualObject, x, y);
	}

	this.show = function() {
		this.isHidden = false;
		this.visualObject.to({opacity: 1});
		if(this.visualObject.connection) this.visualObject.connection.to({opacity: 1});
	}

	this.hide = function() {
		this.isHidden = true;
		this.visualObject.to({opacity: 0});
		if(this.visualObject.connection) this.visualObject.connection.to({opacity: 0});
	}

	this.isHiddenNode = function() {
		return this.isHidden;
	}

	this.changeStrokeColor = function(color) {
        visualizerModule.setStrokeColor(this.visualObject, color);
	}

	this.addAcademicData = function(key, value) {
		this.academicDataLibrary[key] = value;
	}
	this.getAcademicDataLibrary = function() {
		return this.academicDataLibrary;
	}
}