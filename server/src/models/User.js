import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    ownerUsername: {
      type: String,
      unique: true,
      sparse: true,
    },
    ownerPassword: {
      type: String,
    },
    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'admin', 'delivery_agent'],
      default: 'customer',
    },
    adminSubRole: {
      type: String,
      enum: ['super_admin', 'ops', 'finance', 'support'],
    },
    staffRole: {
      type: String,
      enum: ['owner', 'manager', 'chef'],
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    zoneScope: {
      type: String,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    addresses: [
      {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: {
          type: Boolean,
          default: false,
        }
      }
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
      }
    ],
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchOwnerPassword = async function (enteredPassword) {
  if (!this.ownerPassword) return false;
  return await bcrypt.compare(enteredPassword, this.ownerPassword);
};

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('ownerPassword')) {
    const salt = await bcrypt.genSalt(10);
    this.ownerPassword = await bcrypt.hash(this.ownerPassword, salt);
  }
});

const User = mongoose.model('User', userSchema);
export default User;
