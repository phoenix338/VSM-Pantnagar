const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema({
    volunteers: { type: String, default: '1,500+' },
    events: { type: String, default: '120+' },
    people: { type: String, default: '10,000+' },
    hours: { type: String, default: '17,500+' },
    donors: { type: String, default: '1,000+' },
    years: { type: String, default: '25+' }
});

module.exports = mongoose.model('Impact', impactSchema); 