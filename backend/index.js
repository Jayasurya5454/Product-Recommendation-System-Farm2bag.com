const express = require('express');
const app = express();
const connectdb = require('./connections/connectdb.js');

connectdb();
// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/product', require('./routes/product'));
app.use('/api/event', require('./routes/event'));
app.use('/api/order', require('./routes/order'));


// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));