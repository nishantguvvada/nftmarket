import { useState, useRef } from "react";
import { ImCross } from "react-icons/im";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createCollection } from "@/utils/create-collection";

export const NFT = () => {

    const { connection } = useConnection();
    const wallet = useWallet();

    const [collectionImage, setCollectionImage] = useState(null);
    const [nftImage, setNftImage] = useState(null);
    const [collectionName, setCollectionName] = useState("My Default Collection");
    const [collectionSymbol, setCollectionSymbol] = useState("MDC");
    const [collectionDescription, setCollectionDescription] = useState("Description of the collection");

    const nftRef = useRef();
    const collectionRef = useRef();

    const handleCreateCollection = () => {
        try {
            if (wallet.publicKey != null) {
                createCollection(collectionImage, wallet, connection, collectionName, collectionSymbol, collectionDescription);
            }
        } catch(err) {
            console.log("Error handling collection!");
        }
    }

    return (
        <>
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">NFT Marketplace</h1>
        <blockquote className="text-xl italic font-semibold text-gray-900 dark:text-white">
            <p>"NFT Marketplace is a sample SOLANA project intended to allow users to create NFT collection and add child NFTs to the collection."</p>
        </blockquote>
        <span className="underline underline-offset-3 decoration-4 decoration-white text-white bg-blue-700 rounded p-2">{wallet.publicKey == null ? "No wallet connected" : <div>{wallet.publicKey.toBase58()}</div>}</span>
        <div className="w-screen flex flex-row justify-center items-center gap-20">
            <div id="collection" className="flex flex-col gap-2 place-items-center p-6 bg-white border border-gray-200 rounded-lg shadow">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Create a collection</h5>
                <div className="w-full">
                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Collection Name</label>
                    <input onChange={(e) => { setCollectionName(e.target.value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Collection Name" required />
                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Symbol</label>
                    <input onChange={(e) => { setCollectionSymbol(e.target.value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Symbol" required />
                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                    <input onChange={(e) => { setCollectionDescription(e.target.value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Description" required />
                </div>
                <label className="block mt-4 mb-2 text-sm font-medium text-gray-900">Upload file</label>
                <div className="mb-2 flex flex-row gap-2">
                    <input accept="image/*" ref={collectionRef} onChange={(e) => {
                        setCollectionImage(e.target.files[0])
                    }} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50" type="file"/>
                    <button className="inline" onClick={()=>{collectionRef.current.value = ""; setCollectionImage(null)}}><ImCross /></button>
                </div>
                {collectionImage == null ? "" : <img src={URL.createObjectURL(collectionImage)} className="object-scale-down w-24 h-24"/>}
                <button onClick={handleCreateCollection} type="button" className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mb-2">Create Collection</button>
            </div>
            <div id="nft" className="flex flex-col gap-2 place-items-center p-6 bg-white border border-gray-200 rounded-lg shadow">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Create & add NFT to collection</h5>
                <div className="w-full">
                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">NFT Name</label>
                    <input onChange={(e) => { setCollectionName(e.target.value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="NFT Name" required />
                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Symbol</label>
                    <input onChange={(e) => { setCollectionSymbol(e.target.value)}} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="NFT Symbol" required />
                </div>
                <label className="block mt-4 mb-2 text-sm font-medium text-gray-900">Upload file</label>
                <div className="mb-2 flex flex-row gap-2">
                    <input accept="image/*" ref={nftRef} onChange={(e) => {
                        setNftImage(e.target.files[0])
                    }} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50" type="file"/>
                    <button onClick={()=>{nftRef.current.value = ""; setNftImage(null)}}><ImCross /></button>
                </div>
                {nftImage == null ? "" : <img src={URL.createObjectURL(nftImage)} className="object-scale-down w-24 h-24"/>}
                <button type="button" className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-md text-sm px-5 py-2.5 text-center mb-2">Create & Add NFT</button>
            </div>
        </div>
        </>
    )
}