const testFolder = './input/papers/';
const fs = require('fs');

var fileList = [];
fs.readdirSync(testFolder).forEach(file => {
  fileList.push(file);
})

console.log(fileList);