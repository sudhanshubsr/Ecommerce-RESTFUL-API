import  mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String, maxLength: [25, 'Name cannot be more than 25 characters'],
        required: true
    },
    email:{
        type: String,
        required: true,
        unique:true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please provide a valid email'
        ]
    },
    password:{
        type:String,
        required: true,
    },
    type:{
        type:String,
        required: true,
        enum: ['customer', 'seller']
    }
}, {timestamps: true});



const User = mongoose.model('User', userSchema);

export default User;