// Libraries
require('dotenv').config();
const Web3 = require('web3');
const ethers = require('ethers');

// Provider for Cronos
const web3 = new Web3(new Web3.providers.HttpProvider("https://rpc.vvs.finance"));

// Constants
const cronosChainId = 25;
const updateOraclesFunc = "0x8ea709f3";
const mimasFaucetContract = "0x8520975f869ffe177ec3662a66e4525a7364b037";

// Gas
const gasLimit = web3.utils.toHex(500000);
const maxFeePerGas = web3.utils.toHex(web3.utils.toWei('5000', 'gwei'));
const maxPriorityFeePerGas = web3.utils.toHex(web3.utils.toWei('5000', 'gwei'));

// Date
const date = new Date();

// Function that handles sending a transaction from raw tx data
async function sendTransaction() {

	// Get user wallet data
	const sender = process.env.SENDER;
	const privateKey = process.env.PRIVATE_KEY;

	// Nonce
	const txCount = await web3.eth.getTransactionCount(sender);
	const nonce = ethers.utils.hexlify(txCount);

	console.log("\n\n\n");
	console.log(date.toGMTString());
	console.log("Sending transaction with the following parameters: ");
	console.log(`chainId: ${cronosChainId}`);
	console.log(`data: ${updateOraclesFunc}`);
	console.log(`from: ${sender}`);
	console.log(`gas: ${gasLimit}`);
	console.log(`nonce: ${nonce}`);
	console.log(`to: ${mimasFaucetContract}`);
	console.log(`value: 0x`);

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

		web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('receipt', console.log);

	}));
 
};

sendTransaction();
