import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.thepixelvest.com.ng",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: "https://thepixelvest.com.ng",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
  ];
}