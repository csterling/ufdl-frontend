import React, { Component } from 'react';
import ReactImageAnnotate from "react-image-annotate";
import '../style/annotate.css';

class Annotate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imageData: [],
            index: 0
        };
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
            return {
                imageData: state.imageData.concat(images),
                index: state.imageData.length + images.length - 1
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
                            onExit={output => console.log(JSON.stringify(output.images))}
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
