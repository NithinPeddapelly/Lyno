import React, { useState, useEffect } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField, Typography, Container, Box } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import styles from "../styles/home.module.css";

function HomeComponent() {
    const [meetingCode, setMeetingCode] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        console.log("HomeComponent rendered");
    }, []);

    let handleJoinVideoCall = async () => {
        navigate(`/${meetingCode}`);
    }

    return(
        <Container maxWidth="sm" className={styles.container}>
            <Box className={styles.navBar}>
                <Typography variant="h4">LYNO</Typography>
                <Box className={styles.navActions}>
                    <Button className={styles.historyButton}>
                        <RestoreIcon />
                        <Typography variant="body2">History</Typography>
                    </Button>
                    <Button
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>
            <Box textAlign="center">
                <Typography variant="h5" gutterBottom>Start or join a meeting</Typography>
                <TextField
                    label="Enter meeting code"
                    variant="outlined"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    fullWidth
                    margin="normal"
                    className={styles.inputField}
                />
                <Button variant="contained" color="primary" onClick={handleJoinVideoCall} className={styles.joinButton}>
                    Join Meeting
                </Button>
            </Box>
        </Container>
    )
}

export default withAuth(HomeComponent);