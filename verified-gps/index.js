import Web3 from 'web3'
import { Web3Adapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'

const txServiceUrl = 'https://safe-transaction-goerli.safe.global/'

async function main() {
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed. Please install MetaMask and try again.')
    return
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' })

  const web3 = new Web3(window.ethereum)
  const [senderAddress] = await web3.eth.getAccounts()

  const safeOwner = senderAddress
  const safeAddress = '0x0914566875dF1b7Fb6cb67c55058194D6a0616c3'

  const ethAdapter = new Web3Adapter({
    web3,
    signerAddress: safeOwner
  })

  const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })

  const contractAddress = '0xCBE177C44Cff283701f82e69526677a896F1f4b1'
  const param1 = '111111111'
  const param2 = '1111111111'

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
  )

  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 300000;
  const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');

  const safeTransactionData = {
    from: senderAddress,
    to: contractAddress,
    data,
    value: '0',
    safeTxGas: 100
  };
  
  const safeSdk = await Safe.create({ ethAdapter, safeAddress: safeAddress })
  const options = {
    from: senderAddress,
    gas: 300000,
    gasPrice: 10,
    nonce: await web3.eth.getTransactionCount(senderAddress, 'latest')
  };
  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData })

  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
  const senderSignature = await safeSdk.signTransactionHash(safeTxHash)
  const proposedTxResponse = await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress,
    senderSignature: senderSignature.data,
    origin
  })

  console.log('Transaction proposed:', proposedTxResponse)
}
document.getElementById('execute').addEventListener('click', () => {
  main().catch((error) => {
    console.error('An error occurred:', error)
  })
})


