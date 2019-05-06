/*
  Purpose of Academic Data Objects is this:
  - Capture all the underlying data of the API so that, when we need to use new data, we won't have to go that API again.
  - Make those data available to upper layer that composes different Academic Data Objects to create a composed set of data.
*/
function AcademicData(metadata) {
  this.metadata = metadata;

  this.getFullMetadata = function() {
    return this.metadata;
  };
}
