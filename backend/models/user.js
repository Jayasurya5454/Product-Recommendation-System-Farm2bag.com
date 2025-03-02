const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
	userid: {
		type: String,
        required: true,
        unique: true,
    },
	
	email: {
		type: String,
		required: true,
		unique: true,
	},
	mobileNumber: {
		type: String,
        required: false,
        unique: true,
    },
	lastVisit: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('user', UserSchema);