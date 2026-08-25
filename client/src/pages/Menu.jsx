import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, getFoods } from '../features/menu/menuSlice';
import FoodCard from '../components/FoodCard';
import CategoryPills from '../components/CategoryPills';
import FilterSidebar from '../components/FilterSidebar';
import FoodItemModal from '../components/FoodItemModal';
import { Search, Loader2 } from 'lucide-react';

const Menu = () => {
  const dispatch = useDispatch();
  const { categories, foods, isLoading } = useSelector((state) => state.menu);

  const [selectedFood, setSelectedFood] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isVeg: undefined,
    sort: '',
    restaurantName: '',
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    let query = '?';
    if (activeCategory) query += `category=${activeCategory}&`;
    if (searchTerm) query += `keyword=${searchTerm}&`;
    if (filters.isVeg !== undefined) query += `isVeg=${filters.isVeg}&`;
    if (filters.sort) query += `sort=${filters.sort}&`;
    if (filters.minPrice) query += `minPrice=${filters.minPrice}&`;
    if (filters.maxPrice) query += `maxPrice=${filters.maxPrice}&`;
    if (filters.restaurantName) query += `restaurantName=${filters.restaurantName}&`;
    
    const delay = isFirstRender.current ? 0 : 300;

    const delayDebounceFn = setTimeout(() => {
      dispatch(getFoods(query));
      isFirstRender.current = false;
    }, delay);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, activeCategory, searchTerm, filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white">Our Menu</h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by dishes..."
            className="input-field pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>

        {/* Menu Content */}
        <div className="lg:w-3/4">
          <CategoryPills 
            categories={categories} 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />

          <div className="relative">
            {isLoading && foods.length > 0 && (
              <div className="absolute top-0 left-0 w-full h-full bg-white/50 dark:bg-black/50 z-10 flex items-start pt-20 justify-center rounded-2xl backdrop-blur-[2px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            
            {(isLoading && foods.length === 0) || isFirstRender.current ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                {/* Skeleton Loaders */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card h-80 animate-pulse bg-gray-200 dark:bg-gray-800"></div>
                ))}
              </div>
            ) : foods.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">No items found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {foods.map((food) => (
                  <div key={food._id} onClick={() => setSelectedFood(food)} className="cursor-pointer">
                    <FoodCard food={food} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {selectedFood && (
        <FoodItemModal 
          food={selectedFood} 
          onClose={() => setSelectedFood(null)} 
        />
      )}
    </div>
  );
};

export default Menu;
