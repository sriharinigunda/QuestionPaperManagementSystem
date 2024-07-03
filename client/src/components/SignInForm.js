import React, { useState } from 'react';
import './SignInForm.css'; // Import CSS file
import axios from 'axios';


const SignInForm = ({ setCurrentPage }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault(); // Prevent default form submission behavior

        try {
            const response = await axios.post('http://localhost:3000/signin', formData);

            if (response.data.success) {
                console.log('Authentication successful:', response.data);
                localStorage.setItem('token', response.data.token);
                setCurrentPage('home');
                
            } else {
                throw new Error(response.data.error || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Error:', error.message);
            // Handle error (e.g., display error message to the user)
        }
    };


    return (
        <div className='div2'>
        <form  className='form1' onSubmit={handleSubmit}>
        <input className='input1' name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange}/>
        <input className='input2' name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange}/>
      <button className='button1' type="submit">Sign in</button>
      <p className='p2'>Don't have an account?<button className='button2' onClick={() => setCurrentPage('signup')}>Sign Up</button> </p>
    </form>
    </div>
    );
};

export default SignInForm;