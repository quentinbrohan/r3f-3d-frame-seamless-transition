import { Project } from '@/app/data';
import { AVAILABILITIES_OPTIONS, AVAILABILITIES_VALUE } from '../constants';

interface ProjectHeroProps {
    project: Project;
    tags: { label: string; value: keyof typeof AVAILABILITIES_VALUE; }[];
    metadata: { label: string; value: string | number; }[];
}
export const ProjectHero = ({ project, tags, metadata }: ProjectHeroProps) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 px-4 sm:px-8">
        <div className="col-start-1 col-end-13 md:col-start-2 md:col-end-12">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-8 md:gap-16">
                <div className="col-span-1 md:col-span-5" data-title>
                    <h1 id="project-title" className="text-4xl sm:text-6xl lg:text-7xl font-light text-white-400 leading-tight text-balance">
                        {project.name}
                    </h1>
                </div>

                <div className="col-span-1 md:col-span-5 space-y-8 mt-6 md:mt-0">
                    <div data-description>
                        <p className="text-base md:text-sm text-white/70 leading-relaxed">{project.description}</p>
                    </div>

                    <div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20"
                                    data-tag-item={tag.value}
                                >
                                    <span style={{ opacity: tag.value === AVAILABILITIES_OPTIONS.AVAILABLE ? 1 : 0.6 }}>
                                        {tag.label.toUpperCase()}: {AVAILABILITIES_VALUE[tag.value]}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8">
                        {metadata.map((meta) => (
                            <div key={meta.label} data-metadata-item>
                                <div
                                    // data-metadata-item={meta.label}
                                    className="text-xs text-white-400 mb-2 uppercase tracking-wider">
                                    {meta.label}
                                </div>
                                <div
                                    // data-metadata-item={String(meta.value ?? '')}
                                    className="text-sm text-white">
                                    {meta.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
