import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    time: {
        type: Number,
        required: true,
        unique: true

    },
    booked: {
        type: Boolean,
        required: true,
        default: false
    },
    bookingId: {
        type: String
    }
}, { timestamps: true })

export const Slot = mongoose.model("Slot", slotSchema)