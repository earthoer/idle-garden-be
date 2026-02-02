/**
 * Image Asset Helpers
 * 
 * Helper functions for constructing image URLs from GitHub
 * 
 * GitHub Repository: https://github.com/earthoer/image-deposit
 */

// Base URL for all images
export const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/earthoer/image-deposit/main';

/**
 * Get seed icon image URL (fully grown stage 4)
 * 
 * @param seedCode - Seed code (e.g., 'bean_sprout', 'lettuce')
 * @returns Full image URL for seed icon (_04.png)
 * 
 * @example
 * getSeedIcon('bean_sprout')
 * // → https://raw.githubusercontent.com/.../seeds/bean_sprout/bean_sprout_04.png
 */
export function getSeedIcon(seedCode: string): string {
  return getSeedStageImage(seedCode, 4);
}

/**
 * Get seed growth stage image URL
 * 
 * @param seedCode - Seed code (e.g., 'bean_sprout', 'lettuce')
 * @param stage - Growth stage (1-4)
 * @returns Full image URL
 * 
 * @example
 * getSeedStageImage('bean_sprout', 1)
 * // → https://raw.githubusercontent.com/.../seeds/bean_sprout/bean_sprout_01.png
 */
export function getSeedStageImage(seedCode: string, stage: number): string {
  if (stage < 1 || stage > 4) {
    throw new Error('Stage must be between 1 and 4');
  }
  return `${IMAGE_BASE_URL}/seeds/${seedCode}/${seedCode}_0${stage}.png`;
}

/**
 * Get location background image URL
 * 
 * @param locationCode - Location code (e.g., 'waste_land')
 * @returns Full image URL for background
 * 
 * @example
 * getLocationMap('waste_land')
 * // → https://raw.githubusercontent.com/.../locations/waste_land/map.png
 */
export function getLocationMap(locationCode: string): string {
  return `${IMAGE_BASE_URL}/locations/${locationCode}/map.png`;
}

/**
 * Get location pot/planter image URL
 * 
 * @param locationCode - Location code (e.g., 'waste_land')
 * @returns Full image URL for pot
 * 
 * @example
 * getLocationPot('waste_land')
 * // → https://raw.githubusercontent.com/.../locations/waste_land/pot_01.png
 */
export function getLocationPot(locationCode: string): string {
  return `${IMAGE_BASE_URL}/locations/${locationCode}/pot_01.png`;
}

/**
 * Get default dirt plant image URL
 * 
 * Used when slot is empty or just planted
 * 
 * @returns Full image URL for dirt plant
 * 
 * @example
 * getDirtPlantImage()
 * // → https://raw.githubusercontent.com/.../dirt_plant.png
 */
export function getDirtPlantImage(): string {
  return `${IMAGE_BASE_URL}/dirt_plant.png`;
}

/**
 * Calculate current growth stage based on time progress
 * 
 * @param startTime - When tree was planted (Date or timestamp)
 * @param endTime - When tree will be ready (Date or timestamp)
 * @returns Current stage (1-4)
 * 
 * @example
 * calculateGrowthStage(plantedTree.startTime, plantedTree.endTime)
 * // → 2 (if 40% complete)
 */
export function calculateGrowthStage(
  startTime: Date | number,
  endTime: Date | number
): number {
  const now = Date.now();
  const start = typeof startTime === 'number' ? startTime : startTime.getTime();
  const end = typeof endTime === 'number' ? endTime : endTime.getTime();
  
  const totalTime = end - start;
  const elapsed = Math.max(0, now - start);
  const progress = Math.min(elapsed / totalTime, 1);
  
  // 4 stages based on progress percentage
  if (progress < 0.25) return 1; // 0-25%
  if (progress < 0.50) return 2; // 25-50%
  if (progress < 0.75) return 3; // 50-75%
  return 4; // 75-100%
}

/**
 * Get current seed image URL based on time progress
 * 
 * Combines stage calculation with image URL generation
 * 
 * @param seedCode - Seed code
 * @param startTime - When tree was planted
 * @param endTime - When tree will be ready
 * @returns Full image URL for current stage
 * 
 * @example
 * getCurrentSeedImage('bean_sprout', plantedTree.startTime, plantedTree.endTime)
 * // → https://raw.githubusercontent.com/.../bean_sprout_02.png (based on time)
 */
export function getCurrentSeedImage(
  seedCode: string,
  startTime: Date | number,
  endTime: Date | number
): string {
  const stage = calculateGrowthStage(startTime, endTime);
  return getSeedStageImage(seedCode, stage);
}

/**
 * Preload image URLs for faster loading
 * 
 * @param urls - Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 * 
 * @example
 * // Preload all stages of a seed
 * const urls = [1, 2, 3, 4].map(stage => getSeedStageImage('bean_sprout', stage));
 * await preloadImages(urls);
 */
export async function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        })
    )
  );
}

/**
 * Get all stage URLs for a seed (for preloading)
 * 
 * @param seedCode - Seed code
 * @returns Array of 4 image URLs (all stages)
 * 
 * @example
 * getAllSeedStages('bean_sprout')
 * // → [...bean_sprout_01.png, ...02, ...03, ...04]
 */
export function getAllSeedStages(seedCode: string): string[] {
  return [1, 2, 3, 4].map((stage) => getSeedStageImage(seedCode, stage));
}

/**
 * Get all location images (for preloading)
 * 
 * @param locationCode - Location code
 * @returns Object with map and pot URLs
 * 
 * @example
 * getLocationImages('waste_land')
 * // → { map: '...map.png', pot: '...pot_01.png' }
 */
export function getLocationImages(locationCode: string): {
  map: string;
  pot: string;
} {
  return {
    map: getLocationMap(locationCode),
    pot: getLocationPot(locationCode),
  };
}

// Export all functions as a single object
export const ImageAssets = {
  baseUrl: IMAGE_BASE_URL,
  seed: {
    icon: getSeedIcon,
    stage: getSeedStageImage,
    current: getCurrentSeedImage,
    allStages: getAllSeedStages,
  },
  location: {
    map: getLocationMap,
    pot: getLocationPot,
    all: getLocationImages,
  },
  dirtPlant: getDirtPlantImage,
  utils: {
    calculateStage: calculateGrowthStage,
    preload: preloadImages,
  },
};

// Default export
export default ImageAssets;
