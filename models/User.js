const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const UserSchema = new mongoose.Schema({
    name: {
        type: 'String',
        required: true,
        trim: true
    },
    email: {
        type: 'String',
        required: true,
        trim: true
    },
    password: {
        type: 'String',
        required: true,
        trim: true
    }
})

UserSchema.plugin(timestamp)

const User = mongoose.model('User', UserSchema)

module.exports = User