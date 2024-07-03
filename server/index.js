// server/index.js
// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Import the cors package
const jwt = require('jsonwebtoken');


// Create an Express application
const app = express();
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, 'your_secret_key', { expiresIn: '1h' }); // Adjust the expiration time as needed
}

// Define the port number
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Create a MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'harini07', 
    database: 'question_paper'
});

// Connect to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');

    // Check if the users table exists, and if not, create it
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            rollNo VARCHAR(10) NOT NULL,
            department VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL,
            currentYear VARCHAR(5) NOT NULL,
            password VARCHAR(255) NOT NULL
        )
    `;
    db.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created successfully or already exists');
        }
    });
});

// Configure the Express application to use JSON body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.get('/checkRollNo/:rollNo', (req, res) => {
    const { rollNo } = req.params;
    db.query('SELECT * FROM users WHERE rollNo = ?', [rollNo], (err, result) => {
        if (err) {
            console.error('Error checking roll number:', err);
            res.status(500).json({ error: 'An error occurred while checking the roll number' });
        } else {
            res.json({ exists: result.length > 0 });
        }
    });
});
app.get('/questions/:department', (req, res) => {
    const {department} = req.params; // Assuming branch is the department name
    
    db.query('SELECT * FROM questions WHERE branch = ?', [department], (err, results) => {
      if (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(results);
    });
  });
  app.get('/years/:department', (req, res) => {
    const { department } = req.params;
    db.query('SELECT DISTINCT year FROM questions WHERE branch = ?', [department], (err, results) => {
        if (err) {
            console.error('Error fetching years:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const years = results.map((result) => result.year);
        res.json(years);
    });
});

app.get('/subjects/:department/:year', (req, res) => {
    const { department, year } = req.params;
    db.query('SELECT DISTINCT sub FROM questions WHERE branch = ? AND year = ?', [department, year], (err, results) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const subjects = results.map((result) => result.sub);
        res.json(subjects);
    });
});
app.get('/subjects/:department', (req, res) => {
    const { department } = req.params;

    db.query('SELECT DISTINCT sub FROM questions WHERE branch = ?', [department], (err, results) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const subjects = results.map((result) => result.sub);
        res.json(subjects);
    });
});


app.get('/examtypes/:department/:year/:subject', (req, res) => {
    const { department, year, subject } = req.params;
    let sqlQuery = 'SELECT DISTINCT examtype FROM questions WHERE branch = ?';
    const queryParams = [department];
    if (year !== 'ALL') {
        sqlQuery += ' AND year = ?';
        queryParams.push(year);
    }
    if (subject !== 'ALL') {
        sqlQuery += ' AND sub = ?';
        queryParams.push(subject);
    }
    db.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching exam types:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const examTypes = results.map((result) => result.examtype);
        res.json(examTypes);
    });
   
});

app.get('/academicyears', (req, res) => {
    // Assuming you have a fixed set of academic years
    const academicYears = ['2022', '2023']; // Modify as needed
    res.json(academicYears);
});
// server/index.js

// Add a new route to fetch images based on selected criteria
// Add a new route to fetch images based on selected criteria
app.get('/images/:department/:year/:subject/:examtype/:academicyear', (req, res) => {
    const { department, year, subject, examtype, academicyear } = req.params;

    // Construct your SQL query based on the selected criteria
    let sqlQuery = 'SELECT * FROM questions WHERE branch = ?';
    const queryParams = [department];

    // Add conditions based on other selected criteria
    if (year !== 'ALL') {
        sqlQuery += ' AND year = ?';
        queryParams.push(year);
    }
    if (subject !== 'ALL') {
        sqlQuery += ' AND sub = ?';
        queryParams.push(subject);
    }
    if (examtype !== 'ALL') {
        sqlQuery += ' AND examtype = ?';
        queryParams.push(examtype);
    }
    if (academicyear !== 'ALL') {
        sqlQuery += ' AND academicyear = ?';
        queryParams.push(academicyear);
    }

    db.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching images:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        // Modify the response to include the required information
        const images = results.map((result) => {
            return {
                image: result.image.toString('base64'),
                name: `${department}_${result.year}_${result.sub}_${result.academicyear}_${result.examtype}`,
                id:result.questionid
            
            };
        });
        res.json(images);
    });
});
app.post('/favorites/add', (req, res) => {
    const { userId, imageId } = req.body; // Extract image blob from request body

    // Check if the combination of userId and imageId already exists
    db.query(
        "SELECT * FROM favorites WHERE userid = ? AND imageid = ?",
        [userId, imageId],
        (err, result) => {
            if (err) {
                console.error('Error checking for existing favorite:', err);
                return res.status(500).json({ error: 'Error checking for existing favorite' });
            }
            
            // If the combination already exists, return a message indicating it
            if (result.length > 0) {
                return res.status(400).json({ error: 'Favorite already exists' });
            }

            // If the combination does not exist, insert the favorite image into the database
            db.query(
                "INSERT INTO favorites (userid, imageid) VALUES (?, ?)",
                [userId, imageId],
                (err, result) => {
                    if (err) {
                        console.error('Error adding favorite:', err);
                        return res.status(500).json({ error: 'Error adding favorite' });
                    }
                    return res.status(200).json({ success: true, message: 'Favorite added successfully' });
                }
            );
        }
    );
});


app.post('/favorites/remove', (req, res) => {
    const { userId, imageId } = req.body;

    // Remove the favorite image from the database for the user
    db.query(
        "DELETE FROM favorites WHERE userid = ? AND imageid = ?", // Adjust query to match imageid
        [userId, imageId],
        (err, result) => {
            if (err) {
                console.error('Error removing favorite:', err);
                return res.status(500).json({ error: 'Error removing favorite' });
            }
            return res.status(200).json({ success: true, message: 'Favorite removed successfully' });
        }
    );
});
app.get('/favorites/:userId', (req, res) => {
    const userId = req.params.userId;

    // Retrieve image IDs associated with the given userId from the favorites table
    db.query(
        "SELECT imageid FROM favorites WHERE userid = ?",
        [userId],
        (err, result) => {
            if (err) {
                console.error('Error retrieving favorite image IDs:', err);
                return res.status(500).json({ error: 'Error retrieving favorite image IDs' });
            }

            // Extract the image IDs from the result
            const imageIds = result.map(row => row.imageid);

            // Fetch images from the questions table using the retrieved image IDs
            db.query(
                "SELECT * FROM questions WHERE questionid IN (?)",
                [imageIds],
                (err, results) => {
                    if (err) {
                        console.error('Error retrieving favorite images:', err);
                        return res.status(500).json({ error: 'Error retrieving favorite images' });
                    }
                    
                    // Map over the results and convert each image to base64 string
                    const images = results.map((result) => {
                        return {
                            image: result.image.toString('base64'),
                            name: `${result.branch}_${result.year}_${result.sub}_${result.academicyear}_${result.examtype}`,
                            id: result.questionid
                        };
                    });
                    
                    // Return the fetched images
                    res.json(images);
                }
            );
        }
    );
});



// Define the POST route for user signup
app.post('/signup', (req, res) => {
    // Extract user information from the request body
    const { name, rollNo, department, email, currentYear, password } = req.body;

    // Insert user into the database
    db.query(
        "INSERT INTO users (name, rollNo, department, email, currentYear, password) VALUES (?,?,?,?,?,?)",
        [name, rollNo, department, email, currentYear, password],
        (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({ error: 'Error registering user' });
            } else {
                console.log('User signed up successfully:', email);
                // Fetch the inserted user ID from the database
                db.query(
                    "SELECT id FROM users WHERE email = ?",
                    [email],
                    (err, user) => {
                        if (err) {
                            console.error('Error fetching user ID:', err);
                            res.status(500).json({ error: 'Error registering user' });
                        } else {
                            const userId = user[0].id;
                            const token = generateToken(userId); // Generate token with user ID
                            res.status(200).json({ success: true, message: 'User signed up successfully', userId, token }); // Send user ID and token to the client
                        }
                    }
                );
            }
        }
    );
});






app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists with provided email and password
    const signInQuery = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.query(signInQuery, [email, password], async (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (result.length === 0) {
            console.log('Invalid email or password');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Authentication successful
        console.log('User signed in successfully:', email);
        const token = generateToken(req.body); // Generate token
        return res.status(200).json({ success: true, message: 'User signed in successfully', user: result[0] });
    });
});


// Start the Express server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});