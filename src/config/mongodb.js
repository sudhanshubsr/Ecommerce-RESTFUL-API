import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config();

const url = process.env.MONGODB_URL

const connectToMongoDB = async ()=>{
    await MongoClient.connect(url)
    .then(db =>{
        console.log("Connected to MongoDB")
    })
    .catch(err =>{
        console.log("Error connecting to MongoDB", err)
    })
}

export default connectToMongoDB;