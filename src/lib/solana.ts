import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Admin wallet for receiving platform fees
export const ADMIN_WALLET = new PublicKey('11111111111111111111111111111112'); // Placeholder - replace with actual admin wallet

// Platform fee in SOL (0.0001 SOL)
export const PLATFORM_FEE = 0.0001 * LAMPORTS_PER_SOL;

// Devnet connection
export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const createPaymentTransaction = async (
  fromPubkey: PublicKey,
  amount: number = PLATFORM_FEE
): Promise<Transaction> => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: ADMIN_WALLET,
      lamports: amount,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;

  return transaction;
};

export const getWalletBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
};