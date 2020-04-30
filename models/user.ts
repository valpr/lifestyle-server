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
    entry: [{
      type: Schema.Types.ObjectId,
      ref: "Entry",
      required: true
    }],
    gender: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: true
    }
  })

  enum Gender {
      Male = 1,
      Female = 0
  }

  interface IUserSchema extends Document {
      firstname: string;
      lastname?: string;
      username: string;
      password: string;
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
       entries: [IEntry["_id"]];
  }

  export interface IUserPopulated extends IUserBase {
      entries: [IEntry];
  }

  UserSchema.statics.findAnEntry =  function(id: string) {
      return this.findById(id).populate("Entry").exec()
  }

  export interface IUserModel extends Model<IUser> {
      findMyCompany(id: string): Promise<IUserPopulated>;
  }

  UserSchema.pre<IUser>("save", async function(_next){
      if (this.isModified("password")){
          this.password = await bcrypt.hash(this.password,10)
      }
  })


  export default model<IUser, IUserModel>("User", UserSchema)

  