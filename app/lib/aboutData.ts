import type { AboutConfig, CmsPageSection } from "../services/cmsService";

const getApiBase = () =>
  (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://cozy-oven-bakery-backend.onrender.com"
      : "http://localhost:5000")
  ).replace(/\/$/, "");

export async function fetchAboutCms(): Promise<AboutConfig | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/cms/about`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

/** Client-safe fallback mirroring backend defaultAboutSections. */
export const fallbackAboutSections = (): CmsPageSection[] => [
  {
    id: "about-intro",
    type: "textIntro",
    enabled: true,
    sortOrder: 0,
    content: {
      headline: "We're so glad you're here.",
      body:
        "Cozy Oven is built by a small but passionate team—warm, creative, and committed to giving you fresh, comforting baked goodness that truly makes your day better.\n\nEvery loaf, every mini, every moment with Cozy Oven is crafted with one goal in mind: to bring comfort, joy, and quality you can taste.",
    },
  },
  {
    id: "about-started",
    type: "storySplit",
    enabled: true,
    sortOrder: 1,
    content: {
      headline: "How It Started",
      imagePosition: "left",
      imageUrl:
        "https://res.cloudinary.com/daljxj4yl/image/upload/v1783602095/ChatGPT_Image_Jul_9_2026_12_57_32_PM_ajo0cz.png",
      body:
        "Cozy Oven was born in a season that tested everything.\n\nDuring a time of change and uncertainty, when life felt overwhelming and plans seemed to fall apart, I found myself leaning deeper into prayer and quieting my heart to hear God's direction.\n\nIn that stillness, the idea of Cozy Oven came to life—simple, comforting, nourishing banana bread that warms homes and hearts. It didn't feel forced; it felt like purpose. Like something I was being gently guided into.\n\nWhat started as a small home baking project soon became a way to bring joy, convenience and comfort to families, students, parents, and dessert lovers across Ghana.",
    },
  },
  {
    id: "about-comfort",
    type: "featureGrid",
    enabled: true,
    sortOrder: 2,
    content: {
      headline: "Because comfort is powerful.",
      body: "Every loaf is a small piece of comfort—fresh, wholesome, and thoughtfully made.",
      items: [
        "Warmth after a long day",
        "A sweet treat that lifts your mood",
        "Something familiar, trustworthy, and made with love",
        "A reminder that God knows how to use simple things to bless others",
      ],
    },
  },
  {
    id: "about-vision",
    type: "storySplit",
    enabled: true,
    sortOrder: 3,
    content: {
      headline: "The Vision",
      imagePosition: "right",
      imageUrl:
        "https://res.cloudinary.com/daljxj4yl/image/upload/v1783602096/ChatGPT_Image_Jul_9_2026_12_55_18_PM_sqhhpo.png",
      body:
        "Our mission is simple:\n\nTo bring comfort, ease, and joy to your everyday moments through high-quality, delicious banana bread.\n\nWhether you're hosting guests, treating your family, sending a gift, or grabbing a snack on the go, Cozy Oven is here to make life a little easier and a lot sweeter.",
    },
  },
  {
    id: "about-values",
    type: "valuesRow",
    enabled: true,
    sortOrder: 4,
    content: {
      items: [
        "Excellence",
        "Simplicity",
        "Thoughtfulness",
        "God-led creativity",
        "Serving our customers with joy",
      ],
    },
  },
  {
    id: "about-closing",
    type: "closingCta",
    enabled: true,
    sortOrder: 5,
    content: {
      headline: "From the Baker",
      body:
        "Thank you for being here.\n\nThank you for choosing Cozy Oven.\n\nAnd thank you for letting our little bakery become a part of your home and your story.\n\nMay every loaf remind you of God's love, His provision, and His ability to use even the simplest ingredients to create something beautiful.",
      ctaLabel: "Anita",
      secondaryCtaLabel: "Creator of Cozy Oven",
    },
  },
];
