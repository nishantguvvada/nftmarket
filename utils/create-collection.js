import {
    createNft,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    generateSigner,
    percentAmount,
    signerIdentity,
} from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey, toWeb3JsKeypair, toWeb3JsLegacyTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { WebUploader } from "@irys/web-upload";
import { WebSolana } from "@irys/web-upload-solana";

export const createCollection = async (inputImage, user, connection, collectionName, collectionSymbol, collectionDescription) => {

    // Checking wallet balance for debugging
    // const walletBalance = await connection.getBalance(user.publicKey);

    // console.log("Wallet Balance: ", walletBalance);
    // console.log("Wallet: ", user.publicKey.toBase58());

    const umi = createUmi(connection);

    const signer = {
        publicKey: fromWeb3JsPublicKey(user.publicKey),
        signTransaction: async (tx) => tx,
        signMessage: async (data) => data,
        signAllTransactions: async (txs) => txs,
    }

    // Generate mint keypair
    const collectionMint = generateSigner(umi);
    const web3jsCollectionMint = toWeb3JsKeypair(collectionMint);

    umi
        .use(signerIdentity(signer))
        .use(mplTokenMetadata())

    // Create an instance of irys uploader
    const irysUploader = await WebUploader(WebSolana).withProvider(user).withRpc("https://api.devnet.solana.com").devnet();

	// Get cost to upload "inputImage.size" bytes
	const imagePrice = await irysUploader.getPrice(inputImage.size);
	console.log(`Uploading ${inputImage.size} bytes costs ${irysUploader.utils.fromAtomic(imagePrice)}`);
	await irysUploader.fund(imagePrice);

    // Upload the image
    const image = await irysUploader.uploadFile(inputImage);
    console.log(`Image uploaded ==> https://gateway.irys.xyz/${image.id}`);
    
    // Create metadata
    const metadata = {
        name: collectionName,
        symbol: collectionSymbol,
        description: collectionDescription,
        image: `https://gateway.irys.xyz/${image.id}`,
    }

    const tags = [{ name: "Content-Type", value: "application/json" }];

    // Obtain size of the metadata
    const jsonSize = Object.keys(metadata).length;
    // Get cost to upload "jsonSize" bytes
    const jsonPrice = await irysUploader.getPrice(jsonSize);

    console.log(`Uploading ${jsonSize} bytes costs ${irysUploader.utils.fromAtomic(jsonPrice)}`);
	await irysUploader.fund(jsonPrice);

    // Convert the JS object to a JSON file
    const blob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
    });

    // Upload the JSON file
    const json = await irysUploader.uploadFile(blob, { tags: tags });
    console.log(`Collection offchain metadata uploaded ==> https://gateway.irys.xyz/${json.id}`);
    
    // create and mint NFT
    const tx = await createNft(umi, {
        mint: collectionMint,
        name: collectionName,
        symbol: collectionSymbol,
        uri: `https://gateway.irys.xyz/${json.id}`,
        updateAuthority: user.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true,
    }).buildWithLatestBlockhash(umi);

    // convert umi transaction to web3js
    const web3jsTransaction = toWeb3JsLegacyTransaction(tx);
    
    // add wallet as the fee payer
    web3jsTransaction.feePayer = user.publicKey;

    // get latest blockhash
    web3jsTransaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // partialSign using the other account with keypair
    web3jsTransaction.partialSign(web3jsCollectionMint);

    const signedTx = await user.signTransaction(web3jsTransaction, connection, { skipPreflight: true});
    console.log("Signed Transaction", signedTx);

    // send transaction
    const txId = await connection.sendRawTransaction(signedTx.serialize({ requireAllSignatures: false, verifySignatures: false }));
    console.log("Transaction ID", txId);

    // confirmTransaction returns a signature
    const signature = await connection.confirmTransaction(txId, "confirmed");
    console.log("sign",signature);

    console.log(`Collection NFT address is:`, collectionMint.publicKey);
    console.log("✅ Finished successfully!");
}

// Wallet Balance:  9306050408
// Wallet:  4H6oyyKmzYuV6PeeTGDayQdH8BSyvdpXYNcgyLSoXs8P
// Uploading 71144 bytes costs 0.00000921
// Image uploaded ==> https://gateway.irys.xyz/CzdEa7MbcFzfJhn5eyfhUerPjRFWvixyKMoq2Yy8esDb
// Uploading 4 bytes costs 0.000009221
// Collection offchain metadata URI: ==> https://gateway.irys.xyz/CUusHJBJpFvTJpjs9j83V4yVtuU2Q1AbU1CvXEXDsigT
// Signed Transaction Transaction {signatures: Array(2), feePayer: PublicKey, instructions: Array(2), recentBlockhash: '24uyMoCRBDXoHqW8J1orMn5GmQ2D9NYPFADWdfK2T42L', lastValidBlockHeight: undefined, …}
// Transaction ID 549DvMQDyWJsHaxXwygdZCXKyznwhLRvUdWVk1C1t8NUnbYcBFSkJJqU4fGAqmAvAxynx4yMZBcBGysjfqM85z35
// sign {context: {…}, value: {…}}
// Collection NFT address is: FAXRx8BNMyykt1PE8ixmM8Ca5VPNx4iFxJL5uczVnxXx
// ✅ Finished successfully!