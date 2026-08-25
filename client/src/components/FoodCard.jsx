import { Plus, Star } from 'lucide-react';

const FoodCard = ({ food }) => {
  if (!food) return null;

  const isVeg = food.dietaryPreference === 'Vegetarian' || food.dietaryPreference === 'Vegan';
  const imageUrl = food.image || (food.images && food.images[0]) || 'https://placehold.co/400x300/f97316/white?text=FeastFlow';
  const rating = food.rating ?? food.averageRating ?? 0;

  return (
    <div className="card group relative flex flex-col justify-between overflow-hidden">
      {/* Veg/Non-Veg Indicator (FSSAI dot) */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur rounded p-1 shadow-sm">
        <div className={`w-3 h-3 rounded-sm border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[2px]`}>
          <div className={`w-full h-full rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
        </div>
      </div>

      {/* Tags */}
      {food.tags && food.tags.length > 0 && (
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {food.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-secondary text-gray-900 text-xs font-bold px-2 py-0.5 rounded capitalize shadow-sm">
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={imageUrl}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300/f97316/white?text=FeastFlow'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-display font-bold text-lg leading-tight line-clamp-1">{food.name}</h3>
          <div className="flex items-center gap-1 text-sm font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded shrink-0">
            <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
            <span>{Number(rating).toFixed(1)}</span>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
          {food.description}
        </p>

        {food.category?.name && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 capitalize">
            {food.category.name}
          </span>
        )}

        {food.restaurant?.name && (
          <span className="text-xs font-semibold text-primary mb-3 line-clamp-1">
            By {food.restaurant.name}
          </span>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
            ${Number(food.price).toFixed(2)}
          </span>
          <button className="bg-primary/10 hover:bg-primary text-primary hover:text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm active:scale-95">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
