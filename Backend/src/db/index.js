import dns from "node:dns";
import mongoose from "mongoose"; 
import { DB_NAME } from "../utility/constant.js";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDb =  async () => {
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME,
            family: 4,
        })
        console.log(`\n MONGODB CONNECTED   !! HOST name: ${connectionInstance.connection.host}`)

    }
    catch(err){
        console.log('connection failed', err)
        process.exit(1)
    }
}

export default connectDb










