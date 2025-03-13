import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import AppTheme from './shared-theme/AppTheme';

ReactDOM.render(
  <ThemeProvider theme={AppTheme}>
    <App />
  </ThemeProvider>,
  document.getElementById('root')
);