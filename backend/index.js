const express = require('express');
const app = express();
const connectdb = require('./connections/connectdb.js');
const cors = require('cors');
connectdb();
// Middleware
app.use(express.json());
app.use(cors());

// Routes
// app.use('/api/user', require('./routes/user'));
app.use('/api/product', require('./routes/product.js'));
app.use('/api/event', require('./routes/event.js'));
app.use('/api/order', require('./routes/order.js'));
app.use('/api/unknownuser', require('./routes/unknownuser.js'));

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));