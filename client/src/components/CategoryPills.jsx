const CategoryPills = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 mb-4">
      <button
        onClick={() => setActiveCategory('')}
        className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all ${
          activeCategory === ''
            ? 'bg-primary text-white shadow-soft'
            : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
        }`}
      >
        All
      </button>
      {Array.isArray(categories) && categories.map((category) => (
        <button
          key={category._id}
          onClick={() => setActiveCategory(category._id)}
          className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-all ${
            activeCategory === category._id
              ? 'bg-primary text-white shadow-soft'
              : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;
