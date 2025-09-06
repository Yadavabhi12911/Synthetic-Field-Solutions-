import mongoose from "mongoose";

const turfSchema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
 
    description: {
        type: String,
        required: true,

    },


    price: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true

    },
    ContactNumber: {
        type: Number, //! need improvement
        required: true,
    },
    photos: [
        {
            photos: {
                type: String,
            },
            public_id: {
                type: String
            }
        }
    ],
    turfTiming: [
        {
            time: {
                type: String,
                required: true
            },
            status: {
                type: Boolean,
                required: true,
                default: false

            }

        },
       
    ],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

// Add indexes for better query performance
turfSchema.index({ address: 1, pincode: 1, description: 1 }); // Compound index for search
turfSchema.index({ owner: 1 }); // Index for owner lookups
turfSchema.index({ price: 1 }); // Index for price sorting
turfSchema.index({ averageRating: -1 }); // Index for rating sorting
turfSchema.index({ createdAt: -1 }); // Index for date sorting
turfSchema.index({ "address": "text", "pincode": "text", "description": "text" }); // Text index for full-text search

export const Turf = mongoose.model("Turf", turfSchema)
