const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    ChatId: {
        type: String,
        required: true,
        unique: true,
    },
    ReferralId: {
        type: Number,
        required: true,
        unique: true,
    },
    ReferralCount: {
        type: Number,
        required: true,
    },
    UserNumber: {
        type: Number,
        required: true,
    },
    MoneyCount: {
        type: Number,
        required: true,
    },
    UserName: {
        type: String,
        required: false,
    },
    Name: {
        type: String,
        required: true,
    },
    UserId: {
        type: Number,
        required: true,
    }
}, {timestamps: true})

const User = mongoose.model('User', usersSchema);

module.exports = User;

