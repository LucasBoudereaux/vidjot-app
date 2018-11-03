const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
const User = require('./User')

const IdeaSchema = new mongoose.Schema({
    title: {
        type: 'String',
        required: true,
        trim: true
    },
    details: {
        type: 'String',
        required: true,
        trim: true
    },
    user: {
        type: String,
        required: true
    }
})

IdeaSchema.plugin(timestamp)

const Idea = mongoose.model('Idea', IdeaSchema)

module.exports = Idea