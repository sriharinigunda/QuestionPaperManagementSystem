import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ModalImage from 'react-modal-image';

const FavoritePage = () => {
    const [favoriteImages, setFavoriteImages] = useState([]);

    useEffect(() => {
        fetchFavoriteImages();// Set currentPage in localStorage
    }, []);

    const fetchFavoriteImages = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }
            const response = await axios.get(`http://localhost:3000/favorites/${userId}`);
            console.log(response);
            setFavoriteImages(response.data);
        } catch (error) {
            console.error('Error fetching favorite images:', error);
        }
    }; 
    const handleToggleFavorite = async (imageId) => {
        try {
            // Remove the image from the favorite list immediately
            setFavoriteImages(favoriteImages.filter(image => image.id !== imageId));
            
            // Remove the image from the favorites in the backend
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }
            const response = await axios.post('http://localhost:3000/favorites/remove', {
                userId: userId,
                imageId: imageId
            });
            console.log(response.data); // Handle success/failure
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };
    
   
    

    return (
        <div>
            <h2>Favorite Images</h2>
            <div className="images-container">
                {favoriteImages.map((image, index) => (
                    <div className="image-wrapper" key={index}>
                        <ModalImage
                            small={`data:image/png;base64,${image.image}`}
                            large={`data:image/png;base64,${image.image}`}
                            alt={image.name} 
                            hideDownload={false}
                        />
                        <div className="icon-container">
                            <i
                                className="icon fas fa-heart favorite"
                                onClick={() => handleToggleFavorite(image.id)}
                            ></i>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FavoritePage;
