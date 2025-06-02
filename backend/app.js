// backend/app.js
require('dotenv').config()
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const cors = require('cors');



const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());


app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Routes
const authRoutes = require('./routes/auth.routes');
const employerRoutes = require('./routes/employer.routes');
const candidateRoutes = require('./routes/candidate.routes');



app.use('/api/candidate', candidateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/employer', employerRoutes);


app.get('/', (req, res) => res.render('index'));

// 404 fallback
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
