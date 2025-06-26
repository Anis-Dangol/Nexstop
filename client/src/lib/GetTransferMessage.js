import transferData from "@/assets/transfer.json";

/**
 * Checks if a transfer is needed between two bus stops in a route and returns the transfer message if found.
 * @param {string[]} routeStops - Array of bus stop names in the route.
 * @returns {string|null} - Transfer message if a transfer is found, otherwise null.
 */
export function GetTransferMessage(routeStops) {
  for (const transfer of transferData) {
    const fromIdx = routeStops.indexOf(transfer.Transfer1);
    const toIdx = routeStops.indexOf(transfer.Transfer2);
    if (fromIdx !== -1 && toIdx !== -1 && Math.abs(toIdx - fromIdx) === 1) {
      return `Transfer from ${transfer.Transfer1} to ${transfer.Transfer2}`;
    }
  }
  return null;
}
