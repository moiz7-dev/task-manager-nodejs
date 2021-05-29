const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'

    },
    document: {
        type: Buffer
    }
}, {
    timestamps: true
})

taskSchema.methods.toJSON = function () {
    const task = this.toObject();

    delete task.document;

    return task;
}

const Task = mongoose.model('Task', taskSchema)

module.exports = Task;