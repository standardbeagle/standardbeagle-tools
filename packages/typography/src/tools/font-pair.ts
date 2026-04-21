import type { FontPairInput, FontPairOutput } from './font-pair.schema.js';

interface Pairing {
  primary: string;
  secondary: string;
  fallback: string;
  moods: Array<'modern' | 'classic' | 'playful' | 'serious' | 'minimal'>;
  categories: Array<'serif' | 'sans-serif' | 'display' | 'monospace'>;
}

const pairings: Pairing[] = [
  {
    primary: 'Inter',
    secondary: 'Merriweather',
    fallback: 'system-ui, Georgia, serif',
    moods: ['modern', 'minimal', 'serious'],
    categories: ['sans-serif', 'serif'],
  },
  {
    primary: 'Playfair Display',
    secondary: 'Source Sans Pro',
    fallback: 'Georgia, Arial, sans-serif',
    moods: ['classic', 'serious'],
    categories: ['serif', 'sans-serif'],
  },
  {
    primary: 'Roboto',
    secondary: 'Roboto Slab',
    fallback: 'Arial, Helvetica, sans-serif',
    moods: ['modern', 'serious', 'minimal'],
    categories: ['sans-serif', 'serif'],
  },
  {
    primary: 'Montserrat',
    secondary: 'Open Sans',
    fallback: 'system-ui, Arial, sans-serif',
    moods: ['modern', 'minimal'],
    categories: ['sans-serif'],
  },
  {
    primary: 'Lora',
    secondary: 'Ubuntu',
    fallback: 'Georgia, system-ui, sans-serif',
    moods: ['classic', 'modern'],
    categories: ['serif', 'sans-serif'],
  },
  {
    primary: 'Oswald',
    secondary: 'Quattrocento Sans',
    fallback: 'Impact, Arial, sans-serif',
    moods: ['modern', 'serious'],
    categories: ['sans-serif', 'display'],
  },
  {
    primary: 'Raleway',
    secondary: 'Lato',
    fallback: 'system-ui, Arial, sans-serif',
    moods: ['modern', 'minimal'],
    categories: ['sans-serif'],
  },
  {
    primary: 'Merriweather',
    secondary: 'Open Sans',
    fallback: 'Georgia, Arial, sans-serif',
    moods: ['classic', 'serious'],
    categories: ['serif', 'sans-serif'],
  },
  {
    primary: 'Poppins',
    secondary: 'Libre Baskerville',
    fallback: 'system-ui, Georgia, serif',
    moods: ['playful', 'modern'],
    categories: ['sans-serif', 'serif'],
  },
  {
    primary: 'Bebas Neue',
    secondary: 'Montserrat',
    fallback: 'Impact, system-ui, sans-serif',
    moods: ['modern', 'playful'],
    categories: ['display', 'sans-serif'],
  },
  {
    primary: 'Crimson Text',
    secondary: 'Work Sans',
    fallback: 'Georgia, Arial, sans-serif',
    moods: ['classic', 'serious'],
    categories: ['serif', 'sans-serif'],
  },
  {
    primary: 'Space Grotesk',
    secondary: 'Inter',
    fallback: 'system-ui, Arial, sans-serif',
    moods: ['modern', 'minimal'],
    categories: ['sans-serif'],
  },
  {
    primary: 'Abril Fatface',
    secondary: 'Lato',
    fallback: 'Georgia, Arial, sans-serif',
    moods: ['classic', 'playful'],
    categories: ['display', 'sans-serif'],
  },
  {
    primary: 'Fira Sans',
    secondary: 'Fira Code',
    fallback: 'system-ui, monospace',
    moods: ['modern', 'serious', 'minimal'],
    categories: ['sans-serif', 'monospace'],
  },
  {
    primary: 'Nunito',
    secondary: 'PT Sans',
    fallback: 'system-ui, Arial, sans-serif',
    moods: ['playful', 'modern'],
    categories: ['sans-serif'],
  },
  {
    primary: 'Libre Franklin',
    secondary: 'Libre Baskerville',
    fallback: 'Arial, Georgia, serif',
    moods: ['classic', 'modern', 'serious'],
    categories: ['sans-serif', 'serif'],
  },
  {
    primary: 'DM Sans',
    secondary: 'DM Serif Display',
    fallback: 'system-ui, Georgia, serif',
    moods: ['modern', 'classic'],
    categories: ['sans-serif', 'serif'],
  },
  {
    primary: 'Josefin Sans',
    secondary: 'Cardo',
    fallback: 'system-ui, Georgia, serif',
    moods: ['modern', 'classic', 'minimal'],
    categories: ['sans-serif', 'serif'],
  },
  {
    primary: 'IBM Plex Sans',
    secondary: 'IBM Plex Serif',
    fallback: 'system-ui, Georgia, serif',
    moods: ['modern', 'serious', 'minimal'],
    categories: ['sans-serif', 'serif'],
  },
  {
    primary: 'Source Serif Pro',
    secondary: 'Source Sans Pro',
    fallback: 'Georgia, Arial, sans-serif',
    moods: ['classic', 'serious'],
    categories: ['serif', 'sans-serif'],
  },
];

export function fontPair(input: FontPairInput): FontPairOutput {
  const normalizedPrimary = input.primary.trim().toLowerCase();

  // Exact match by primary name
  let match = pairings.find((p) => p.primary.toLowerCase() === normalizedPrimary);

  if (!match) {
    // Fuzzy match by mood and category
    const mood = input.mood;
    const category = input.category;

    const candidates = pairings.filter((p) => {
      const moodMatch = !mood || p.moods.includes(mood);
      const categoryMatch = !category || p.categories.includes(category);
      return moodMatch && categoryMatch;
    });

    match = candidates[0] ?? pairings[0]!;
  }

  return {
    primary: match.primary,
    secondary: match.secondary,
    fallback: match.fallback,
  };
}
