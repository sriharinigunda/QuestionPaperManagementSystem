// client/src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import './HomePage.css';
import axios from 'axios';

import ModalImage from 'react-modal-image';
const HomePage = () => {
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedYear, setSelectedYear] = useState('ALL');
    const [selectedSubject, setSelectedSubject] = useState('ALL');
    const [selectedExamType, setSelectedExamType] = useState('ALL');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('ALL');
    const [questions, setQuestions] = useState([]);
    const [years, setYears] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [images, setImages] = useState([]);
    const [favoriteImages, setFavoriteImages] = useState([]);
    
    
    useEffect(() => {
        const storedDepartment = localStorage.getItem('selectedDepartment');
        const storedFavorites = localStorage.getItem('favoriteImages');
        if (storedDepartment) {
            setSelectedDepartment(storedDepartment);
            fetchQuestions(storedDepartment);
            fetchYears(storedDepartment);
        }
        if (storedFavorites) {
            setFavoriteImages(JSON.parse(storedFavorites));
        }
    }, []);
  
   
    const fetchQuestions = async (department) => {
        try {
            // Fetch questions for the selected department
            const response = await axios.get(`http://localhost:3000/questions/${department}`);
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };
    const fetchYears = async (department) => {
        try {
            // Fetch years for the selected department
            const response = await axios.get(`http://localhost:3000/years/${department}`);
            setYears(response.data);
        } catch (error) {
            console.error('Error fetching years:', error);
        }
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        // Fetch subjects based on selected year and department
        fetchSubjects(selectedDepartment, event.target.value);
    };
    const fetchSubjects = async (department, year) => {
          try {
        // If "ALL" is selected for the year, fetch all subjects for the department
        if (year === 'ALL') {
            const response = await axios.get(`http://localhost:3000/subjects/${department}`);
            setSubjects(response.data);
        } else {
            // Fetch subjects for the selected department and year
            const response = await axios.get(`http://localhost:3000/subjects/${department}/${year}`);
            setSubjects(response.data);
        }
    } catch (error) {
        console.error('Error fetching subjects:', error);
    }
    };
    const fetchExamTypes = async (department, year, subject) => {
        try {
            
            const response = await axios.get(`http://localhost:3000/examtypes/${department}/${year}/${subject}`);
            setExamTypes(response.data);
                    
        } catch (error) {
            console.error('Error fetching exam types:', error);
        }
    };
    
    const fetchAcademicYears = async () => {
        try {
            // Fetch academic years
            const response = await axios.get('http://localhost:3000/academicyears');
            setAcademicYears(response.data);
        } catch (error) {
            console.error('Error fetching academic years:', error);
        }
    };
    const handleSubjectChange = (event) => {
        setSelectedSubject(event.target.value);
        // Fetch exam types based on selected department, year, and subject
        fetchExamTypes(selectedDepartment, selectedYear, event.target.value);
    };
    
    const handleExamTypeChange = (event) => {
        setSelectedExamType(event.target.value);
        fetchAcademicYears();
    };
    
    const handleAcademicYearChange = (event) => {
        setSelectedAcademicYear(event.target.value);
    };


    const handleDepartmentClick = async (department) => {
        setSelectedDepartment(department);
        localStorage.setItem('selectedDepartment', department);
        fetchQuestions(department);
    };

    const handleReturnToHome = () => {
        setSelectedDepartment(null); // Reset selected department
        setQuestions([]); // Clear questions
        localStorage.removeItem('selectedDepartment');
    };
    const fetchImages = async (department,year,subject,examtype,academicyear) => {
        try {
            const response = await axios.get(`http://localhost:3000/images/${department}/${year}/${subject}/${examtype}/${academicyear}`);
            setImages(response.data);
            console.log(images)
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };
   
    const handleFilterButtonClick = () => {
        fetchImages(selectedDepartment, selectedYear, selectedSubject, selectedExamType, selectedAcademicYear);
    };
    const toggleFavorite = (imageId) => {
        if (favoriteImages.includes(imageId)) {
            setFavoriteImages(favoriteImages.filter(id => id !== imageId)); // Remove from favorites
            removeFavorite(imageId); // Call backend to remove from favorites
        } else {
            setFavoriteImages([...favoriteImages, imageId]); // Add to favorites
            addFavorite(imageId); // Call backend to add to favorites
        }
    };
    
    const addFavorite = async (imageId) => { // Pass image blob to the function
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error('User ID not found in localStorage');
                return;
            }
            
            const response = await axios.post('http://localhost:3000/favorites/add', {
                userId: userId,
                imageId: imageId,
            });
            console.log(response.data); // Handle success/failure
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };
    
    const removeFavorite = async (imageId) => {
        try {
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
        {selectedDepartment ? (
            <div>
                <button className="return-button" onClick={handleReturnToHome}>Return to Home</button>
                <h2>{selectedDepartment} Questions</h2>
                <div className="filter-container">
                    {/* Year selection */}
                    <div className="filter-group">
                        <h3>Select Year</h3>
                        <select value={selectedYear} onChange={handleYearChange}>
                            <option value="ALL">ALL</option>
                            {years.map((year, index) => (
                                <option key={index} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    {/* Subject selection */}
                    <div className="filter-group">
                        <h3>Select Subject</h3>
                        <select value={selectedSubject} onChange={handleSubjectChange}>
                            <option value="ALL">ALL</option>
                            {subjects.map((sub, index) => (
                                <option key={index} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    {/* Exam type selection */}
                    <div className="filter-group">
                        <h3>Select Exam Type</h3>
                        <select value={selectedExamType} onChange={handleExamTypeChange}>
                            <option value="ALL">ALL</option>
                            {examTypes.map((examtype, index) => (
                                <option key={index} value={examtype}>{examtype}</option>
                            ))}
                        </select>
                    </div>
                    {/* Academic year selection */}
                    <div className="filter-group">
                        <h3>Select Academic Year</h3>
                        <select value={selectedAcademicYear} onChange={handleAcademicYearChange}>
                            <option value="ALL">ALL</option>
                            {academicYears.map((academicYear, index) => (
                                <option key={index} value={academicYear}>{academicYear}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="filter-button-container">
            <button className="filter-button" onClick={handleFilterButtonClick}>Filter Images</button>
        </div>
        {/* Display fetched images */}
        <div className="images-container">
        {images.map((image, index) => (
            <div className="image-wrapper" key={index}>
            <ModalImage
                            small={`data:image/png;base64,${image.image}`}
                            large={`data:image/png;base64,${image.image}`}
                            alt={image.name} 
                            hideDownload={false}
                            fileName={`${image.name}.png`}
            />
            <div className="icon-container">
                
            <i
                                className={`icon fas fa-heart ${favoriteImages.includes(image.id) ? 'favorite' : ''}`}
                                onClick={() => toggleFavorite(image.id)}
                            ></i>
            </div>
            </div>
        ))}
        
        </div>

            </div>
            ) : (
            <div className="content">
                <div className="branch-buttons">
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('CSE')}><span>CSE</span></button>
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('ECE')}><span>ECE</span></button>
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('EEE')}><span>EEE</span></button>
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('MECH')}><span>MECH</span></button>
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('CIVIL')}><span>CIVIL</span></button>
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('CHEM')}><span>CHEM</span></button>
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('MME')}><span>MME</span></button>
                    <button className="custom-btn btn-1" onClick={() => handleDepartmentClick('BIO')}><span>BIO</span></button>
                </div>
            </div>
            )}
        </div>
    );
};


export default HomePage;

