import React, { Component } from 'react';
import Logo from '../resources/logo.png';
import '../style/landingpage.css';

class LandingPage extends Component {
    handleClick = () => {this.props.history.push("/dashboard");}
    render(){
        return(
            <div id="content">
                <div id="image">
                    <img id="logo" src={Logo} alt="Logo"></img>
                </div>
                <div id="rightContent">
                    <h1 id="mainTitle">UFDL <br /> Dataset Annotator</h1>
                    <div id="loginForm">
                        <form id="registerform">
                            <input className="formtext" id="formuser" type="text" name="user" placeholder="Username"></input>
                            <input className="formtext" id="formpass" type="password" name="password" placeholder="Password"></input>
                            <input className="formtext" id="formtext" type="text" name="port" placeholder="Port"></input>
                            <input className="formtext" id="formip" type="text" name="ipaddress" placeholder="IP Address"></input>
                        </form>
                        <button id="button" onClick={this.handleClick}> Login </button>
                    </div>
                    <hr />
                    <p id="projectTitle">User Friendly Deep Learning</p>
                </div>
            </div>
        );
    }
}
export default LandingPage;
