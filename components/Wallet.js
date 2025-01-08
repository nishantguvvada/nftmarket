"use client"
import '@solana/wallet-adapter-react-ui/styles.css';
import dynamic from "next/dynamic"
const WalletMultiDynamicButton = dynamic(
    async() => (await import ("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);
const WalletDisconnectDynamicButton = dynamic(
    async() => (await import ("@solana/wallet-adapter-react-ui")).WalletDisconnectButton,
    { ssr: false }
);


export const Wallet = () => {
    return (
        <div className="flex flex-col gap-2 place-items-center p-6 bg-white border border-gray-200 rounded-lg shadow">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Connect Wallet</h5>
            <WalletMultiDynamicButton/>
            <WalletDisconnectDynamicButton/>
        </div>
    )
}