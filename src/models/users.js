const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasks')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password does not contain \'password\'')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
                throw new Error('Age must be positive integer!')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this.toObject();

    delete user.password;
    delete user.tokens;
    delete user.avatar;

    return user;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY);

    user.tokens.push({token})
    await user.save()

    return token;
}

//verifying user credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Invalid login credentials!')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Invalid login credentials!')
    }

    return user;
}

//plain password hashing
userSchema.pre('save', async function (next) {
    user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next();
})

//delete all tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User