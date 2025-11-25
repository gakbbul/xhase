export interface Site {
  id: string;
  url: string;
  title: string;
  name: string; // Extracted hostname
  description: string;
  createdAt: number;
}

export interface SiteFormData {
  url: string;
  title: string;
  description: string;
}
