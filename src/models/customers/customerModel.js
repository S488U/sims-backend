import mongoose from "mongoose";

const customersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      default: null
    },
    paymentPreference: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true
    },
    isActive: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Customers = mongoose.model("Customers", customersSchema);
export default Customers;
