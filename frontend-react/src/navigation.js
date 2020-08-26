import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import LandingPage from './components/landingpage';
import Dashboard from './components/dashboard';
import Annotate from './components/annotate';

const Navigation = () => (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/annotate" component={Annotate} />
        </Switch>
    </BrowserRouter>
);

export default Navigation;
