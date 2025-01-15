import React from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Register from './Register';
import Profile from './Profile';
import Home from './Home';
import RouteProtection from './RouteProtection';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Groups from './Groups';

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence>
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />

                <Route path="/register" element={<Register />} />
                <Route
                    path="/home"
                    element={
                        <RouteProtection>
                            <Home />
                        </RouteProtection>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <RouteProtection>
                            <Profile />
                        </RouteProtection>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <RouteProtection>
                            <Dashboard />
                        </RouteProtection>
                    }
                />
                <Route
                    path="/group"
                    element={
                        <RouteProtection>
                            <Group />
                        </RouteProtection>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
}

export default AnimatedRoutes;
