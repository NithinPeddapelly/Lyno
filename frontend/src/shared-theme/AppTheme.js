import { createTheme } from "@mui/material/styles";

const AppTheme = createTheme({
  palette: {
    mode: "light", // or "dark"
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

export default AppTheme;
