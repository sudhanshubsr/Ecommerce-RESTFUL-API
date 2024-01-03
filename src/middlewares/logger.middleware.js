import fs from 'fs';

const fsPromises = fs.promises;

async function log(logData){
    try{
        logData ="\n" + new Date().toString() + " " + logData + "\n";
        await fsPromises.appendFile('logs.txt', logData)
    }
    catch(err){
        console.log(err)
    }
}

const loggerMiddleware = async (req,res,next)=>{
    if(!req.url.includes('signin')){
    const logData = `url:${req.url} - body:${JSON.stringify(req.body)} - method:${req.method}`
    await log(logData);
}

    next();
}

export default loggerMiddleware;
