import { Ionicons } from '@expo/vector-icons';

/** Map a category name to a relevant Ionicon, with a neutral fallback. */
const CATEGORY_ICONS: { match: RegExp; icon: keyof typeof Ionicons.glyphMap }[] =
  [
    { match: /food|grocer|snack|namkeen|biscuit/i, icon: 'fast-food-outline' },
    { match: /drink|beverage|juice|water|tea|coffee/i, icon: 'cafe-outline' },
    { match: /clean|deterg|soap|wash|home care/i, icon: 'sparkles-outline' },
    { match: /health|medic|pharma|care|hygiene/i, icon: 'medkit-outline' },
    { match: /beauty|cosmet|skin|hair/i, icon: 'color-palette-outline' },
    { match: /electro|device|gadget|appliance/i, icon: 'hardware-chip-outline' },
    { match: /cloth|apparel|wear|garment/i, icon: 'shirt-outline' },
    { match: /station|paper|book|office/i, icon: 'book-outline' },
    { match: /dairy|milk/i, icon: 'nutrition-outline' },
    { match: /baby|kid|toy/i, icon: 'happy-outline' },
  ];

export function iconForCategory(name: string): keyof typeof Ionicons.glyphMap {
  return (
    CATEGORY_ICONS.find((c) => c.match.test(name))?.icon ?? 'pricetags-outline'
  );
}
