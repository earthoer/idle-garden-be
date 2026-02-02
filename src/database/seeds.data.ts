export const seedsData = [
  {
    code: 'tree_a',
    name: 'Tree A',
    basePrice: 100,
    baseSellPrice: 120,
    baseGrowTime: 600, // 10 minutes
    unlockRequirement: {
      type: 'default',
      value: 0,
    },
    icon: '🌱',
    description: 'A simple starter tree. Quick to grow and easy to maintain.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'tree_b',
    name: 'Tree B',
    basePrice: 500,
    baseSellPrice: 650,
    baseGrowTime: 1800, // 30 minutes
    unlockRequirement: {
      type: 'gold',
      value: 500,
    },
    icon: '🌳',
    description: 'A sturdy oak tree that grows steadily.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'tree_c',
    name: 'Tree C',
    basePrice: 2000,
    baseSellPrice: 2800,
    baseGrowTime: 3600, // 1 hour
    unlockRequirement: {
      type: 'gold',
      value: 2000,
    },
    icon: '🌲',
    description: 'A tall pine tree with valuable wood.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'palm_tree',
    name: 'Palm Tree',
    basePrice: 10000,
    baseSellPrice: 15000,
    baseGrowTime: 10800, // 3 hours
    unlockRequirement: {
      type: 'trees_sold',
      value: 10,
    },
    icon: '🌴',
    description: 'An exotic palm tree from tropical regions.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'cherry_tree',
    name: 'Cherry Blossom',
    basePrice: 50000,
    baseSellPrice: 80000,
    baseGrowTime: 21600, // 6 hours
    unlockRequirement: {
      type: 'trees_sold',
      value: 25,
    },
    icon: '🌸',
    description: 'Beautiful cherry blossoms that attract visitors.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'pine_tree',
    name: 'Pine Tree',
    basePrice: 200000,
    baseSellPrice: 350000,
    baseGrowTime: 43200, // 12 hours
    unlockRequirement: {
      type: 'trees_sold',
      value: 50,
    },
    icon: '🎄',
    description: 'A majestic evergreen pine tree.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'maple_tree',
    name: 'Maple Tree',
    basePrice: 500000,
    baseSellPrice: 900000,
    baseGrowTime: 64800, // 18 hours
    unlockRequirement: {
      type: 'trees_sold',
      value: 75,
    },
    icon: '🍁',
    description: 'A beautiful maple with stunning autumn colors.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'willow_tree',
    name: 'Willow Tree',
    basePrice: 1000000,
    baseSellPrice: 1800000,
    baseGrowTime: 86400, // 24 hours
    unlockRequirement: {
      type: 'trees_sold',
      value: 100,
    },
    icon: '🌿',
    description: 'A graceful weeping willow.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'sakura_tree',
    name: 'Sakura Tree',
    basePrice: 2000000,
    baseSellPrice: 3500000,
    baseGrowTime: 108000, // 30 hours
    unlockRequirement: {
      type: 'trees_sold',
      value: 150,
    },
    icon: '🌺',
    description: 'A legendary sakura with mystical properties.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
  {
    code: 'world_tree',
    name: 'World Tree',
    basePrice: 5000000,
    baseSellPrice: 10000000,
    baseGrowTime: 172800, // 48 hours
    unlockRequirement: {
      type: 'trees_sold',
      value: 200,
    },
    icon: '🌳',
    description: 'The legendary World Tree that connects all realms.',
    isEvent: false,
    eventStart: null,
    eventEnd: null,
  },
];
