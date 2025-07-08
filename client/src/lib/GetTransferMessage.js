import { fetchTransfers } from "@/services/transfers";

// Cache for transfer data to avoid multiple API calls
let transferDataCache = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches transfer data from MongoDB with caching
 * @returns {Promise<Array>} - Array of transfer objects
 */
async function getTransferData() {
  const now = Date.now();

  // Return cached data if still valid
  if (transferDataCache && now < cacheExpiry) {
    return transferDataCache;
  }

  try {
    const transfers = await fetchTransfers();
    transferDataCache = transfers;
    cacheExpiry = now + CACHE_DURATION;
    return transfers;
  } catch (error) {
    console.error("Error fetching transfer data:", error);
    // Return empty array on error to prevent breaking the app
    return [];
  }
}

/**
 * Checks if a transfer is needed between two bus stops in a route and returns the transfer message if found.
 * @param {string[]} routeStops - Array of bus stop names in the route.
 * @returns {Promise<string|null>} - Transfer message if a transfer is found, otherwise null.
 */
export async function GetTransferMessage(routeStops) {
  try {
    const transferData = await getTransferData();

    for (const transfer of transferData) {
      const fromIdx = routeStops.indexOf(transfer.transfer1);
      const toIdx = routeStops.indexOf(transfer.transfer2);
      if (fromIdx !== -1 && toIdx !== -1 && Math.abs(toIdx - fromIdx) === 1) {
        return `Transfer from ${transfer.transfer1} to ${transfer.transfer2}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error in GetTransferMessage:", error);
    return null;
  }
}

/**
 * Synchronous version that falls back to cached data or returns null
 * @param {string[]} routeStops - Array of bus stop names in the route.
 * @returns {string|null} - Transfer message if a transfer is found, otherwise null.
 */
export function GetTransferMessageSync(routeStops) {
  // Use cached data if available
  if (!transferDataCache) {
    return null;
  }

  for (const transfer of transferDataCache) {
    const fromIdx = routeStops.indexOf(transfer.transfer1);
    const toIdx = routeStops.indexOf(transfer.transfer2);
    if (fromIdx !== -1 && toIdx !== -1 && Math.abs(toIdx - fromIdx) === 1) {
      return `Transfer from ${transfer.transfer1} to ${transfer.transfer2}`;
    }
  }
  return null;
}
