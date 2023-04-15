import Web3 from 'web3'
import { Web3Adapter } from '@safe-global/protocol-kit'
import dotenv from 'dotenv'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import PrivateKeyProvider from 'truffle-privatekey-provider';

dotenv.config()
const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

if (!INFURA_API_KEY) {
  throw new Error('INFURA_API_KEY is not defined in environment variables');
}
if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not defined in environment variables');
}
const provider = new PrivateKeyProvider(PRIVATE_KEY as string, `https://goerli.infura.io/v3/${INFURA_API_KEY}`);
const web3         = new Web3(provider)
const safeOwner    = '0x485A974140923524a74B0D72aF117852F31B412D'
const senderAddress = '0x485A974140923524a74B0D72aF117852F31B412D'
const safeAddress  = '0x0914566875dF1b7Fb6cb67c55058194D6a0616c3'
//const provider     = new Web3.providers.HttpProvider(INFURA_API_KEY)
//const provider = new PrivateKeyProvider(PRIVATE_KEY, `https://goerli.infura.io/v3/${INFURA_API_KEY}`);

const ethAdapter   = new Web3Adapter({
  web3,
  signerAddress: safeOwner
})
const txServiceUrl = 'https://safe-transaction-goerli.safe.global/'
const safeService  = new SafeApiKit({ txServiceUrl, ethAdapter })


const contractAddress = '0xCBE177C44Cff283701f82e69526677a896F1f4b1';
const functionSignature = 'set(uint256,uint256)';
const param1 = '999999999';
const param2 = '9999999999';

async function main() {
  const data = web3.eth.abi.encodeFunctionCall(
    {
      name: 'set',
      type: 'function',
      inputs: [
        { type: 'uint256', name: 'latitude' },
        { type: 'uint256', name: 'longitude' },
      ],
    },
    [param1, param2]
  );

  const safeTransactionData: SafeTransactionDataPartial = {
    to: contractAddress,
    data,
    value: '0',
  };

  const safeSdk = await Safe.create({ ethAdapter, safeAddress: safeAddress });
  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
  const signatureObject = web3.eth.accounts.sign(safeTxHash, PRIVATE_KEY);
  const senderSignature = signatureObject.signature;
  //const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
  const proposedTxResponse = await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress,
    senderSignature,
    origin
  });


  console.log('Transaction proposed:', proposedTxResponse);
}
main().catch((error) => {
  console.error('An error occurred:', error);
});