import React, { useState, useMemo } from 'react';
import { projects } from '../data/projects';
import { ProjectCard } from '../components/work/ProjectCard';
import { CategoryFilter } from '../components/work/CategoryFilter';

export const WorkPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Published projects only
  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.published);
  }, []);

  // Compute available categories and counts
  const { categories, counts } = useMemo(() => {
    const cats = new Set<string>();
    const countMap: Record<string, number> = { All: publishedProjects.length };

    publishedProjects.forEach((p) => {
      cats.add(p.category);
      countMap[p.category] = (countMap[p.category] || 0) + 1;
    });

    return {
      categories: Array.from(cats),
      counts: countMap,
    };
  }, [publishedProjects]);

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return publishedProjects;
    return publishedProjects.filter((p) => p.category === selectedCategory);
  }, [publishedProjects, selectedCategory]);

  return (
    <div className="section-py" style={{ minHeight: '80vh' }}>
      <div className="container">
        <header className="section-header" style={{ marginBottom: '2.5rem' }}>
          <span className="section-label">Archive</span>
          <h1 className="section-title">Selected Photographic Work</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '620px' }}>
            A curated index of editorial portraits, milestone birthday sessions, commercial brand campaigns, and documentary event stories.
          </p>
        </header>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          counts={counts}
        />

        {/* Live status announcement for screen readers */}
        <div className="sr-only" aria-live="polite">
          Showing {filteredProjects.length} projects for category {selectedCategory}
        </div>

        {/* Projects Grid or Empty State */}
        {filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              No projects found in this category.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedCategory('All')}
            >
              Reset to All Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
