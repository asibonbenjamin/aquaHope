import React, { useState, useEffect } from 'react';
import { useFormattedAddress } from '../hooks/useENS';

/**
 * ENS Address Component
 * Displays Ethereum addresses with ENS names when available
 */
export default function ENSAddress({ 
  address, 
  truncateLength = 6, 
  showAvatar = false,
  className = '',
  onClick = null,
  title = null,
  copyable = false
}) {
  const { formattedName, loading, error } = useFormattedAddress(address, truncateLength);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(address, formattedName);
    }
  };

  if (!address) {
    return <span className={className}>Unknown</span>;
  }

  const isEnsName = formattedName.includes('.eth');
  const displayTitle = title || (isEnsName ? `${formattedName} (${address})` : address);

  return (
    <span 
      className={`ens-address ${className} ${onClick ? 'clickable' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      title={displayTitle}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {loading ? (
        <span className="loading-spinner">⏳</span>
      ) : (
        <>
          {showAvatar && isEnsName && (
            <span className="ens-avatar">🖼️</span>
          )}
          <span className={`address-text ${isEnsName ? 'ens-name' : 'eth-address'}`}>
            {formattedName}
          </span>
          {isEnsName && (
            <span className="ens-badge" title="ENS Name">.eth</span>
          )}
          {copyable && (
            <button 
              className="copy-button"
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy address'}
            >
              {copied ? '✓' : '📋'}
            </button>
          )}
        </>
      )}
      {error && (
        <span className="error-indicator" title={`Error: ${error}`}>⚠️</span>
      )}
    </span>
  );
}

/**
 * ENS Address List Component
 * Displays multiple addresses with ENS names
 */
export function ENSAddressList({ 
  addresses, 
  className = '',
  itemClassName = '',
  showCopyButtons = false,
  onAddressClick = null
}) {
  const [ensNames, setEnsNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveNames = async () => {
      setLoading(true);
      try {
        // This would use the useMultipleENS hook in a real implementation
        // For now, we'll simulate the loading
        const names = {};
        addresses.forEach(address => {
          names[address] = null; // Would be resolved by the hook
        });
        setEnsNames(names);
      } finally {
        setLoading(false);
      }
    };

    if (addresses && addresses.length > 0) {
      resolveNames();
    }
  }, [addresses]);

  if (loading) {
    return (
      <div className={`ens-address-list loading ${className}`}>
        <span>Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className={`ens-address-list ${className}`}>
      {addresses.map((address, index) => (
        <ENSAddress
          key={address}
          address={address}
          className={itemClassName}
          copyable={showCopyButtons}
          onClick={onAddressClick}
        />
      ))}
    </div>
  );
}

/**
 * ENS Search Component
 * Search for addresses by ENS name
 */
export function ENSSearch({ 
  onAddressFound = null,
  placeholder = "Search by ENS name (e.g., vitalik.eth)",
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // This would use the ENS service to resolve the name
      // For now, we'll simulate the search
      const mockAddress = '0x' + '0'.repeat(40); // Mock address
      setResult({
        ensName: searchTerm,
        address: mockAddress
      });
      
      if (onAddressFound) {
        onAddressFound(mockAddress, searchTerm);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`ens-search ${className}`}>
      <div className="search-input-group">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="search-input"
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          className="search-button"
        >
          {loading ? '⏳' : '🔍'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="search-result">
          <ENSAddress 
            address={result.address}
            showAvatar={true}
            copyable={true}
          />
        </div>
      )}
    </div>
  );
}
