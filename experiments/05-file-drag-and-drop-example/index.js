function handleFileSelect(evt) {
	console.log("DROP");
    evt.preventDefault();
    evt.stopPropagation();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
		console.log(escape(f.name));
    }
  }

  function handleDragOver(evt) {
	evt.preventDefault();
    evt.stopPropagation();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  function handleDragEnter(evt) {
	evt.preventDefault();
	console.log("DRAG ENTER");
  }

  function handleDragLeave(evt) {
	evt.preventDefault();
	console.log("DRAG LEAVE");
  }

var dropZone = document.getElementById('konva-div');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
dropZone.addEventListener('dragenter', handleDragEnter, false);
dropZone.addEventListener('dragleave', handleDragLeave, false);