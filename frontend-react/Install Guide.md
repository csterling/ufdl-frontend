# Install Guide

## Initial Setup

Ensure the latest version of Node and npm are installed [here.](https://nodejs.org/en/)

## Installing Required Components

1. Get all of the required components from git:

	```
	git clone https://github.com/michaeliwaikato/ufdl-frontend.git
	git clone https://github.com/michaeliwaikato/ufdl-js-client.git
	git clone https://github.com/michaeliwaikato/ufdl-image-annotator.git
	```
2. Move into the annotator directory and build it:

	```
	cd ufdl-image-annotator/react-image-annotate
	npm install
	npm run-script build
	```
3. Setup the frontend and install the required modules:

	```
	cd ../..
	cd ufdl-frontend/frontend-react
	npm install
	```
4. Ensure React is only installed once between the frontend and the annotator (may require elevated permissions):

	```
	cd node_modules/react && npm link
	cd ../react-dom && npm link
	cd ../../../../ufdl-image-annotator/react-image-annotate/dist && npm link react && npm link react-dom
	```

## Run The Web Server

Ensure you are in the ufdl-frontend/frontend-react directory and run:

```
npm start
```
