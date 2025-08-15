import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turf",
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          // Compare only the date part (without time)
          const bookingDate = new Date(v.getFullYear(), v.getMonth(), v.getDate());
          const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
          return bookingDate >= today;
        },
        message: "Booking date must be today or in the future.",
      },
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "canceled", "completed"],
      default: "confirmed",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      maxlength: 500,
      default: null,
    },
  }, { timestamps: true });
  
  bookingSchema.index({ turf: 1, bookingDate: 1, timeSlot: 1 }, { unique: true });
  
const Booking = mongoose.model("Booking", bookingSchema);
export { Booking };