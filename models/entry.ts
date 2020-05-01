/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Document, Model, model, Schema } from "mongoose"
import { IUser } from './user'


const entrySchema = new Schema({
    description: String,
    date: {
        type: Date,
        required: true
    },
    time: {
        type: Number,
        required: true
    }, //seconds in day
    calories: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

})

interface IEntrySchema extends Document {
    description: string;
    date: Date;
    time: number;
    calories: number;

}

entrySchema.set('toJSON', {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})


entrySchema.virtual("clockTime").get(function (this: {time: number}) {
    const hour= Math.floor(this.time/3600)
    const minutes = Math.floor((this.time%3600)/60) > 10 ? `${Math.floor((this.time%3600)/60)}` 
    : `0${Math.floor((this.time%3600)/60)}` 
    return `${hour}:${minutes}`
})

export interface IEntryBase extends IEntrySchema {
    clockTime: string;
} 

export interface IEntry extends IEntryBase {
    user: IUser["_id"];
}

export interface IEntryPopulated extends IEntryBase {
    user: IUser;
}

entrySchema.statics.findUser = function(id: string) {
    return this.findById(id).populate("User").exec()
}

export interface IEntryModel extends Model<IEntry> {
    findUser(id: string): Promise<IEntryPopulated>;
}


export default model<IEntry, IEntryModel>("Entry", entrySchema)

