import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const router = useNavigate();
  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h3>LYNO</h3>
        </div>

        <div className="navlist">
          <p onClick={()=>{
            router("Guest-User")
          }}>Join as a Guest</p>
          <div onClick={()=>{
            router("/auth")
          }} role="button">
            <p>Register</p>
          </div>
          <div onClick={()=>{
            router("/auth")
          }} role="button">
            <p>Login</p>
          </div>
        </div>
      </nav>
      <div className="landingMainContainer">
        <div>
          <h1> Communication,
            Anytime, Anywhere
          </h1>

          <p>
            A fast and secure platform for online meetings and collaborations
          </p>

          <div role="button">
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.svg" alt="" />
        </div>
      </div>
    </div>
    





  );
}
