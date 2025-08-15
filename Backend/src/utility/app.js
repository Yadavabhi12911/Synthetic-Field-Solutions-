import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors';


const app = express()


app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static("public"))
app.use(cookieParser())

// routes

import userRouter from '../routes/user.routes.js'
import adminRouter from '../routes/admin.routes.js'
import turfRouter from '../routes/turf.routes.js'
import bookingRouter from '../routes/booking.routes.js'
import adminBookingRouter from '../routes/admin.booking.routes.js'
import adminUserRouter from '../routes/admin.user.routes.js'
import adminAnalyticsRouter from '../routes/admin.analytics.routes.js'
import adminSettingsRouter from '../routes/admin.settings.routes.js'


// router declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admins", adminRouter)
app.use("/api/v1/admins/turfs", turfRouter)
app.use("/api/v1/users/bookings", bookingRouter)
app.use("/api/v1/admins/bookings", adminBookingRouter)
app.use("/api/v1/admins", adminUserRouter)
app.use("/api/v1/admins", adminAnalyticsRouter)
app.use("/api/v1/admins", adminSettingsRouter)


export { app }