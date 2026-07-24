export interface CaseItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  cover_image: string | null;
  images: string[];
  project_url: string | null;
  tags: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CaseInput = Omit<
  CaseItem,
  "id" | "created_at" | "updated_at"
>;
