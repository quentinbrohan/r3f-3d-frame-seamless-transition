import { ProjectCategories } from "@/app/data";

export const AVAILABILITIES_OPTIONS = {
  AVAILABLE: "AVAILABLE",
  NOT_AVAILABLE: "NOT_AVAILABLE",
  SOLD: "SOLD",
} as const;

export const AVAILABILITIES_VALUE: Record<
  keyof typeof AVAILABILITIES_OPTIONS,
  string
> = {
  AVAILABLE: "Available",
  NOT_AVAILABLE: "Not available",
  SOLD: "Sold out",
} as const;

export const PROJECT_CATEGORY_LABEL: Record<ProjectCategories, string> = {
  PHYSICAL_ART: "Physical Art",
};
