Electron-Forge
	#Installing Example Project
		npm install -g @electron-forge/cli@beta
		electron-forge init my-new-app
		cd my-new-app
		electron-forge start
	#Installing new npm package
		npm install your-desired-npm-package --save
#Building vanilla electronjs
	sudo apt-get install wine -y 
	
	cd researchpad-project/electronJsExperiments/my-new-app
	mkdir out
	touch ./out/.gitkeep

	npm install electron-packager --save-dev
	npm install asar --save-dev

	nano package.json
		Change following:
			"scripts": {
			    "start": "electron-forge start",
			    "package": "electron-forge package",
			    "make": "electron-forge make",
			    "publish": "electron-forge publish",
			    "lint": "echo \"No linting configured\""
			  },
		To this:
			"scripts": {
			    "start": "electron main.js",
			    "build": "electron-packager . my-new-app",
			    "package": "asar pack my-new-app-linux-x64/resources/app out/app.asar"
			  },
	npm run-script build