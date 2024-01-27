import mongoose, {Schema} from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        firstname : {
            type : String,
            required : true,
            unique : true,
            trim:true,
            index:true
        },
        lastname : {
            type : String,
            required : true,
            unique : true,
            trim:true,
            index:true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            trim:true,
            index:true

        }, 
        password : {
            type: String,
            required : [true, "Password is required"]
        },
        confirmPassword : {
            type: String,
            required : [true, "Password is required"]
        },
        refreshToken : {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            firstname: this.firstname,
            lastname: this.lastname
        },
        process.nextTick.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
     return jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
     )
}

export const User = mongoose.model('User',userSchema);