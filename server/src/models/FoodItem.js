import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
    ingredients: [String],
    allergens: [String],
    dietaryPreference: {
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'None'],
      default: 'None',
    },
    options: [
      {
        name: { type: String, required: true }, // e.g., 'Size', 'Crust'
        choices: [
          {
            name: { type: String, required: true },
            additionalPrice: { type: Number, default: 0 },
          },
        ],
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    tags: [String], // e.g., ['Spicy', 'Popular', 'New']
  },
  {
    timestamps: true,
  }
);

foodItemSchema.index({ name: 'text', description: 'text' });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
