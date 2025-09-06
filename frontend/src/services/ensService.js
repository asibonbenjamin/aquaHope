import { ethers } from 'ethers';

/**
 * ENS Service for resolving Ethereum addresses to names
 * Handles both forward resolution (address -> name) and reverse resolution (name -> address)
 */
class ENSService {
  constructor() {
    this.provider = null;
    this.ensContract = null;
    this.reverseResolver = null;
    this.cache = new Map(); // Cache resolved names to avoid repeated calls
    this.initialized = false;
  }

  /**
   * Initialize ENS service with provider
   * @param {ethers.Provider} provider - Ethers provider instance
   */
  async initialize(provider) {
    try {
      this.provider = provider;
      
      // ENS Registry contract address (same on all networks)
      const ensRegistryAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
      
      // ENS Registry ABI (minimal for name resolution)
      const ensRegistryABI = [
        'function resolver(bytes32 node) external view returns (address)',
        'function owner(bytes32 node) external view returns (address)'
      ];
      
      // Public Resolver ABI
      const publicResolverABI = [
        'function name(bytes32 node) external view returns (string)',
        'function addr(bytes32 node) external view returns (address)',
        'function text(bytes32 node, string key) external view returns (string)'
      ];
      
      this.ensContract = new ethers.Contract(ensRegistryAddress, ensRegistryABI, provider);
      this.initialized = true;
      
      console.log('✅ ENS Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ENS service:', error);
      this.initialized = false;
    }
  }

  /**
   * Get ENS name from Ethereum address (reverse resolution)
   * @param {string} address - Ethereum address
   * @returns {Promise<string|null>} - ENS name or null if not found
   */
  async getEnsName(address) {
    if (!address) return null;

    // Check for custom ENS name first (highest priority)
    const customEnsName = this.getCustomEnsName(address);
    if (customEnsName) {
      return customEnsName;
    }

    if (!this.initialized) {
      console.warn('ENS service not initialized');
      return null;
    }

    // Check cache first
    if (this.cache.has(address)) {
      return this.cache.get(address);
    }

    try {
      // Convert address to reverse lookup format
      const reverseName = `${address.slice(2).toLowerCase()}.addr.reverse`;
      const nameHash = ethers.namehash(reverseName);
      
      // Get resolver for reverse lookup
      const resolverAddress = await this.ensContract.resolver(nameHash);
      
      if (resolverAddress === ethers.ZeroAddress) {
        this.cache.set(address, null);
        return null;
      }

      // Get the actual name from resolver
      const resolver = new ethers.Contract(resolverAddress, [
        'function name(bytes32 node) external view returns (string)'
      ], this.provider);
      
      const ensName = await resolver.name(nameHash);
      
      if (ensName && ensName.length > 0) {
        this.cache.set(address, ensName);
        return ensName;
      }
      
      this.cache.set(address, null);
      return null;
    } catch (error) {
      console.error(`Failed to resolve ENS name for ${address}:`, error);
      this.cache.set(address, null);
      return null;
    }
  }

  /**
   * Get custom ENS name from localStorage
   * @param {string} address - Ethereum address
   * @returns {string|null} - Custom ENS name or null
   */
  getCustomEnsName(address) {
    if (typeof window === 'undefined' || !address) return null;
    
    try {
      const customName = localStorage.getItem(`ens_name_${address.toLowerCase()}`);
      return customName || null;
    } catch (error) {
      console.warn('Failed to get custom ENS name:', error);
      return null;
    }
  }

  /**
   * Set custom ENS name in localStorage
   * @param {string} address - Ethereum address
   * @param {string} ensName - ENS name to set
   */
  setCustomEnsName(address, ensName) {
    if (typeof window === 'undefined' || !address) return;
    
    try {
      if (ensName) {
        localStorage.setItem(`ens_name_${address.toLowerCase()}`, ensName);
      } else {
        localStorage.removeItem(`ens_name_${address.toLowerCase()}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete(address);
    } catch (error) {
      console.warn('Failed to set custom ENS name:', error);
    }
  }

  /**
   * Get Ethereum address from ENS name (forward resolution)
   * @param {string} ensName - ENS name (e.g., "vitalik.eth")
   * @returns {Promise<string|null>} - Ethereum address or null if not found
   */
  async getAddress(ensName) {
    if (!this.initialized) {
      console.warn('ENS service not initialized');
      return null;
    }

    try {
      // Normalize ENS name
      const normalizedName = ensName.toLowerCase().endsWith('.eth') ? ensName : `${ensName}.eth`;
      const nameHash = ethers.namehash(normalizedName);
      
      // Get resolver for the name
      const resolverAddress = await this.ensContract.resolver(nameHash);
      
      if (resolverAddress === ethers.ZeroAddress) {
        return null;
      }

      // Get the address from resolver
      const resolver = new ethers.Contract(resolverAddress, [
        'function addr(bytes32 node) external view returns (address)'
      ], this.provider);
      
      const address = await resolver.addr(nameHash);
      
      if (address && address !== ethers.ZeroAddress) {
        return address;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to resolve address for ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Format address with ENS name if available
   * @param {string} address - Ethereum address
   * @param {number} truncateLength - Length to truncate address if no ENS name
   * @returns {Promise<string>} - Formatted address with ENS name
   */
  async formatAddress(address, truncateLength = 6) {
    if (!address) return 'Unknown';
    
    try {
      const ensName = await this.getEnsName(address);
      
      if (ensName) {
        return ensName;
      }
    } catch (error) {
      console.warn('ENS resolution failed, using truncated address:', error);
    }
    
    // Fallback to truncated address
    return `${address.slice(0, truncateLength)}...${address.slice(-4)}`;
  }

  /**
   * Get avatar URL for ENS name
   * @param {string} ensName - ENS name
   * @returns {Promise<string|null>} - Avatar URL or null
   */
  async getAvatar(ensName) {
    if (!this.initialized) {
      return null;
    }

    try {
      const normalizedName = ensName.toLowerCase().endsWith('.eth') ? ensName : `${ensName}.eth`;
      const nameHash = ethers.namehash(normalizedName);
      
      const resolverAddress = await this.ensContract.resolver(nameHash);
      
      if (resolverAddress === ethers.ZeroAddress) {
        return null;
      }

      const resolver = new ethers.Contract(resolverAddress, [
        'function text(bytes32 node, string key) external view returns (string)'
      ], this.provider);
      
      // Try to get avatar from text record
      const avatar = await resolver.text(nameHash, 'avatar');
      
      if (avatar && avatar.length > 0) {
        return avatar;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get avatar for ${ensName}:`, error);
      return null;
    }
  }

  /**
   * Get multiple ENS names for an array of addresses
   * @param {string[]} addresses - Array of Ethereum addresses
   * @returns {Promise<Object>} - Object mapping addresses to ENS names
   */
  async getMultipleEnsNames(addresses) {
    const results = {};
    
    // Process in parallel for better performance
    const promises = addresses.map(async (address) => {
      const ensName = await this.getEnsName(address);
      results[address] = ensName;
    });
    
    await Promise.all(promises);
    return results;
  }

  /**
   * Check if a string is a valid ENS name
   * @param {string} name - String to check
   * @returns {boolean} - True if valid ENS name
   */
  isValidEnsName(name) {
    if (!name || typeof name !== 'string') return false;
    
    // Basic ENS name validation
    const ensRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.eth$/i;
    return ensRegex.test(name);
  }

  /**
   * Check if a string is a valid Ethereum address
   * @param {string} address - String to check
   * @returns {boolean} - True if valid address
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Clear the ENS cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries())
    };
  }
}

// Create singleton instance
const ensService = new ENSService();

export default ensService;
