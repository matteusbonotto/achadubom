import React from 'react';
import './App.css';
import Home from './Pages/HomePage/HomePage';
import AudioPlayer from './Components/AudioPlayer/AudioPlayer';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const App = () => {
  return (
    <>
      <AudioPlayer />
      <Home />
    </>
  );
};

export default App;