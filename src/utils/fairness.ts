/**
 * Picks a winner from a pool of entries using cryptographically secure random numbers.
 * This ensures "pure fair" results that aren't subject to Math.random() distribution issues.
 */
export const pickSecureWinner = <T>(entries: T[]): T | null => {
  if (entries.length === 0) return null;
  
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  
  // Use the random 32-bit integer to pick an index
  // This is more uniform than Math.random() * length
  const index = array[0] % entries.length;
  return entries[index];
};

/**
 * Shuffles an array using the Fisher-Yates algorithm with crypto-secure randomness.
 */
export const shuffleEntries = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    const j = randomArray[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};