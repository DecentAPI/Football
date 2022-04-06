import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import fs from 'fs';

var RequestJSON = './build/contracts/Football_Request.json';
var ResponseJSON = './build/contracts/Football_Response.json';

const RequestContract = JSON.parse(fs.readFileSync(RequestJSON));
const ResponseContract = JSON.parse(fs.readFileSync(ResponseJSON));

//Add wallet mnenomnic to environment - uncomment to use
//const mnemonic = fs.readFileSync(".secret").toString().trim();

//Add wallet mnenomnic as environment variable ($env:process.env.WALLET_MNEMONIC) - comment to use .secret
const mnemonic = process.env.WALLET_MNEMONIC.toString().trim();
const walletProvider = new HDWalletProvider(mnemonic, "https://rpc-mainnet.matic.network");


const init = async () => {
	try {

		let web3_wallet = new Web3(walletProvider);
		let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rpc-mainnet.matic.network'));
		const addresses = await web3_wallet.eth.getAccounts();


		const requestContract = new web3_wallet.eth.Contract(RequestContract.abi, '0x92BE63778b96acEd0685d50D0a82812F8bAa1682');
		const responseContract = new web3.eth.Contract(ResponseContract.abi, '0x80b62552575ca8b214A4e6a233388e3A9303239B');

		//Send request to Oracle		
		await requestContract.methods.sendFootballParams("teams", "statistics", "league=39&season=2020&team=33").send({
			from: addresses[0],
			gasPrice: 35000000000,
			value: "10000000000000000"
		});

		//Await for response from Oracle then prints result
		responseContract.events.FootballData({})
			.on('data', function (event) {
				console.log(event);
			}).on('error', console.error)


	} catch (error) {
		console.error(error);

	}
}

init();