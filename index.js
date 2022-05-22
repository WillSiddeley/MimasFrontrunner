// Libraries
require('dotenv').config();
const Web3 = require('web3');
const ethers = require('ethers');

// Provider for Cronos
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.vvs.finance"));

// Constants
const cronosChainId = 25;
const mimasThreshold = 4.8;
const updateOraclesFunc = "0x8ea709f3";
const getRewardAmountFunc = "0x9c81ff6b";
const mimasFaucetContract = "0x8520975f869ffe177ec3662a66e4525a7364b037";

// Gas
const gasLimit = web3.utils.toHex(1000000);
const maxFeePerGas = web3.utils.toHex(web3.utils.toWei('5000', 'gwei'));
const maxPriorityFeePerGas = web3.utils.toHex(web3.utils.toWei('5000', 'gwei'));

// Date
const date = new Date();

// Function to determine the amount of MIMAS in the faucet
async function getNumMimas() {

	console.log(`[${date.toGMTString()}] Querying amount of Mimas in the faucet...`);

	await web3.eth.call({
		"to": mimasFaucetContract,
		"data": getRewardAmountFunc
	}).then((res) => {

		let numTokens = web3.utils.toBN(res) / Math.pow(10, 18);

		if (numTokens >= mimasThreshold) {

			console.log(`Amount of Mimas in faucet (${numTokens}) exceeds threshold! Sending transaction...`);

			// Send transaction to claim
			sendTransaction();

		} else {

			console.log(`Not enough Mimas (${numTokens}) in the faucet...\n`)

		}

	}).catch((err) => {

		console.log("Error!");
		console.log(err);

	})

}

// Function that handles sending a transaction from raw tx data
async function sendTransaction() {

	// Get user wallet data
	const sender = process.env.SENDER;
	const privateKey = process.env.PRIVATE_KEY;

	// Nonce
	const txCount = await web3.eth.getTransactionCount(sender);
	const nonce = ethers.utils.hexlify(txCount);

	console.log(`[${date.toGMTString()}] Sending transaction with the following parameters:`);
	console.log(`From: ${sender}`);
	console.log(`To: ${mimasFaucetContract}`);
	console.log(`Data: ${updateOraclesFunc}`);
	console.log(`Chain Id: ${cronosChainId}`);
	console.log(`Gas: ${gasLimit}`);
	console.log(`Nonce: ${nonce}`);
	console.log(`Value: 0x`);

	await web3.eth.accounts.signTransaction({
		"from": sender,
		"to": mimasFaucetContract,
		"gasLimit": gasLimit,
		"maxFeePerGas": maxFeePerGas,
		"maxPriorityFeePerGas": maxPriorityFeePerGas,
		"value": "0x",
		"data": updateOraclesFunc,
		"nonce": nonce,
		"chainId": cronosChainId,
		"accessList": [],
		"type": "0x02"
	}, privateKey).then((signedTx => {

		web3.eth.sendSignedTransaction(signedTx.rawTransaction).then((res) => {

			if (res.status) {

				console.log(`Transaction Completed!`);
				console.log(`Transaction hash: ${res.transactionHash}\n\n`);

			} else {

				console.log(`Transaction Failed!`);
				console.log(res);
				console.log("\n\n");

			}

		}).catch((err) => {

			console.log(`Error!`);
			console.log(err);
			console.log("\n\n");

		});

	}));
 
};

getNumMimas();
