// client/src/components/SignUpForm.js


import React, { useState } from 'react';
import './SignUpForm.css';
import axios from 'axios';



const SignUpForm = ({ setCurrentPage }) => { // Receive setCurrentPage as a prop
    const [formData, setFormData] = useState({
        name: '',
        rollNo: '',
        department: '',
        email: '',
        currentYear: '',
        password: ''
    });

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
         // Make a request to the backend to check if the roll number exists
         try {
            const rollNoExistsResponse = await axios.get(`http://localhost:3000/checkRollNo/${formData.rollNo}`);
            if (rollNoExistsResponse.data.exists) {
                alert('Account with this roll number already exists');
                return;
            }
        } catch (error) {
            console.error('Error checking roll number:', error);
            alert('An error occurred while checking the roll number');
            return;
        }
        if (!(formData.name && formData.rollNo && formData.department && formData.email && formData.currentYear && formData.password)) {
            alert('Please fill in all fields before signing up.');
            return; // Prevent further execution if form is incomplete
        }
    
        // RollNo should be a 6-digit number
        if (!/^\d{6}$/.test(formData.rollNo)) {
            alert('Roll number must be a 6-digit number');
            return;
        }
    
        // Check department
        const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'MME', 'BIO'];
        if (!departments.includes(formData.department)) {
            alert('Invalid department');
            return;
        }
    
        // Email should be in the form of rollno@student.nitandhra.ac.in
        const rollNoPrefix = formData.rollNo.substring(0, 6);
        const expectedEmailFormat = `${rollNoPrefix}@student.nitandhra.ac.in`;
        if (formData.email !== expectedEmailFormat) {
            alert('Invalid email format');
            return;
        }
    
        // Check currentYear
        const years = ['I', 'II', 'III', 'IV'];
        if (!years.includes(formData.currentYear)) {
            alert('Invalid current year');
            return;
        }
    
       
    
        // If the roll number does not exist, submit the form
        try {
            const response = await axios.post('http://localhost:3000/signup', formData);
            const { userId, token } = response.data;
    
            // Store user ID and token in local storage
            localStorage.setItem('userId', userId);
            localStorage.setItem('token', token);
    
            setCurrentPage('home');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while signing up');
        }
    };

    
   
    

    return (
        <div className='div1'>
        <h2>Don't let exams scare you! Sign up now and let's face those tricky questions together</h2>
        <form  className='form' onSubmit={handleSubmit} >
      <input name="name" type="text" placeholder="Your name" onChange={handleChange}/>

      <input name="rollNo" type="text" placeholder="Your rollNo" onChange={handleChange} />
      <select name="department" onChange={handleChange}>
                    <option value="">Select Department</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="CHEM">CHEM</option>
                    <option value="MME">MME</option>
                    <option value="BIO">BIO</option>
      </select>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} />
      <select name="currentYear" onChange={handleChange}>
                    <option value="">Select Current Year</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
      </select>
      <input name="password" type="text" placeholder="password" onChange={handleChange}  />
      <button type="submit">Sign up</button>
      <p className='p1'>Already have an account?<button className='button' onClick={() => setCurrentPage('signin')}>Sign In</button> </p>
      
    </form>
    </div>
        
  
    );
};

export default SignUpForm;

