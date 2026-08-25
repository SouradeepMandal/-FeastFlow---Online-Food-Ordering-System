import FoodItem from '../models/FoodItem.js';
import Restaurant from '../models/Restaurant.js';

// @desc    Fetch all food items with search, filter, sort
// @route   GET /api/foods
// @access  Public
export const getFoods = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, isVeg, tags, sort, restaurantName } = req.query;

    const query = {};

    // Search by keyword
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by veg/non-veg
    if (isVeg !== undefined) {
      if (isVeg === 'true') {
        query.dietaryPreference = 'Vegetarian';
      } else {
        query.dietaryPreference = { $ne: 'Vegetarian' };
      }
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Filter by restaurant name
    if (restaurantName) {
      const restaurants = await Restaurant.find({ name: { $regex: restaurantName, $options: 'i' } });
      const restaurantIds = restaurants.map(r => r._id);
      query.restaurant = { $in: restaurantIds };
    }

    // Only show items in stock
    query.countInStock = { $gt: 0 };

    // Sorting logic
    let sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOptions.price = 1;
          break;
        case 'price_desc':
          sortOptions.price = -1;
          break;
        case 'rating':
          sortOptions.averageRating = -1;
          break;
        case 'popular':
          sortOptions.numReviews = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      // Default sort by relevance if keyword exists, otherwise newest
      sortOptions = keyword ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
    }

    const foods = await FoodItem.find(query)
      .populate('category', 'name')
      .populate('restaurant', 'name')
      .sort(sortOptions);

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single food item
// @route   GET /api/foods/:id
// @access  Public
export const getFoodById = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id).populate('category', 'name');

    if (food) {
      res.json(food);
    } else {
      res.status(404).json({ message: 'Food item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a food item
// @route   POST /api/foods
// @access  Private/Admin
export const createFood = async (req, res) => {
  try {
    const food = new FoodItem({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
      isVegetarian: req.body.isVegetarian,
      isSpicy: req.body.isSpicy,
      preparationTime: req.body.preparationTime,
      isAvailable: true,
    });
    const createdFood = await food.save();
    res.status(201).json(createdFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
export const updateFood = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (food) {
      food.name = req.body.name || food.name;
      food.price = req.body.price || food.price;
      food.description = req.body.description || food.description;
      food.image = req.body.image || food.image;
      food.category = req.body.category || food.category;
      food.isVegetarian = req.body.isVegetarian !== undefined ? req.body.isVegetarian : food.isVegetarian;
      food.isSpicy = req.body.isSpicy !== undefined ? req.body.isSpicy : food.isSpicy;
      food.preparationTime = req.body.preparationTime || food.preparationTime;
      food.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : food.isAvailable;

      const updatedFood = await food.save();
      res.json(updatedFood);
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
export const deleteFood = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (food) {
      await food.deleteOne();
      res.json({ message: 'Food removed' });
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to food item
// @route   POST /api/foods/:id/reviews
// @access  Private
export const createFoodReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const food = await FoodItem.findById(req.params.id);

    if (food) {
      const alreadyReviewed = food.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400).json({ message: 'Food already reviewed' });
        return;
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      food.reviews.push(review);
      food.numReviews = food.reviews.length;
      food.rating =
        food.reviews.reduce((acc, item) => item.rating + acc, 0) /
        food.reviews.length;

      await food.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
