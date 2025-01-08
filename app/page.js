"use client"
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "@/components/Wallet";
import { NFT } from "@/components/NFT";

export default function Home() {
  const endpoint = "https://api.devnet.solana.com";

  return (
    <div className="grid h-full place-items-center gap-4 mt-4">
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <Wallet/>
            <NFT/>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
