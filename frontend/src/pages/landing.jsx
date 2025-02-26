import React from "react";
import "../App.css";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landingPageContainer">
        <nav>
            <div className="navHeader">
                <h2>LYNO</h2>
            </div>

            <div className="navlist">
                <p>Join as a Guest</p>
                <p>Register</p>
                <div role="button">
                  <p>Login</p>
                </div>

            </div>
        </nav>
        <div className="landingMainContainer">
          <div>
            <h1><span style={{color:"orange"}}>Seamless</span> Communication, Anytime, Anywhere</h1>
          
            <p>A fast and secure platform for online meetings and collaborations</p>
            
            <div role='button'>
              <Link to={"/home"}>Get Started</Link>
            </div>
          </div>
          <div>
              <img src ="/mobile.png" alt="" />
          </div>
        </div>
    </div>
  );
}
