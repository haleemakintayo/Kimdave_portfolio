import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  counts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="filter-bar" role="toolbar" aria-label="Filter projects by category">
      <button
        type="button"
        className={`filter-pill ${selectedCategory === 'All' ? 'active' : ''}`}
        onClick={() => onSelectCategory('All')}
        aria-pressed={selectedCategory === 'All'}
      >
        All ({counts['All'] || 0})
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat)}
          aria-pressed={selectedCategory === cat}
        >
          {cat} ({counts[cat] || 0})
        </button>
      ))}
    </div>
  );
};
