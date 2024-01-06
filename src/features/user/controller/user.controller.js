import User from '../../user/model/user.model.js';
import jwt from 'jsonwebtoken';

export default class UserController{
    static async signUp(req, res){
        try{
        const {name, email, password, type} = req.body;
        const user = await User.create({name, email, password, type});
        if(user){
            res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    type: user.type
                }
            })        
        }
    }catch(err){
        res.status(500).json({
            status: 'error',
            error: err.message
        })
    }
    }

    static async signIn(req, res){

        try{
        const {email, password} = req.body;
        if(!email || !password){
            res.status(400).json({
                status: 'error',
                error: 'Please provide email and password'
            })
        }else{
        const user = await User.findOne({email, password})
        // console.log(user);  
        if(!user){
            res.status(404).json({
                status: 'error',
                error: 'Invalid email or password'
            })
        }else{
            // Create token to be sent to the client
            
            jwt.sign({email:user.email,id: user._id}, 'secretkey', {expiresIn: '1h'}, (err, token)=>{
                
                if(err){
                    res.status(500).json({
                        status: 'error',
                        error: 'Internal Server Error'
                    })
                }else{
                    
                    res.status(200).json({
                        status: 'success',
                        message: 'User logged in successfully',
                        data: {
                            token
                        }
                    })
                }
            }
        )}
    }
    }catch(err){
        res.status(500).json({
            status: 'error',
            error: err.message
        })
    }
}

    static async resetPassword(req, res){
        try{
            const password = req.body.password;
            const id = req.params.id;
            const user = await User.findByIdAndUpdate(id, {password}, {new: true});
            console.log(user)
            if(user){
                await user.save();
                res.status(200).json({
                    status: 'success',
                    message: 'Password reset successfully',
                })
            }
            else{
                res.status(404).json({
                    status: 'error',
                    error: 'User not found'
                })
            
            }

        }
        catch(err){
            res.status(500).json({
                status: 'error',
                error: err.message
            })
        }
}
}