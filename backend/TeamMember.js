const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: false },
    contactNumber: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema); 