
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const userSchema= new mongoose.Schema({
userName: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    index: true

},


email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
},

password: {
    type: String,
    required: [true, 'required password'],

},

fullName: {
    type: String,
    required: true,
},
profilePic:{
    type: String,
},
mobileNumber: {
    type: String,
},
address: {
    type: String,
},
isActive: {
    type: Boolean,
    default: true
},
preferences: {
    notifications: {
        type: Boolean,
        default: true
    },
    language: {
        type: String,
        default: 'en'
    },
    theme: {
        type: String,
        default: 'dark'
    }
},
refreshToken: {
    type: String
},
accessToken: {
    type: String
}

}, {timestamps: true})

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()

        this.password = await bcrypt.hash(this.password,10)
        next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken =  function(){
return jwt.sign({
    _id: this._id,
    fullName: this.fullName
},
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
})
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
    },
process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
})
}

export const User = mongoose.model("User", userSchema)