import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_CONFIG } from '../contracts/contractConfig.js'
import ensService from '../services/ensService.js'

const WalletContext = createContext({})

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [contract, setContract] = useState(null)
  const [network, setNetwork] = useState(null)
  const [ensName, setEnsName] = useState(null)
  const [ensLoading, setEnsLoading] = useState(false)
  const [showEnsModal, setShowEnsModal] = useState(false)
  const [pendingAccount, setPendingAccount] = useState(null)

  // Initialize ENS service when provider is available
  useEffect(() => {
    if (provider) {
      ensService.initialize(provider)
        .then(() => {
          console.log('✅ ENS service initialized successfully');
        })
        .catch((error) => {
          console.warn('⚠️ ENS service initialization failed:', error);
        });
    }
  }, [provider])

  // Resolve ENS name when account changes
  useEffect(() => {
    if (account && provider) {
      resolveEnsName()
    } else {
      setEnsName(null)
    }
  }, [account, provider])

  const resolveEnsName = async () => {
    if (!account || !provider) return
    
    setEnsLoading(true)
    try {
      // Check for custom ENS name first
      const customName = ensService.getCustomEnsName(account);
      if (customName) {
        console.log(`Custom ENS name found for ${account}:`, customName);
        setEnsName(customName);
        setEnsLoading(false);
        return;
      }

      // Check if ENS service is initialized
      if (!ensService.initialized) {
        console.warn('ENS service not initialized, attempting to initialize...');
        await ensService.initialize(provider);
      }
      
      const name = await ensService.getEnsName(account)
      console.log(`ENS resolution for ${account}:`, name);
      setEnsName(name)
    } catch (error) {
      console.error('Failed to resolve ENS name:', error)
      setEnsName(null)
    } finally {
      setEnsLoading(false)
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      
      // Get network info
      browserProvider.getNetwork().then(net => {
        setNetwork(net)
      }).catch(() => {})
      
      browserProvider.listAccounts().then(accs => {
        if (accs && accs.length) {
          setAccount(accs[0].address)
          browserProvider.getSigner().then(s => {
            setSigner(s)
            // Initialize contract
            if (CONTRACT_CONFIG.CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              const contractInstance = new ethers.Contract(
                CONTRACT_CONFIG.CONTRACT_ADDRESS,
                CONTRACT_CONFIG.CONTRACT_ABI,
                s
              )
              setContract(contractInstance)
            }
          })
        }
      }).catch(() => {})

      const handleAccountsChanged = (accs) => {
        if (!accs || accs.length === 0) {
          setAccount(null)
          setSigner(null)
          setContract(null)
          setEnsName(null)
        } else {
          setAccount(accs[0])
          browserProvider.getSigner().then(s => {
            setSigner(s)
            if (CONTRACT_CONFIG.CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              const contractInstance = new ethers.Contract(
                CONTRACT_CONFIG.CONTRACT_ADDRESS,
                CONTRACT_CONFIG.CONTRACT_ABI,
                s
              )
              setContract(contractInstance)
            }
          })
        }
      }

      const handleChainChanged = (chainId) => {
        window.location.reload()
      }

      window.ethereum.on?.('accountsChanged', handleAccountsChanged)
      window.ethereum.on?.('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install it to donate.')
      return
    }
    if (isConnecting) return
    try {
      setIsConnecting(true)
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // Set pending account and show ENS modal
      setPendingAccount(accs[0])
      setShowEnsModal(true)
      
    } catch (err) {
      console.error(err)
    } finally {
      setIsConnecting(false)
    }
  }

  const completeWalletConnection = async (accountAddress) => {
    try {
      setAccount(accountAddress)
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      setProvider(browserProvider)
      
      // Get network info
      const net = await browserProvider.getNetwork()
      setNetwork(net)
      
      const s = await browserProvider.getSigner()
      setSigner(s)
      
      // Initialize contract
      if (CONTRACT_CONFIG.CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const contractInstance = new ethers.Contract(
          CONTRACT_CONFIG.CONTRACT_ADDRESS,
          CONTRACT_CONFIG.CONTRACT_ABI,
          s
        )
        setContract(contractInstance)
      }
      
      // Close modal
      setShowEnsModal(false)
      setPendingAccount(null)
    } catch (err) {
      console.error('Failed to complete wallet connection:', err)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setSigner(null)
    setContract(null)
    setEnsName(null)
    setProvider(null)
    setNetwork(null)
    
    // Clear any cached data
    if (typeof window !== 'undefined') {
      // Clear any wallet-related localStorage if needed
      console.log('Wallet disconnected')
    }
  }

  // Format address with ENS name
  const formatAddress = async (address, truncateLength = 6) => {
    if (!provider) return address ? `${address.slice(0, truncateLength)}...${address.slice(-4)}` : 'Unknown'
    
    try {
      return await ensService.formatAddress(address, truncateLength)
    } catch (error) {
      console.error('Failed to format address:', error)
      return address ? `${address.slice(0, truncateLength)}...${address.slice(-4)}` : 'Unknown'
    }
  }

  // Get ENS name for address
  const getEnsName = async (address) => {
    if (!provider) return null
    
    try {
      return await ensService.getEnsName(address)
    } catch (error) {
      console.error('Failed to get ENS name:', error)
      return null
    }
  }

  // Get address for ENS name
  const getAddress = async (ensName) => {
    if (!provider) return null
    
    try {
      return await ensService.getAddress(ensName)
    } catch (error) {
      console.error('Failed to get address:', error)
      return null
    }
  }

  // Get display name (ENS name or formatted address)
  const getDisplayName = (address = account, truncateLength = 6) => {
    if (!address) return 'Unknown'
    
    if (address === account && ensName) {
      return ensName
    }
    
    return `${address.slice(0, truncateLength)}...${address.slice(-4)}`
  }

  // Refresh ENS names (useful when custom names are updated)
  const refreshEnsNames = async () => {
    if (account && provider) {
      await resolveEnsName()
    }
  }

  const value = useMemo(() => ({ 
    provider, 
    signer, 
    account, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    contract, 
    network,
    ensName,
    ensLoading,
    formatAddress,
    getEnsName,
    getAddress,
    getDisplayName,
    refreshEnsNames,
    showEnsModal,
    pendingAccount,
    completeWalletConnection
  }), [provider, signer, account, isConnecting, contract, network, ensName, ensLoading, showEnsModal, pendingAccount])
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  return useContext(WalletContext)
}