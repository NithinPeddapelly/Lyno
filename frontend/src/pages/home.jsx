import React from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton } from "@mui/material";
import RestoreIcon from "@mui/icons-material"

function HomeComponent() {
    const[meetingCode,setMeetingCode] = useState("");
    let handleJoinVideoCall = async () => {
        navigate("/${}")
    }

    return(
        <>
        <div className="navBar">
            <div style={{display:"flex",justifyContent:"space-between"}}>
                <h3>LYNO</h3>
            </div>
            <div>
                <div style={{display:"flex",alignItem:"center"}}></div>
                <IconButton>
                    <RestoreIcon/>
                    <p>History</p>
                </IconButton>
                <Button>
                    onClick={()=>{
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}
                </Button>
            </div>
        </div>
        </>
        
    )
}

export default withAuth (HomeComponent)