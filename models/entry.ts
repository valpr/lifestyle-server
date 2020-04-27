import mongoose from 'mongoose'


const entrySchema = new mongoose.Schema({
    description: String,
    date: Date,
    time: Number, //seconds in day
    calories: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

})

entrySchema.set('toJSON', {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})

const Entry =  mongoose.model('Entry', entrySchema)

export default Entry