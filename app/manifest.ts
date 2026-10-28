import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Трекер вредных привычек",
    short_name: "Трекер",
    description:
      "Следи за сериями без срывов и избавляйся от вредных привычек.",
    lang: "ru",
    start_url: "/progress",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0F1A",
    theme_color: "#0B0F1A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
