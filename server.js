/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Jaimil Vaghela
Student ID: 123128233
Date: 09-10-2024
Vercel Web App URL: https://web322-kappa.vercel.app/
GitHub Repository URL: https://github.com/jsvaghela1/web322.git

********************************************************************************/ 
 

const express = require('express'); // Require the Express module
const path = require('path'); // Adding the path module
const dataserver = require('./store-service.js'); // Service for data handling
const multer = require('multer'); // For handling file uploads
const cloudinary = require('cloudinary').v2; // For cloud image uploads
const streamifier = require('streamifier'); // For streaming image uploads

const app = express(); // Obtain the app object
const HTTP_PORT = process.env.PORT || 8080; // Assign a port

app.use(express.static('public')); // Serving static files
app.use(express.json()); // To support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // To support URL-encoded bodies

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'danhctegv', // Replace with your actual cloud name
    api_key: '148185547524292', // Replace with your actual API key
    api_secret: 'fYYCfjO2aDjSR6uyOQkvTY-pjG8', // Replace with your actual API secret
    secure: true
});

const upload = multer(); // No disk storage

// Redirect to the default page
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Route to get published items
app.get('/shop', (req, res) => {
    dataserver.getPublishedItems()
        .then((data) => {
            res.json(data); // Send published items data
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

// Route to send About page
app.get('/about', (req, res) => {
    // res.send("rewsr")
    res.sendFile(path.join(__dirname, './views/about.html'));
});

// Route to get all categories
app.get('/categories', (req, res) => {
    dataserver.getAllCategories()
        .then((data) => {
            console.log("All Categories Json");
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
            res.json(err);
        });
});

// Route to get all items
app.get('/items', (req, res) => {
    dataserver.getAllItems()
        .then((data) => {
            console.log("All Items Json");
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
            res.json(err);
        });
});

// Route to serve addItem.html
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

// POST route for adding items
app.post('/items/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.log(error);
            res.status(500).send("Error uploading image");
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl; // Add the image URL to the request body
        // Call addItem function to save item
        dataserver.addItem(req.body) // Make sure addItem exists in store-service.js
            .then(() => {
                res.redirect('/shop'); // Redirect to the shop page after adding item
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send("Error adding item");
            });
    }
});

// 404 Error handling
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize server
dataserver.initialize()
    .then(() => {
        console.log("Server initialized");
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port http://localhost:${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

// Export the app for serverless function
module.exports = app; // Add this line to export the app for Vercel