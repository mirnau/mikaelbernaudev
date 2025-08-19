   export type ProjectDetailLoader = () => Promise<{ default: any }>;

   export type Project = {
      slug: string;
      title: string;
      image: string;
      href?: string;
      description?: string;
      tags?: string[];
      detail?: ProjectDetailLoader; // lazy-loaded Svelte component
      detailProps?: Record<string, unknown>; // optional props for the detail component
      html?: string; // optional trusted raw HTML (author-controlled)
   };