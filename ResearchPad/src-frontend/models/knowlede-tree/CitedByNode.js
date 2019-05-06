function CitedByNode(ID, academicDataLibrary) {
  const isCitationNode = true;
  LeafNode.call(this, ID, academicDataLibrary, isCitationNode);

  CitedByNode.prototype = Object.create(LeafNode.prototype);
  Object.defineProperty(CitedByNode.prototype, "constructor", {
    value: CitedByNode,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  });
}
