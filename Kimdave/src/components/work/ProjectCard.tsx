import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../../data/types';
import { ResponsivePhoto } from '../ui/ResponsivePhoto';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link
      to={`/work/${project.slug}`}
      className="project-card"
      aria-label={`View ${project.title} (${project.category})`}
    >
      <div className="project-card-image-wrapper">
        <ResponsivePhoto
          image={project.coverImage}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 94vw"
          className="project-card-image"
          loading="lazy"
          style={{ objectPosition: project.coverImage.focalPoint || '50% 50%' }}
        />
      </div>
      <div className="project-card-meta">
        <span className="project-card-category">{project.category}</span>
        <h3 className="project-card-title">
          <span>{project.title}</span>
          <ArrowUpRight size={18} className="project-card-arrow" aria-hidden="true" />
        </h3>
      </div>
    </Link>
  );
};
