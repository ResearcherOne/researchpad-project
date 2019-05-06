const aFunction = async () => {
  return 'test'
}

const bFunction = async () => { //This is same as aFunction
  return Promise.resolve('test')
}

aFunction().then(function(result){
	console.log("Result A: "+result);
})

bFunction().then(function(result){
	console.log("Result B: "+result);
})