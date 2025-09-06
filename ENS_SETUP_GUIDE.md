# 🌐 ENS (Ethereum Name Service) Setup Guide

This guide will help you set up ENS functionality in your AquaHope platform so that Ethereum addresses are displayed as human-readable names instead of long hexadecimal strings.

## 📋 What is ENS?

ENS (Ethereum Name Service) is a distributed, open, and extensible naming system based on the Ethereum blockchain. It maps human-readable names like `vitalik.eth` to machine-readable identifiers like Ethereum addresses.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install ENS packages
npm install @ensdomains/ensjs @ensdomains/ens-contracts

# Or if you prefer yarn
yarn add @ensdomains/ensjs @ensdomains/ens-contracts
```

### 2. Deploy Contracts with ENS Support

```bash
# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet (Sepolia)
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Network Configuration

ENS works on different networks. Here's how to configure it:

#### Mainnet
- ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- Public Resolver: `0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41`

#### Sepolia Testnet
- ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- Public Resolver: `0x8FADE66D4c90ddf8D4c6b8C4b8C4b8C4b8C4b8C4b`

#### Local Development
- Use the same addresses as mainnet for testing

### Environment Variables

Create a `.env` file in your project root:

```env
# ENS Configuration
ENS_REGISTRY_ADDRESS=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
ENS_PUBLIC_RESOLVER=0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41

# Network Configuration
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
CHAIN_ID=1
```

## 🎯 Features Implemented

### 1. Address Resolution
- **Forward Resolution**: ENS name → Ethereum address
- **Reverse Resolution**: Ethereum address → ENS name
- **Caching**: Resolved names are cached for performance

### 2. UI Components
- **ENSAddress**: Displays addresses with ENS names when available
- **ENSAddressList**: Shows multiple addresses with ENS resolution
- **ENSSearch**: Search for addresses by ENS name

### 3. Smart Contract Integration
- **Donation Contract**: Stores ENS names with donations
- **Governance Contract**: Shows proposer ENS names
- **Token Contract**: Links ENS names to token holders

### 4. React Hooks
- **useENS**: Main hook for ENS functionality
- **useFormattedAddress**: Format single address with ENS
- **useMultipleENS**: Resolve multiple addresses at once

## 🔍 How It Works

### 1. Address Resolution Flow

```javascript
// 1. User connects wallet
const { account } = useWallet()

// 2. ENS service resolves name
const ensName = await ensService.getEnsName(account)

// 3. Display formatted address
<ENSAddress address={account} />
```

### 2. Smart Contract Integration

```solidity
// In your donation contract
struct Donation {
    address donor;
    string ensName; // ENS name is stored
    // ... other fields
}

// Resolve ENS name during donation
function _resolveEnsName(address addr) internal view returns (string memory) {
    // ENS resolution logic
}
```

### 3. Caching Strategy

```javascript
// Names are cached to avoid repeated RPC calls
const cache = new Map()
if (cache.has(address)) {
    return cache.get(address)
}
```

## 🧪 Testing

### 1. Test ENS Resolution

```javascript
// Test with known ENS names
const ensService = new ENSService()
await ensService.initialize(provider)

// Test forward resolution
const address = await ensService.getAddress('vitalik.eth')
console.log('Vitalik address:', address)

// Test reverse resolution
const name = await ensService.getEnsName(address)
console.log('ENS name:', name)
```

### 2. Test UI Components

```jsx
// Test ENSAddress component
<ENSAddress 
  address="0x1234...5678"
  showAvatar={true}
  copyable={true}
/>

// Test ENS search
<ENSSearch 
  onAddressFound={(address, name) => {
    console.log('Found:', name, address)
  }}
/>
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "ENS service not initialized"
**Solution**: Make sure the provider is set before using ENS functions.

```javascript
useEffect(() => {
  if (provider) {
    ensService.initialize(provider)
  }
}, [provider])
```

#### 2. "Failed to resolve ENS name"
**Possible causes**:
- Network not supported
- ENS registry not available
- Address doesn't have an ENS name

**Solution**: Check network configuration and ENS registry address.

#### 3. "Slow ENS resolution"
**Solution**: Enable caching and use batch resolution.

```javascript
// Use batch resolution for multiple addresses
const names = await ensService.getMultipleEnsNames(addresses)
```

### Debug Mode

Enable debug logging:

```javascript
// In ensService.js
const DEBUG = true

if (DEBUG) {
  console.log('Resolving ENS name for:', address)
}
```

## 📊 Performance Optimization

### 1. Caching
- Names are cached in memory
- Cache is cleared when provider changes
- Use `clearCache()` to manually clear

### 2. Batch Resolution
- Resolve multiple addresses at once
- Reduces RPC calls
- Better user experience

### 3. Lazy Loading
- Only resolve names when needed
- Don't block UI rendering
- Show loading states

## 🔒 Security Considerations

### 1. Address Validation
- Always validate addresses before resolution
- Check for valid ENS names
- Handle resolution errors gracefully

### 2. Phishing Prevention
- Show both ENS name and address
- Allow users to verify addresses
- Warn about suspicious names

### 3. Network Security
- Use trusted RPC providers
- Validate ENS registry addresses
- Handle network errors

## 🌍 Network Support

### Supported Networks
- ✅ Ethereum Mainnet
- ✅ Sepolia Testnet
- ✅ Goerli Testnet (deprecated)
- ✅ Local Development

### Network Configuration

```javascript
const NETWORKS = {
  1: { // Mainnet
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    publicResolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41'
  },
  11155111: { // Sepolia
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    publicResolver: '0x8FADE66D4c90ddf8D4c6b8C4b8C4b8C4b8C4b8C4b'
  }
}
```

## 📈 Monitoring

### 1. Resolution Metrics
- Track resolution success rate
- Monitor resolution time
- Log resolution errors

### 2. User Experience
- Measure loading times
- Track user interactions
- Monitor error rates

### 3. Performance
- Cache hit rates
- RPC call frequency
- Memory usage

## 🎨 Customization

### 1. Styling
- Customize ENS badge appearance
- Modify loading animations
- Add custom avatars

### 2. Behavior
- Change truncation length
- Modify cache settings
- Add custom validation

### 3. Integration
- Add to other components
- Create custom hooks
- Extend functionality

## 📚 Additional Resources

- [ENS Documentation](https://docs.ens.domains/)
- [ENS JS Library](https://github.com/ensdomains/ensjs)
- [ENS Contracts](https://github.com/ensdomains/ens-contracts)
- [Ethereum Name Service](https://ens.domains/)

## 🤝 Support

If you encounter any issues with ENS integration:

1. Check the troubleshooting section
2. Review the console for errors
3. Verify network configuration
4. Test with known ENS names
5. Check ENS registry status

## 🎉 Success!

Once configured, your AquaHope platform will display:
- ✅ Human-readable names instead of addresses
- ✅ ENS name resolution in real-time
- ✅ Cached results for better performance
- ✅ Fallback to truncated addresses
- ✅ Copy functionality for addresses
- ✅ Avatar support for ENS names

Your users will have a much better experience with readable names throughout the platform!
