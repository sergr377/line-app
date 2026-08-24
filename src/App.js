import React from 'react';
import './App.css';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import TwoPointPage from './components/CurvePage/TwoPointPage';
import ThreePointPage from './components/CurvePage/ThreePointPage';

//HashRouter, а не BrowserRouter: приложение живёт на GitHub Pages,
//где нет серверных rewrite-правил и прямой заход на /twoPointPage отдаёт 404
function App() {
  return (
    <div className="App">
      <HashRouter>
        <Navbar />
        <Switch>
          <Route path="/twoPointPage" component={TwoPointPage} />
          <Route path="/threePointPage" component={ThreePointPage} />
          <Redirect to="/twoPointPage" />
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;
