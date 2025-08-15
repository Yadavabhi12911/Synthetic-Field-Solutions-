import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import connectDb from "./db/index.js";
import { app } from "./utility/app.js";
import { initializeCronJobs } from "./services/cronService.js";

connectDb()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
            
            // Initialize cron jobs for automatic booking completion
            initializeCronJobs();
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });



