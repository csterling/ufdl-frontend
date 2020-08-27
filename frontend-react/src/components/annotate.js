import React, { Component } from 'react';
import ReactImageAnnotate from "react-image-annotate";
import '../style/annotate.css';

// TODO: this needs to be cleaned up
class Annotate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: '',
            imagePreviewUrl: ''
        };
        this._handleImageChange = this._handleImageChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
      }

      _handleSubmit(e) {
          e.preventDefault();
          // TODO: do something with -> this.state.file
      }

      _handleImageChange(e) {
          e.preventDefault();

          let reader = new FileReader();
          let file = e.target.files[0];

          reader.onloadend = () => {
              this.setState({
                  file: file,
                  imagePreviewUrl: reader.result
              });
          };

          reader.readAsDataURL(file);
      }
    render() {
        let {imagePreviewUrl} = this.state;
        let $imagePreview = null;
        if (imagePreviewUrl) {
            $imagePreview = (<img src={imagePreviewUrl} />);
        }

        return (
            <div className="border">
                <form className="selectForm" onSubmit={this._handleSubmit}>
                    <input type="file" id="file" className="fileInputButton" onChange={this._handleImageChange} />
                    <label htmlFor="file" className="fileLabel">
                        Select Image
                    </label>
                </form>
                <div className="imageDisplay">

                    {/* Currently has hardcoded images, needs to take in uploaded images */}

                    {/* <ReactImageAnnotate
                        selectedImage="https://i.imgur.com/SY4z4Cx.jpg"
                        taskDescription="# Draw region around each Kiwifruit bunch"
                        images={[{ src: "https://i.imgur.com/SY4z4Cx.jpg", name: "Kiwifruit.png" }]}
                        regionClsList={["Kiwifruit", "Human Face"]}
                        enabledTools="create-polygon, create-box"
                    /> */}

                    {$imagePreview}
                </div>
            </div>
        );
    }
}

export default Annotate;
