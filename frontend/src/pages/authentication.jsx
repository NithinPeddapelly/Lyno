import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from "../contexts/authContext";
import Snackbar from "@mui/material/Snackbar";
import { red } from '@mui/material/colors';


function Copyright(props) {


  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://www.linkedin.com/in/nithinpeddapelly/">
        lyno
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Authentication() {
  
  const [name, setName] = React.useState();
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const[error, setError] = React.useState();
  const[message, setMessage] = React.useState();

  const [formState, setFormState] = React.useState(0);

  const[open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  let handleAuth = async () => {
    try{
      if(formState === 0){
        let result = await handleLogin(username, password);
      }
      if(formState === 1){
        let result = await handleRegister(name, username, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setUsername("");
        setPassword("");

      }
    }catch(err){
      let message = (err.response.data.message);
      setError(message);
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>

      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <div>
            <Button variant={formState === 0 ? "contained" : ""} onClick={() => setFormState(0)}>
              SIGN IN
            </Button>
            <Button variant={formState === 1 ? "contained" : ""} onClick={() => setFormState(1)}>
              SIGN UP
            </Button>
          </div>


          <Box component="form" noValidate sx={{ mt: 1 }}>
    
            {formState ==1 ? <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Full name"
              name="username"
              autoFocus
              onChange={(e)=>setName(e.target.value)}
            />:<></>} 
          
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="username"
              name="username"
              value={username}
              autoFocus
              onChange={(e)=>setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="password"
              valu
              type="password"
              onChange={(e)=>setPassword(e.target.value)}

              id="password"
              
            />
            

            <p style ={{color:"red"}}>{error}</p>
            
            <Button
              type="Button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleAuth}
            >
              {formState == 0 ? "LOGIN" : "REGISTER"} 
            </Button>
           
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>

              <Snackbar> open={open} autoHideDuration={1000} messages={message}  </Snackbar>

    </ThemeProvider>
  );
}