import {
    createNft,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    generateSigner,
    keypairIdentity,
    percentAmount,
    createGenericFileFromBrowserFile,
    publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
    getExplorerLink,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";

export async function addNFTToCollection(inputNFTImage) {
    const connection = new Connection(clusterApiUrl("devnet"), { commitment: "confirmed" });

    const user = Keypair.fromSecretKey(bs58.default.decode("2BkzJ2Phk2kaJgTrKhppMEBDJ8qEJG6gA79G3U7paPcfsRWPby1Yh5BNkyzY9ayJYjZqB6XJDwBLUzGF6by4ug4j"));    
    const walletBalance = await connection.getBalance(user.publicKey);

    console.log("Wallet Balance: ", walletBalance);

    const umi = createUmi(connection);

    // convert solana web3.js keypair into umi instance keypair
    const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

    umi
        .use(keypairIdentity(umiKeypair))
        .use(mplTokenMetadata())
        .use(irysUploader());

    // Substitute in your collection NFT address
    const collectionNftAddress = UMIPublicKey("Ao5S3LLf8Jg7gvao6xpuEne57HxyCEUn1avTS6Bm1jus");

    const file = await createGenericFileFromBrowserFile(inputNFTImage)
    const [image] = await umi.uploader.upload([file]);
    console.log("image uri:", image);
    
    // upload offchain json to Arweave using irys
    const uri = await umi.uploader.uploadJson({
        name: "Sample NX NFT 1",
        symbol: "NX 1",
        description: "NX NFT 1 is a sample created to add to the portfolio projects.",
        image,
      });
    console.log("NFT offchain metadata URI:", uri);

    const mint = generateSigner(umi);

    // create and mint NFT
    await createNft(umi, {
        mint,
        name: "Sample NX NFT 1",
        symbol: "NX 1",
        uri,
        updateAuthority: umi.identity.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
        collection: {
        key: collectionNftAddress,
        verified: false,
        },
    }).sendAndConfirm(umi, { send: { commitment: "finalized" } });
    
    let explorerLink = getExplorerLink("address", mint.publicKey, "devnet");
    console.log(`Token Mint:  ${explorerLink}`);

}

// Wallet Balance:  8385390994
// image uri: https://arweave.net/BfhhSk7V8jF9LEmj3JLgxxW9AV54tjfEH4SPnLJoxLgC
// NFT offchain metadata URI: https://arweave.net/J3S2icHGg59PUpbPaZ14YAKesfRtTUFzTehMCZr3BR6
// Token Mint:  https://explorer.solana.com/address/F9HLDXx9TjX3msoA2Dvk8QcUpnXHC3WXjAHW5tyKvNTZ?cluster=devnet
