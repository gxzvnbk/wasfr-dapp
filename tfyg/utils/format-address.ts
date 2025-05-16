/**
 * Formats an Ethereum address for display by shortening it
 * @param address The full Ethereum address
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Formatted address string
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return ""

  // Ensure the address is valid
  if (!address.startsWith("0x") || address.length < 10) {
    return address
  }

  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`
}
