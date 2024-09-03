// const fs = require('fs');
// const csv = require('csv-parser');
// import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// let results:any = [];

// const file = "feed-files/eligibles.csv";

// fs.createReadStream(file)
//   .pipe(csv())
//   .on('data', (data:any) => results.push(data))
//   .on('end', () => {
//     console.log(results);

//     const tree = StandardMerkleTree.of(results, ["address", "uint256"]);

//     console.log('tree ', tree)
// });

// import fs from 'fs';
// import { StandardMerkleTree } from "@openzeppelin/merkle-tree";


// interface AddressData {
//   address: string;
//   amount: number;
// }


// // Function to read addresses and amounts from CSV file
// async function readFromCsv(): Promise<AddressData[]> {
//   return new Promise((resolve, reject) => {
//     fs.readFile('feed-files/raw-data.csv', 'utf8', (err, data) => {
//       if (err) {
//         reject(err);
//         return;
//       }

//       const lines = data.split('\n');
//       const headers = lines[0].split(',');
//       const result: AddressData[] = [];

//       for (let i = 1; i < lines.length; i++) {
//         const row = lines[i];
//         if (row.trim()) {
//           const obj = Object.fromEntries(
//             headers.map((header, index) => [header.trim(), row.split(',')[index].trim()])
//           );

//           const address = obj.address;
//           const amount = parseInt(obj.amount, 10);

//           result.push({ address, amount });
//         }
//       }

//       resolve(result);
//     });
//   });
// }

// // Function to generate Merkle tree and proofs
// async function generateProofs() {
// //   console.log("Generating addresses...");
// //   await generateAddresses();

//   try {
//     const balances = await readFromCsv();

//     // Prepare values for Merkle tree
//     const values = balances.map(balance => [balance.address, balance.amount.toString()]);
//     console.log('values ', values)

//     // Generate Merkle tree
//     const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

//     console.log('Merkle Root:', tree.root);

//     const proofs: { [key: string]: string[] } = {};
//     // console.log('proofs ', proofs)

//     // Generate proofs for each address
//     for (const [index, value] of tree.entries()) {
//       const proof = tree.getProof(index);
//       const address = value[0];
//       proofs[address] = proof;
//       console.log(`Proof for ${address}: ${JSON.stringify(proof)}`);
//     }

//     // // Save the tree and proofs to JSON files
//     // fs.writeFileSync('tree.json', JSON.stringify(tree.dump(), null, 2), 'utf8');
//     // fs.writeFileSync('proofs.json', JSON.stringify(proofs, null, 2), 'utf8');

//   } catch (error) {
//     console.error("Error reading from CSV:", error);
//   }
// }

// // Main execution
// async function main() {
//   try {
//     console.log('Generating proofs...');
//     await generateProofs();
//     console.log('Proofs generated and saved to proofs.json');
//   } catch (error) {
//     console.error('Error generating proofs:', error);
//   }
// }

// main().catch(console.error);

import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import csv from "csv-parser";

const values:any = [];
fs.createReadStream("feed-files/raw-data.csv")
  .pipe(csv())
  .on("data", (row) => {
    values.push([row.address, row.amount]);
  })
  .on("end", () => {
    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
    console.log("Merkle Root:", tree.root);

    // Write the tree to a JSON file
    fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));

    // Initialize an object to store proofs for all addresses
    const proofs = {};

    try {
      const loadedTree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("tree.json", "utf8")));
      for (const [i, v] of loadedTree.entries()) {
        // Get the proof for each address
        const proof:any = loadedTree.getProof(i);
        proofs[v[0]] = proof; // Store the proof with the address as the key
      }

      // Write all proofs to a JSON file
      fs.writeFileSync("proofs7.json", JSON.stringify(proofs, null, 2));
      console.log("All proofs have been saved to 'proofs.json'.");
      
    } catch (err) {
      console.error("Error reading or processing 'tree.json':", err);
    }
  })
  .on("error", (err) => {
    console.error("Error reading 'airdrop.csv':", err);
  });

  /// Merkle Root: 0x29ce1c451520e04e467abf60736a8150e816f3b7eb8957dc247b563b4f73a2b4


