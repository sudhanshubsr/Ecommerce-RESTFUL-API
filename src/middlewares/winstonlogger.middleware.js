import winston from 'winston';

const logger = winston.createLogger({
    level:'info',
    format: winston.format.json(),
    defaultMeta:{service:'request-logging'},
    transports:[
        new winston.transports.File({filename:'logs.txt'})
    ]
});

const winstonloggerMiddleware = async (req,res,next)=>{
    if(!req.url.includes('signin')){
        const logData = `url:${req.url} - body:${JSON.stringify(req.body)} - method:${req.method}`
        logger.info(logData);
    }
    next();
}

export default winstonloggerMiddleware;