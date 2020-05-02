/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Document, Model, model, Schema } from "mongoose"
import { IEntry } from "./entry"
import bcrypt from 'bcrypt'


const UserSchema = new Schema({
    firstname: {
      type: String,
      required: true
    },
    lastname: String,
    username: {
      type: String,
      unique: true,
      required: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    entries: [{
      type: Schema.Types.ObjectId,
      ref: "Entry",
      required: true
    }],
    gender: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: true
    },
    height: {
      type: Number,
      default: 0,
      required: true
    },
    weights: [
      {
        weight: {
          type: Number,
          required: true
        },
        date: {
          type: Date,
          required: true
        }
      }
    ],
    objective: {
      type: Number,
      enum: [0.8, 1.0, 1.3],
      default: 0,
      required: true
    },
    effort: {
      type: Number,
      enum: [1.2, 1.4, 1.5, 1.7, 1.8],
      default: 0,
      required: true
    }
  })

  enum Objective {
    Gain = 1.3,
    Neutral = 1.0,
    Loss = 0.8
  }
  
  interface WeightEntry {
    weight: number;
    date: Date;
  }

  enum Effort {
    Sedentary = 1.2,
    Light = 1.4,
    Moderate = 1.5,
    Heavy = 1.7,
    Extreme = 1.8
  }

  enum Gender {
      Male = 1,
      Female = 0
  }

  interface IUserSchema extends Document {
      firstname: string;
      lastname?: string;
      username: string;
      password: string;
      height: number;
      objective: Objective;
      effort: Effort;
      weight: WeightEntry;
      gender: Gender;
  }

  UserSchema.virtual("fullName").get(function(this: {firstname: string; lastname: string}) {
    return this.firstname +" "+ this.lastname
  })

  UserSchema.methods.getGender = function(): string {
      return this.gender > 0 ? "Male" : "Female"
  }

  interface IUserBase extends IUserSchema {
      fullname: string;
      getGender(): string;
  }

  export interface IUser extends IUserBase { //when you want the IDs
       entries: Array<IEntry["_id"]>;
  }

  export interface IUserPopulated extends IUserBase {
      entries: [IEntry];
  }

  UserSchema.statics.findMyEntries =  function(id: string) {
      return this.findById(id).populate("entries").exec()
  }

  export interface IUserModel extends Model<IUser> {
    _id: string;

      findMyEntries(id: string): Promise<IUserPopulated>;
  }

  UserSchema.pre<IUser>("save", async function(_next){
      if (this.isModified("password")){
          this.password = await bcrypt.hash(this.password,10)
      }
  })


  export default model<IUser, IUserModel>("User", UserSchema)

  