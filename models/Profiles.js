const mongoose = require('mongoose');
const ProfSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    company: {
        type: String
    },
    website: {
        type: String
    },
    skills: {
        type: [String],
    },
    currentStatus: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    githubUser: {
        type: String
    },


    experience: [
        {
            title: {
                type: String,
                required: true
            },
            company: {
                type: String,
                required: true
            },
            duration: {
                type: String
            },
            currentPosition: {
                type: Boolean,
                required: true
            }
        }
    ],


    education: [
        {
            level: {
                type: String,
                required: true
            },
            institution: {
                type: String,
                required: true
            },
            field: {
                type: String
            },
            duration: {
                type: String
            },
            currentlyStudying: {
                type: Boolean,
                required: true
            }
        }
    ],


    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = Profile = mongoose.model('profile', ProfSchema);