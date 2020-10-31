import React, { Component } from 'react';
import Logo from '../resources/logo.png';
import '../style/landingpage.css';
import { checkLoginDetails } from 'ufdl-js-client';

class LandingPage extends Component {
    /* Check the user's credentials and server details when the login
     * button is pressed */
    handleClick = (event) => {
        event.preventDefault();
        let elements = event.target.elements;
        checkLoginDetails(elements.formip.value,
                          elements.formport.value,
                          elements.formuser.value,
                          elements.formpass.value)
            .then(details => {if (details.valid) {
                this.props.history.push({
                    pathname: '/dashboard'
                });
            }});
    }

    /* Show the login page with input options */
    render(){
        return(
            <div id="content">
                <div id="image">
                    <img id="logo" src={Logo} alt="Logo"></img>
                </div>
                <div id="rightContent">
                    <h1 id="mainTitle">UFDL <br /> Dataset Annotator</h1>
                    <div id="loginForm">
                        <form id="registerform" onSubmit={this.handleClick}>
                            <input className="formtext" id="formuser" type="text" name="user" placeholder="Username"></input>
                            <input className="formtext" id="formpass" type="password" name="password" placeholder="Password"></input>
                            <input className="formtext" id="formip" type="text" name="ipaddress" placeholder="Server Address"></input>
                            <input className="formtext" id="formport" type="text" name="port" placeholder="Port"></input>
                            <button id="button" type="submit"> Login </button>
                        </form>
                    </div>
                    <hr />
                    <p id="projectTitle">User Friendly Deep Learning</p>
                </div>
            </div>
        );
    }
}
export default LandingPage;
