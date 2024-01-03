import UserModel from "../features/user/model/user.model.js";

const basicAuthorizer = async (req, res, next) => {
    //? Check if Authorization header is present

    const authHeader = req.headers.authorization;
    // crendentiasl will be a part of the header
    console.log(authHeader);

    if(!authHeader){
        return res.status(401).send('No Authorization header found');
    }

    //? Check if Authorization header is valid
    const base64Credentials = authHeader.replace('Basic ', '');
    // ? header will contain it in the form "Basic <credentials>" so we need to remove the "Basic " part and keep the credentials only

    //? Decode the credentials
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    
    const [email, password] = decodedCredentials.split(':');
    // ? credentials will be in the form "email:password" so we need to split them

   console.log(email,password)
   try{
    
        //? Check if user exists in the database
        const user = await UserModel.findOne({email});
        if(!user || user.password !== password){
            return res.status(401).send('Invalid Authentication Credentials');
        }
        //? If user exists, proceed to the next middleware
        next();
   }catch(err){
         console.log(err);
        return res.status(500).send('Internal Server Error');
   }
}
export default basicAuthorizer;