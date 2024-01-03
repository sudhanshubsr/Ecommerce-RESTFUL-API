import JWTStrategy from 'passport-jwt';
import ExtractJwt from 'passport-jwt';
import User from '../features/user/model/user.model.js';
import passport from 'passport';

const opts = {
    jwtFromRequest: ExtractJwt.ExtractJwt.fromAuthHeaderAsBearerToken(), 
    secretOrKey:'secretkey'
};

passport.use(new JWTStrategy.Strategy(opts, (jwtPayLoad, done, req) => {
    User.find(jwtPayLoad.email)
    .then((user) => {
        if(user){
            console.log(user)
            req.userId = user._id;
            return done(null, user);
        }else{
            return done(null, false);
        }
    
    }) 
    .catch((err) => {
        return done(err, false);
    })
        

}))
export default passport;