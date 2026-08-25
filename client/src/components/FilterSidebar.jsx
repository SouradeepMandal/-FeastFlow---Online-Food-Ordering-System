import { Filter } from 'lucide-react';

const FilterSidebar = ({ filters, setFilters }) => {
  const handleSortChange = (e) => {
    setFilters({ ...filters, sort: e.target.value });
  };

  const handleDietaryChange = (e) => {
    const value = e.target.value;
    setFilters({ ...filters, isVeg: value === 'all' ? undefined : value === 'veg' });
  };

  return (
    <div className="card p-6 sticky top-24">
      <h2 className="text-xl font-bold font-display flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-primary" />
        Filters
      </h2>

      {/* Sort By */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Sort By</h3>
        <select 
          className="input-field cursor-pointer"
          value={filters.sort}
          onChange={handleSortChange}
        >
          <option value="">Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Dietary */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Dietary Preference</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="dietary" 
              value="all" 
              checked={filters.isVeg === undefined}
              onChange={handleDietaryChange}
              className="w-4 h-4 text-primary focus:ring-primary/50" 
            />
            <span className="group-hover:text-primary transition-colors">All Items</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="dietary" 
              value="veg" 
              checked={filters.isVeg === true}
              onChange={handleDietaryChange}
              className="w-4 h-4 text-green-600 focus:ring-green-600/50" 
            />
            <span className="group-hover:text-green-600 transition-colors">Vegetarian Only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="dietary" 
              value="non-veg" 
              checked={filters.isVeg === false}
              onChange={handleDietaryChange}
              className="w-4 h-4 text-red-600 focus:ring-red-600/50" 
            />
            <span className="group-hover:text-red-600 transition-colors">Non-Vegetarian Only</span>
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Price Range</h3>
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            placeholder="Min" 
            className="input-field w-full py-2 px-3 text-sm"
            value={filters.minPrice || ''}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            className="input-field w-full py-2 px-3 text-sm"
            value={filters.maxPrice || ''}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>
      
      {/* Clear Filters */}
      <button 
        onClick={() => setFilters({ isVeg: undefined, sort: '', minPrice: '', maxPrice: '' })}
        className="w-full py-2 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default FilterSidebar;
