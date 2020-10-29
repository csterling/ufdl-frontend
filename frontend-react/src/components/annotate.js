import React, { Component } from 'react';
import ReactImageAnnotate from "react-image-annotate";
import '../style/annotate.css';
import {
    getFilesFromUsedDataset,
    uploadLabelledImages
} from 'ufdl-js-client';

class Annotate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imageData: [],
            index: 0
        };

        getFilesFromUsedDataset().then(result => {if (result.valid) {
            var colours = {};
            for (var fileIndex = 0;
                 (fileIndex < result.filenames.length);
                 fileIndex++) {
                let file = result.files[fileIndex];
                let filename = result.filenames[fileIndex];
                let annotations = result.annotations[fileIndex];
                let url = URL.createObjectURL(file);
                let oldRegions = [];
                for (var labelIndex = 0;
                     (labelIndex < annotations.length);
                     labelIndex++) {
                    if (annotations[labelIndex] === undefined) {
                        continue;
                    }
                    var label = annotations[labelIndex].label;
                    if (!(label in colours)) {
                        var colour = Math.floor(Math.random()
                                                * 0xFFFFFF).toString(16);
                        colour = "#" + ("000000" + colour).slice(-6);
                        colours[label] = colour;
                    }
                }
                const image = new Image();
                image.src = url;
                image.onload = () => {
                    for (var j = 0; j < annotations.length; j++) {
                        var annotation = annotations[j];
                        if (annotation === undefined) {
                            continue;
                        }
                        var region = {};
                        if (annotation.polygon) {
                            var points = annotation.polygon.points;
                            for (var k = 0; k < points.length; k++) {
                                var point = points[k];
                                points[k] = [point[0] / image.width,
                                             point[1] / image.height];
                            }
                            region = {cls: annotation.label,
                                      color: colours[annotation.label],
                                      type: "polygon",
                                      points: points};
                        }
                        else {
                            region = {cls: annotation.label,
                                      color: colours[annotation.label],
                                      type: "box",
                                      x: annotation.x / image.width,
                                      y: annotation.y / image.height,
                                      w: annotation.width / image.width,
                                      h: annotation.height / image.height};
                        }
                        oldRegions.push(region);
                    }
                    this.setState((state) => {
                        return {
                            imageData: state.imageData.concat([{
                                src: url,
                                name: filename,
                                regions: oldRegions}])
                        };
                    });
                };
            }
        }});
    }

    // Handles upload from local disk
    fileSelectedHandler = (event) => {
        var images = [];
        let files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            //Create object URL for each image
            var imgURL = URL.createObjectURL(files[i]);
            images.push({
                src: imgURL,
                name: files[i].name
            });
        }
        // Save uploaded images to state data
        this.setState((state) => {
            var newIndex = 0;
            if (state.imageData.length > 0) {
                newIndex = state.imageData.length + images.length - 1;
            }
            return {
                imageData: state.imageData.concat(images),
                index: newIndex
            };
        });
    }

    delete(annotateData) {
        let currIndex = annotateData.selectedImage;

        // If delete alert is confirmed
        if(window.confirm('Are you sure you want to delete this image?')){
            var result = [];
            result = result.concat(this.state.imageData);

            // Remove current image from data images and decrement index
            result.splice(annotateData.selectedImage,1);
            this.setState({
                imageData: result,
                index: (currIndex > 0) ? currIndex - 1 : 0
            });
        }
    }

    // Each time the annotator displays a new image, the new index is saved
    updateIndex(index){
        this.setState({
            index: index.selectedImage
        });
    }

    saveAnnotation(annotateData){
        this.setState({
            imageData: annotateData.images
        });
    }

    // Open file input dialog
    clickFileInput(){
        document.getElementById('file').click();
    }

    /* Method to convert the output data from the
     * react-image-annotator into data which the ufdl-backend can
     * read */
    async saveOutput(imageData) {
        var allAnnotations = [];
        var filenames = [];
        var images = [];

        for (const image of imageData) {
            var fileLink = image.src;
            await fetch(fileLink)
                .then(r => r.blob())
                .then(blob => (blob.arrayBuffer()))
                .then(buf => (images.push(buf)))
                .then(nothing => {
                    // Getting file names and adding to array
                    var fileName = image.name;
                    filenames.push(fileName);

                    var imagePixelWidth = image.pixelSize.w;
                    var imagePixelHeight = image.pixelSize.h;

                    if (image.regions) {
                        var annotations = [];
                        image.regions.forEach(region => {
                            var annotation = {x: 0, y: 0, width: 0, height: 0,
                                              polygon: undefined, label: ""};
                            if (region.type === "box") {
                                annotation.x = Math.round(
                                    region.x * imagePixelWidth);
                                annotation.y = Math.round(
                                    region.y * imagePixelHeight);
                                annotation.width = Math.round(
                                    region.w * imagePixelWidth);
                                annotation.height = Math.round(
                                    region.h * imagePixelHeight);
                                annotation.label = region.cls;
                            }
                            else if (region.type === "polygon") {
                                var minX = imagePixelWidth;
                                var minY = imagePixelHeight;
                                var maxX = 0;
                                var maxY = 0;
                                annotation.polygon = {points: []};

                                region.points.forEach(point => {
                                    point = [
                                        Math.round(point[0] * imagePixelWidth),
                                        Math.round(point[1] * imagePixelHeight)
                                    ];
                                    annotation.polygon.points.push(point);
                                    minX = (point[0] < minX) ? point[0] : minX;
                                    minY = (point[1] < minY) ? point[1] : minY;
                                    maxX = (point[0] > maxX) ? point[0] : maxX;
                                    maxY = (point[1] > maxY) ? point[1] : maxY;
                                });

                                annotation.x = Math.round(minX);
                                annotation.y = Math.round(minY);
                                annotation.width = Math.round(maxX - minX);
                                annotation.height = Math.round(maxY - minY);
                                annotation.label = region.cls;
                            }
                            annotations.push(annotation);
                        });
                        allAnnotations.push(annotations);
                    }
                    else {
                        annotations.push(undefined);
                    }
                });
        }
        uploadLabelledImages(filenames, images, allAnnotations);
    }

    render() {
        let {imageData, index} = this.state;

        // If annotator has images uploaded
        if(imageData.length > 0){
            return (
                <div id="border">
                    <input type="file" id="file" multiple={true} accept="image/*" onChange={this.fileSelectedHandler} />
                    <div id="imageDisplay">
                        <ReactImageAnnotate
                            images = {imageData}
                            key = {imageData}
                            updateIndex = {output => this.updateIndex(output.selectedImage)}
                            regionClsList={[]}
                            enabledTools="create-polygon, create-box"
                            deleteImage={output => this.delete(output)}
                            addImages={output => {
                                this.saveAnnotation(output);
                                this.clickFileInput();
                            }}
                            selectedImage = {index}
                            onExit={output => this.saveOutput(output.images)}
                        />
                    </div>
                </div>
            );
        }
        //If no images have been uploaded show "upload images" button
        else{
            return (
                <div id="border">
                    <div id="imageDisplay">
                        <form id="formUpload">
                            <input type="file" id="file" multiple={true} accept="image/*" onChange={this.fileSelectedHandler} />
                            <label htmlFor="file" id="fileLabel"> Upload Images </label>
                        </form>
                    </div>
                </div>
            );
        }
    }
}

export default Annotate;
