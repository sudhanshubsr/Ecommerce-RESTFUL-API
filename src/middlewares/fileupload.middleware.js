import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, path.join(path.resolve(),'uploads'));
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,file.originalname + '-' + uniqueSuffix)
    }
        });

  const upload = multer({storage:storage});

  export default upload;