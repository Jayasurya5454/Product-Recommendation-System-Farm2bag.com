const express = require('express');
const app = express();
const db = require('./connections/dbConnect.js');


// Middleware
app.use(express.json());
app.use(cors());


// Routes
