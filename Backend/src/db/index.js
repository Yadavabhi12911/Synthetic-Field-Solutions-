import mongoose from "mongoose"; 
import { DB_NAME } from "../utility/constant.js";


const connectDb =  async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI }${ DB_NAME}`)
        console.log(`\n MONGODB CONNECTED   !! HOST name: ${connectionInstance.connection.host}`)

    }
    catch(err){
        console.log('connection failed', err)
        process.exit(1)
    }
}

export default connectDb










