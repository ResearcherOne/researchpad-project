function ReferenceNode(ID, academicDataLibrary) {
  const isCitationNode = false;
  LeafNode.call(this, ID, academicDataLibrary, isCitationNode);

  ReferenceNode.prototype = Object.create(LeafNode.prototype);
  Object.defineProperty(ReferenceNode.prototype, "constructor", {
    value: ReferenceNode,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
  });
}
