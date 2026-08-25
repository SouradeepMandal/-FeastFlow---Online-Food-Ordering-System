import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    cuisineTags: [String],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    geoPin: {
      lat: Number,
      lng: Number,
    },
    fssaiNumber: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
    },
    bankDetails: {
      type: String, // Masked or encrypted in a real prod system
    },
    commissionRate: {
      type: Number,
      default: 15, // Default 15%
    },
    tier: {
      type: String,
      enum: ['Premium Partner', 'Standard', 'Trial'],
      default: 'Trial',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'banned'],
      default: 'active',
    },
    documentsExpiry: [
      {
        docType: String,
        expiresAt: Date,
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
