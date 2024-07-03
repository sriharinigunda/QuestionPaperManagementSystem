// NavigationBar.js
import React from 'react';
import './NavigationBar.css';

const NavigationBar = ({ setCurrentPage }) => {
    const handleNavigation = (page) => {
        setCurrentPage(page); // Set the current page based on the clicked button
    };

    return (
        <div className="navbar">
            <button className='navbu' onClick={() => handleNavigation('home')}>
                <i className="fas fa-home"></i> Home
            </button>
            <button className='navbu' onClick={() => handleNavigation('favorites')}>
                <i className="fas fa-star"></i> Favorites
            </button>
            <button className='navbu' onClick={() => handleNavigation('signin')}>
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    );
};

export default NavigationBar;
