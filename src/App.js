import React from 'react';
import './App.css';
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Navbar from './components/Navbar/Navbar';
import TwoPointPage from './components/EmptyPage/TwoPointPage';
import ThreePointPage from './components/EmptyPage/ThreePointPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Switch>
          <Route exact path="/"
            render={() => <TwoPointPage />} />
          <Route path="/line-app"
            render={() => <TwoPointPage />} />
          <Route path="/twoPointPage"
            render={() => <TwoPointPage />} />
          <Route path="/threePointPage"
            render={() => <ThreePointPage />} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
