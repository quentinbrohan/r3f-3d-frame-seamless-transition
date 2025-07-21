export const PROJECT_CATEGORY = {
  PHYSICAL_ART: "Physical Art",
} as const;

export type ProjectCategories = keyof typeof PROJECT_CATEGORY;

export interface Project {
  id: string;
  name: string;
  images: string[];
  description: string;
  category: ProjectCategories;
  theme: string;
  //   year: string;
  startDate: string;
  endDate?: string;
  dimensions: {
    height: number;
    width: number;
    depth?: number;
  };
  // techniques
  materials: string[];
  isPrintAvailable?: boolean;
  isOriginalAvailable?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "frustation",
    name: "Frustation",
    description: "Frustrant et frustré.",
    category: "PHYSICAL_ART",
    theme: " Dark Art",
    images: [
      "/images/frustration.jpg",
      "/images/frustration-2.jpg",
      "/images/frustration-3.jpg",
      "/images/frustration-4.jpg",
    ],
    dimensions: {
      height: 28,
      width: 21,
    },
    startDate: "2024-01-01",
    endDate: "2024-01-01",
    materials: ["techniques mixtes sur papier"],
    isOriginalAvailable: true,
    isPrintAvailable: true,
  },
  {
    id: "man-apple-tree",
    name: "Man in apple tree threatens to fall out",
    description: `De Michiel Mosjin, après Adriaen Pieterzs. Van de Vienne,1640-1655. Inspiration et reprise d’image d’archives.`,
    category: "PHYSICAL_ART",
    theme: " Dark Art",
    images: [
      "/images/man-apple-tree.jpg",
      "/images/man-apple-tree-2.jpg",
      "/images/man-apple-tree-3.jpg",
      "/images/man-apple-tree-4.jpg",
    ],
    dimensions: {
      height: 29,
      width: 21,
    },
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    materials: ["techniques mixtes sur papier"],
    isOriginalAvailable: true,
    isPrintAvailable: true,
  },
  {
    id: "butterfly-queen",
    name: "Butterfly Queen",
    description: `...`,
    category: "PHYSICAL_ART",
    theme: " Dark Art",
    images: [
      "/images/butterfly-queen.jpg",
      "/images/butterfly-queen-2.jpg",
      "/images/butterfly-queen-3.jpg",
      "/images/butterfly-queen-4.jpg",
    ],
    dimensions: {
      height: 29,
      width: 21,
    },
    startDate: "2023-01-01",
    endDate: "2025-01-01",
    materials: ["techniques mixtes sur papier"],
    isOriginalAvailable: false,
    isPrintAvailable: true,
  },
];
