// client/src/App.js

import React, { useState, useEffect } from 'react';
import SignUpForm from './components/SignUpForm';
import SignInForm from './components/SignInForm';
import HomePage from './components/HomePage';
import NavigationBar from './components/NavigationBar';
import FavoritePage from './components/FavoritePage';


const App = () => {
    // State to track the current page
    const [currentPage, setCurrentPage] = useState('signup');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedPage = localStorage.getItem('currentPage');
        
        if (token) {
            // If a token exists, set the current page to the one stored in the local storage
            setCurrentPage(storedPage || 'home');
        } else {
            setCurrentPage('signup');
        }
    }, []);
    const handlePageChange = (page) => {
        setCurrentPage(page);
        localStorage.setItem('currentPage', page);
    };

    // Function to render the appropriate component based on the current page
    const renderPage = () => {
        switch (currentPage) {
            case 'signup':
                return <SignUpForm setCurrentPage={handlePageChange} />;
            case 'signin':
                return <SignInForm setCurrentPage={handlePageChange} />;
            case 'home':
                return <HomePage setCurrentPage={handlePageChange} />;
            case 'favorites':
                return <FavoritePage setCurrentPage={handlePageChange} />;
            default:
                return <SignUpForm setCurrentPage={handlePageChange} />;
        }
    };

    return (
        <div className="container">
            {/* Conditionally render the NavigationBar */}
            {currentPage !== 'signup' && currentPage !== 'signin' && <NavigationBar setCurrentPage={handlePageChange} />}

            {/* Render the current page */}
            {renderPage()}
        </div>
    );
};

export default App;
