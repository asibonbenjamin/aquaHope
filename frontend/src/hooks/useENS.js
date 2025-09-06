import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../wallet/WalletContext';
import ensService from '../services/ensService';

/**
 * Custom hook for ENS functionality
 * Provides easy access to ENS name resolution and formatting
 */
export function useENS() {
  const { provider } = useWallet();
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize ENS service when provider is available
  useEffect(() => {
    if (provider && !isInitialized) {
      initializeENS();
    }
  }, [provider, isInitialized]);

  const initializeENS = async () => {
    try {
      setLoading(true);
      await ensService.initialize(provider);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize ENS:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get ENS name for an address
   */
  const getEnsName = useCallback(async (address) => {
    if (!isInitialized) return null;
    
    try {
      return await ensService.getEnsName(address);
    } catch (error) {
      console.error('Failed to get ENS name:', error);
      return null;
    }
  }, [isInitialized]);

  /**
   * Get address for an ENS name
   */
  const getAddress = useCallback(async (ensName) => {
    if (!isInitialized) return null;
    
    try {
      return await ensService.getAddress(ensName);
    } catch (error) {
      console.error('Failed to get address:', error);
      return null;
    }
  }, [isInitialized]);

  /**
   * Format address with ENS name
   */
  const formatAddress = useCallback(async (address, truncateLength = 6) => {
    if (!isInitialized) return address ? `${address.slice(0, truncateLength)}...${address.slice(-4)}` : 'Unknown';
    
    try {
      return await ensService.formatAddress(address, truncateLength);
    } catch (error) {
      console.error('Failed to format address:', error);
      return address ? `${address.slice(0, truncateLength)}...${address.slice(-4)}` : 'Unknown';
    }
  }, [isInitialized]);

  /**
   * Get avatar for ENS name
   */
  const getAvatar = useCallback(async (ensName) => {
    if (!isInitialized) return null;
    
    try {
      return await ensService.getAvatar(ensName);
    } catch (error) {
      console.error('Failed to get avatar:', error);
      return null;
    }
  }, [isInitialized]);

  /**
   * Get multiple ENS names
   */
  const getMultipleEnsNames = useCallback(async (addresses) => {
    if (!isInitialized) return {};
    
    try {
      return await ensService.getMultipleEnsNames(addresses);
    } catch (error) {
      console.error('Failed to get multiple ENS names:', error);
      return {};
    }
  }, [isInitialized]);

  /**
   * Check if string is valid ENS name
   */
  const isValidEnsName = useCallback((name) => {
    return ensService.isValidEnsName(name);
  }, []);

  /**
   * Check if string is valid address
   */
  const isValidAddress = useCallback((address) => {
    return ensService.isValidAddress(address);
  }, []);

  /**
   * Clear ENS cache
   */
  const clearCache = useCallback(() => {
    ensService.clearCache();
  }, []);

  return {
    isInitialized,
    loading,
    getEnsName,
    getAddress,
    formatAddress,
    getAvatar,
    getMultipleEnsNames,
    isValidEnsName,
    isValidAddress,
    clearCache
  };
}

/**
 * Hook for formatting a single address with ENS
 * @param {string} address - Address to format
 * @param {number} truncateLength - Length to truncate if no ENS name
 * @returns {Object} - { formattedName, loading, error }
 */
export function useFormattedAddress(address, truncateLength = 6) {
  const { formatAddress, isInitialized, loading } = useENS();
  const [formattedName, setFormattedName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address || !isInitialized) {
      setFormattedName(address ? `${address.slice(0, truncateLength)}...${address.slice(-4)}` : '');
      return;
    }

    const resolveName = async () => {
      try {
        setError(null);
        const name = await formatAddress(address, truncateLength);
        setFormattedName(name);
      } catch (err) {
        setError(err.message);
        setFormattedName(`${address.slice(0, truncateLength)}...${address.slice(-4)}`);
      }
    };

    resolveName();
  }, [address, formatAddress, isInitialized, truncateLength]);

  return { formattedName, loading, error };
}

/**
 * Hook for getting ENS name for multiple addresses
 * @param {string[]} addresses - Array of addresses
 * @returns {Object} - { ensNames, loading, error }
 */
export function useMultipleENS(addresses) {
  const { getMultipleEnsNames, isInitialized, loading } = useENS();
  const [ensNames, setEnsNames] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!addresses || addresses.length === 0 || !isInitialized) {
      setEnsNames({});
      return;
    }

    const resolveNames = async () => {
      try {
        setError(null);
        const names = await getMultipleEnsNames(addresses);
        setEnsNames(names);
      } catch (err) {
        setError(err.message);
        setEnsNames({});
      }
    };

    resolveNames();
  }, [addresses, getMultipleEnsNames, isInitialized]);

  return { ensNames, loading, error };
}
