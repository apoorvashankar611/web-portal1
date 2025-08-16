import React, { createContext, useContext, useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { WalletConnection } from '../types';
import { connection, getWalletBalance } from '../lib/solana';

interface WalletContextType {
  wallet: WalletConnection;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletConnection>({
    connected: false,
    publicKey: null,
    balance: 0,
  });

  useEffect(() => {
    // Check if wallet was previously connected
    const savedPublicKey = localStorage.getItem('walletPublicKey');
    if (savedPublicKey) {
      connectToSavedWallet(savedPublicKey);
    }
  }, []);

  const connectToSavedWallet = async (publicKeyString: string) => {
    try {
      const publicKey = new PublicKey(publicKeyString);
      const balance = await getWalletBalance(publicKey);
      
      setWallet({
        connected: true,
        publicKey: publicKeyString,
        balance,
      });
    } catch (error) {
      console.error('Error connecting to saved wallet:', error);
      localStorage.removeItem('walletPublicKey');
    }
  };

  const connectWallet = async () => {
    try {
      // Check if Phantom wallet is installed
      const { solana } = window as any;
      
      if (!solana?.isPhantom) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet.');
      }

      // Connect to wallet
      const response = await solana.connect();
      const publicKey = response.publicKey.toString();
      const balance = await getWalletBalance(response.publicKey);

      setWallet({
        connected: true,
        publicKey,
        balance,
      });

      // Save to localStorage
      localStorage.setItem('walletPublicKey', publicKey);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      connected: false,
      publicKey: null,
      balance: 0,
    });
    localStorage.removeItem('walletPublicKey');
  };

  const refreshBalance = async () => {
    if (wallet.publicKey) {
      try {
        const publicKey = new PublicKey(wallet.publicKey);
        const balance = await getWalletBalance(publicKey);
        setWallet(prev => ({ ...prev, balance }));
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  const value = {
    wallet,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};