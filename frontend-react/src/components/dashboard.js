import React, { Component } from 'react';
import '../style/dashboard.css';
import {
    getTeamsForUser,
    getProjectsForTeam,
    getDatasetsForProject,
    setDatasetInUse,
    getLicences,
    createDataset
} from 'ufdl-js-client';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTeam: undefined,
            selectedProject: undefined,
            selectedDataset: undefined,

            availableTeams: [],
            availableProjects: [],
            availableDatasets: [],
            availableLicences: [],
            availableUsernames: [],

            projDisabled: true,
            dataDisabled: true,
            startDisabled: true,
            saveDisabled: true,

            createSelected:false,
        };

        /* TODO: a check should be performed to ensure a user has
         * already logged-in and hasn't accidentally navigated to this
         * page */

        /* Get the teams for the already logged-in user */
        getTeamsForUser().then(result => {if (result.valid) {
            this.setState({
                availableTeams: result.teams
            });
        } else {
            // TODO: consider showing a message to the user in these cases
            console.error("Failed to get the teams");
            this.setState({
                availableTeams: []
            });
        }}).catch(result => (console.error(result)));

        /* Get the licences to show when creating a dataset */
        getLicences().then(result => {if (result.valid) {
            this.setState({
                availableLicences: result.licences
            });
        } else {
            console.error("Failed to get the licences");
            this.setState({
                availableLicences: []
            });
        }}).catch(result => (console.error(result)));
    }

    /* When a team has been selected, then store the team object, get
     * the corresponding projects and allow the user to select a
     * project */
    teamSelectHandler = (event) =>{
        let team  = JSON.parse(document.getElementById("teamSelect").value);
        this.setState({
            selectedTeam: team,
            projDisabled: false
        });
        getProjectsForTeam(team).then(result => {if (result.valid) {
            this.setState({
                availableProjects: result.projects
            });
        } else {
            console.error("Failed to get the projects");
            this.setState({
                availableProjects: [],
                selectedProject: undefined,
                availableDatasets: [],
                selectedDataset: undefined,
                startDisabled: true
            });
        }}).catch(result => (console.error(result)));
    }

    /* When a project has been selected, then store the project
     * object, get the corresponding datasets and allow the user to
     * select a dataset */
    projSelectHandler = (event) =>{
        let project = JSON.parse(document.getElementById("projSelect").value);
        this.setState({
            dataDisabled: false,
            selectedProject: project
        });
        getDatasetsForProject(project).then(result => {if (result.valid) {
            this.setState({
                availableDatasets: result.datasets
            });
        } else {
            console.error("Failed to get the datasets");
            this.setState({
                availableDatasets: [],
                selectedDataset: undefined,
                startDisabled: true
            });
        }}).catch(result => (console.error(result)));
    }

    /* Store the selected dataset in preparation to be annotated */
    dataSelectHandler = (event) => {
        let dataset = JSON.parse(document.getElementById("dataSelect").value);
        this.setState({
            selectedDataset: dataset,
            startDisabled: false
        });
    }

    /* The create dataset button has been clicked, show the create
     * dataset view */
    handleCreateClick = (event) => {
        this.setState({
            createSelected:true,
        });
    }

    /* The cancel button has been selected on the create dataset view,
     * return to the main view */
    handleCancelClick = (event) => {
        this.setState({
            createSelected: false,
        });
    }

    /* The save datset button has been clicked, and a new dataset
     * needs to be created on the backend using the given inputs*/
    handleSaveClick = (event) => {
        /* Get all of the input objects and values */
        var datasetName = document.getElementById("name").value;
        var licence = JSON.parse(document.getElementById("licenseSelect").value);
        var project = this.state.selectedProject;
        var description = document.getElementById("description").value;
        var tags = document.getElementById("tags").value;

        /* Create the dataset, update the available datasets in the
         * inputs, and return to the main view ready to start
         * annotating */
        createDataset(datasetName, licence, project, description, tags)
            .then(response => {
                if (response.valid) {
                    this.setState((state) => {
                        var newDataset = response.dataset;
                        return {
                            availableDatasets: (state.availableDatasets
                                                    .concat(newDataset)),
                            createSelected: false,
                            startDisabled: false,
                            selectedDataset: newDataset,
                        };
                    });
                    console.log(response.dataset);
                }
                else {
                    console.error(response);
                }
            })
            .catch(error => (console.error(error.json())));
    }

    /* Check that there is valid input for creating a dataset before
     * enabling the save button*/
    handleDatasetInput = (event) => {
        var datasetName = document.getElementById("name").value;
        var licence = {};
        try {
            licence = JSON.parse(document.getElementById("licenseSelect").value);
        }
        catch (e) {
            return;
        }
        this.setState({
            saveDisabled: !(datasetName && licence)
        });
    }

    /* Start annotating on teh annotation page with the selected
     * dataset after the start button has been clicked */
    handleStartClick = (event) => {
        setDatasetInUse(this.state.selectedDataset);

        this.props.history.push({
            pathname:"/annotate",
        });
    }

    /* Show the options for teams, projects and datasets, or allow the
     * user to create a new dataset in a different view */
    render() {
        const createSelected = this.state.createSelected;

        return (
            <div>
                <div id="dashForm">
                {!createSelected ? (
                    <div id="mainInputs">
                        <p className='formTitle'>Select Dataset to Annotate</p>
                        <p className="step">Step 1: Select Team</p>
                        <select id="teamSelect" className='mainSelect' onChange={this.teamSelectHandler} value={JSON.stringify(this.state.selectedTeam) || "select"}>
                            <option disabled value ="select" >-- Select Team --</option>
                        {this.state.availableTeams.map((team) => {
                            return <option value={JSON.stringify(team)}>{team.name}</option>
                        })}
                        </select>

                        <p className="step">Step 2: Select Project</p>
                        <select id="projSelect" className='mainSelect' disabled={this.state.projDisabled} onChange={this.projSelectHandler} value={JSON.stringify(this.state.selectedProject) || "select"}>
                            <option disabled value="select">-- Select Project --</option>
                            {this.state.availableProjects.map((project) => {
                                return <option value={JSON.stringify(project)}>{project.name}</option>
                            })}
                        </select>

                        <div id='dataContainer'>
                            <p className="step">Step 3: Select Dataset</p>
                            <select id="dataSelect" className="dataset" disabled={this.state.dataDisabled} onChange={this.dataSelectHandler} value={JSON.stringify(this.state.selectedDataset) || "select"}>
                                <option disabled value="select">-- Select Dataset --</option>
                                    {this.state.availableDatasets.map((dataset) => {
                                        return <option value={JSON.stringify(dataset)}>{dataset.name}</option>
                                    })}
                            </select>
                             <p id='or' className="dataset">or</p>
                            <button id="createButton" disabled={this.state.dataDisabled} className="dataset" onClick={this.handleCreateClick}>Create New Dataset</button>
                        </div>
                    </div>
                ):
                (
                    <div id="createDataset">
                        <div id='createHead'>
                            <p className='formTitle'>Create New Dataset</p>
                            <button id="cancelButton" onClick={this.handleCancelClick}>Cancel</button>
                        </div>

                        <div className='createStep'>
                            <label id='namelbl' htmlFor='name'>Name: </label>
                            <input id='name' type='text' onChange={this.handleDatasetInput}/>

                            <div id='licenseContainer'>
                                <label htmlFor='license' >License Type: </label>
                        <select id='licenseSelect' className="datasetInputs" defaultValue="select" onChange={this.handleDatasetInput}>
                                <option disabled value="select">-- Select License --</option>
                                    {this.state.availableLicences.map((license) => {
                                        return <option value={JSON.stringify(license)}>{license.name}</option>
                                    })}
                                </select>
                            </div>

                        <div id="cProjContainer">
                        <label htmlFor="projSelect">Selected Project: </label>
                        <select id="projSelect" className="datasetInputs" onChange={this.projSelectHandler} value={JSON.stringify(this.state.selectedProject) || "select"}>
                        <option disabled value="select">-- Select Project --</option>
                        {this.state.availableProjects.map((project) => {
                            return <option value={JSON.stringify(project)}>{project.name}</option>
                        })}
                        </select>
                        </div>

                        <hr></hr>
                        </div>

                        <div id='optionalContainer'>
                            <div id="descContainer" className="createStep">
                                <p className="textAreaCont">
                                    <label id="permissionLabel" className="cSteplabel" htmlFor="description">Description <i>(optional)</i>: </label>
                                    <textarea id="description" type="text" maxLength="100" placeholder="Max 100 chars"/>
                                </p>
                            </div>

                            <div className='createStep'>
                                <p className ='textAreaCont'>
                                    <label htmlFor='tags' className='cSteplabel'>Tags <i>(optional)</i>: </label>
                                    <textarea id='tags' type='text' placeholder='fruit, leaf'/>
                                </p>
                            </div>

                            <button id="saveButton" disabled={this.state.saveDisabled} onClick={this.handleSaveClick}>Save</button>
                        </div>
                    </div>
                )
                }

                </div>
                <button id="startButton" disabled={this.state.startDisabled} hidden={this.state.createSelected} onClick={this.handleStartClick}>Start Annotating</button>
            </div>
        );

    }

}

export default Dashboard;
