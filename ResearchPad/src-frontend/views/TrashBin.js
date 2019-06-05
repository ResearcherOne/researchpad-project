"use strict";

function TrashBin(tagId) {
  this.tagId = tagId;
  this.trashBin = document.getElementById(tagId);
  
  var mouseInTrashZone = null;

  /**
   * Add mouse enter and mouse leave Events
   */
  this.trashBin.addEventListener("mouseleave", function(event) {
    mouseInTrashZone = false;
    this.children[0].style.opacity = "0.5";
  });
  this.trashBin.addEventListener("mouseenter", function(event) {
    mouseInTrashZone = true;
    this.children[0].style.opacity = "0.75";
  });

  /**
   * Check if mouse is in trash area
   */
  this.isMouseInTrashZone = function() {
    return mouseInTrashZone;
  }
}