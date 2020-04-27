import mongoose from 'mongoose'
import validator from 'mongoose-unique-validator'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        unique: true
    },
    name: String,
    passwordHash: String,
    entries: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entry'
        }
    ]
})
userSchema.set('toJSON', {
    transform: (_document, returnedObject) =>{
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

userSchema.plugin(validator)

const User  = mongoose.model('User', userSchema)

export default User
