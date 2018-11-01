const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

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
})

IdeaSchema.plugin(timestamp)

const Idea = mongoose.model('Idea', IdeaSchema)

module.exports = Idea