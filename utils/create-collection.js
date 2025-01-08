import {
    createNft,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    generateSigner,
    percentAmount,
    createGenericFileFromBrowserFile,
    createNoopSigner,
    signerIdentity,
} from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey, toWeb3JsTransaction, toWeb3JsLegacyTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { Connection } from "@solana/web3.js";

export const createCollection = async (inputImage, user, connection) => {

    const walletBalance = await connection.getBalance(user.publicKey);

    console.log("Wallet Balance: ", walletBalance);
    console.log("Wallet: ", user.publicKey.toBase58());

    const umi = createUmi(connection);

    const signer = {
        publicKey: fromWeb3JsPublicKey(user.publicKey),
        signTransaction: async (tx) => tx,
        signMessage: async (data) => data,
        signAllTransactions: async (txs) => txs,
    }

    umi
        .use(signerIdentity(signer))
        .use(mplTokenMetadata())
        .use(irysUploader());
    
    umi.payer = signer;

    // const file = await createGenericFileFromBrowserFile(inputImage);
    // const [image] = await umi.uploader.upload([file]);
    // console.log("image uri:", image);
    
    // // upload offchain json to Arweave using irys
    // const uri = await umi.uploader.uploadJson({
    //     name: "NX 2 Collection",
    //     symbol: "NX 2",
    //     description: "NX 2 Collection is a sample created to add to the portfolio projects.",
    //     image,
    // });
    // console.log("Collection offchain metadata URI:", uri);

    // generate mint keypair
    const collectionMint = generateSigner(umi);
    
    // create and mint NFT
    const tx = createNft(umi, {
        mint: collectionMint,
        name: "NX 2 Collection",
        symbol: "NX 2",
        uri: "uri sample",
        updateAuthority: user.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true,
    });

    tx.useV0();

    const transaction = await tx.buildWithLatestBlockhash(umi);

    const web3jsTransaction = toWeb3JsLegacyTransaction(transaction);
    
    web3jsTransaction.feePayer = user.publicKey;
    // get latest blockhash
    web3jsTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signedTx = await user.signTransaction(web3jsTransaction);
    console.log("Signed Transaction", signedTx);
    // send transaction
    const txId = await connection.sendRawTransaction(signedTx.serialize());
    console.log("Transaction ID", txId);
    // confirmTransaction returns a signature
    const signature = await connection.confirmTransaction(txId, "confirmed");

    console.log(`Collection NFT address is:`, collectionMint.publicKey);
    console.log("✅ Finished successfully!");
}

// Wallet Balance:  8405173160
// image uri: https://arweave.net/8pqsd945LGN2z5T8vwFn7mFPGS9oaNxh3rPoELph4uC5
// Collection offchain metadata URI: https://arweave.net/32LbgGpj84kuSkAefZdFxhsXPCsHgNBw7hL8BNeoC5Mm
// Collection NFT:  https://explorer.solana.com/address/AsSkj8Jtar3pn35xYCECxXLw7ngN25HT5iozj2ADHzvU?cluster=devnet
// Collection NFT address is: AsSkj8Jtar3pn35xYCECxXLw7ngN25HT5iozj2ADHzvU
// ✅ Finished successfully!
