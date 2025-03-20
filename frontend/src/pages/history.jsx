import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import { IconButton } from "@mui/material";
import "../App.css";
export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        // Handle error (e.g., show a Snackbar)
      }
    };
    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="historyContainer">
      <IconButton onClick={() => routeTo("/home")} className="homeButton">
        <HomeIcon />
      </IconButton>
      <h1 className="historyTitle">Meeting History</h1>
      <Box className="cardContainer">
        {meetings.length !== 0 ? (
          meetings.map((e, i) => (
            <Card key={i} variant="outlined" className="meetingCard">
              <CardContent>
                <Typography
                  sx={{ fontSize: 16 }}
                  color="text.primary"
                  gutterBottom
                >
                  Lyno Key: <strong>{e.meetingCode}</strong>
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Date: <strong>{formatDate(e.date)}</strong>
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="h6" color="text.secondary" align="center">
            No meeting history available.
          </Typography>
        )}
      </Box>
    </div>
  );
}
