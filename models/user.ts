import { Document, Model, model, Types, Schema, Query } from "mongoose"
import validator from 'mongoose-unique-validator'
//
const userSchema = new Schema({
    username: {
        type: String,
        minlength: 3,
        unique: true,
        required: true
    },
    name: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String,
        minlength:3
    },
    entries: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Entry'
        }
    ]
})

interface MyUserSchema extends Document {
    name: string;
    username: string;
    password: string;
    entries: Types.Array<string>;
}

userSchema.set('toJSON', {
    transform: (_document, returnedObject) =>{
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

userSchema.plugin(validator)


const User  = model('User', userSchema)

export default User
