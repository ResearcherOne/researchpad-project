function GoogleScholarData(metadata) {
	AcademicData.call(this, metadata);

	this.getTitle = function() {
		if (this.metadata == null) return null;
		return this.metadata.title;
	};

	GoogleScholarData.prototype = Object.create(AcademicData.prototype);
	Object.defineProperty(GoogleScholarData.prototype, "constructor", {
		value: GoogleScholarData,
		enumerable: false, // so that it does not appear in 'for in' loop
		writable: true
	});
}
