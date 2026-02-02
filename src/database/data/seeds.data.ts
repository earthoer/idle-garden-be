export const seedsData = [
  {
    code: 'bean_sprout',
    name: 'Bean Sprout',
    basePrice: 0,
    baseSellPrice: 100,
    baseGrowTime: 300, // 5 minutes
    unlockRequirement: {
      type: 'default',
      value: 0,
    },
    icon: '/seeds/bean_sprout/bean_sprout_04.png',
    description: 'A simple starter plant. Free to plant!',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'radish',
    name: 'Radish',
    basePrice: 300,
    baseSellPrice: 550,
    baseGrowTime: 480, // 8 minutes
    unlockRequirement: {
      type: 'gold',
      value: 300,
    },
    icon: '/seeds/radish/radish_04.png',
    description: 'Quick-growing root vegetable.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'lettuce',
    name: 'Lettuce',
    basePrice: 500,
    baseSellPrice: 850,
    baseGrowTime: 600, // 10 minutes
    unlockRequirement: {
      type: 'gold',
      value: 500,
    },
    icon: '/seeds/lettuce/lettuce_04.png',
    description: 'Fresh lettuce that grows quickly.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'spinach',
    name: 'Spinach',
    basePrice: 800,
    baseSellPrice: 1400,
    baseGrowTime: 900, // 15 minutes
    unlockRequirement: {
      type: 'gold',
      value: 800,
    },
    icon: '/seeds/spinach/spinach_04.png',
    description: 'Healthy leafy greens.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'carrot',
    name: 'Carrot',
    basePrice: 1500,
    baseSellPrice: 2700,
    baseGrowTime: 1200, // 20 minutes
    unlockRequirement: {
      type: 'gold',
      value: 1500,
    },
    icon: '/seeds/carrot/carrot_04.png',
    description: 'Crunchy orange root vegetable.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
];

// Note: Growth stage images follow pattern:
// /seeds/{code}/{code}_01.png through _04.png
// Icon uses _04.png (fully grown)
// Frontend should construct full URLs with GitHub base
