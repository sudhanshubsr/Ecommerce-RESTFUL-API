// ! Structure of the JWT Token
// ! Header = { "alg": "HS256", "typ": "JWT" } is encoded to Base64Url to form the first part of the JWT.

// ! Payload is the data we want to store in the token, for example: { "id": "1234567890", "name": "John Doe", "admin": true }

// ! Signature is the encoded header, the encoded payload, a secret, the algorithm specified in the header, and the type of token.


// ? Login with Credentials >> Generate JWT Token >> Send JWT Token to Client >> Client sends JWT Token with every request >> Server verifies JWT Token >> Server sends response

import jwt from 'jsonwebtoken';

const jwtAuth = (req,res,next)=>{
    //? Read the Token

    const authheader = req.headers.authorization;
    if(!authheader){
        return res.status(401).json({message:"Unauthorized"})
    }
    const token = authheader.replace('Bearer ',''); //? remove Bearer from the token

    //? if no token, return 401
    if(!token){
        return res.status(401).send('Unauthorized');
    }
    //? check if token is valid
    const payload = jwt.verify(token, 'secretkey');
    if(!payload){
        return res.status(401).send('Unauthorized');
    }
    req.user = payload;
    next();
};


export default jwtAuth;