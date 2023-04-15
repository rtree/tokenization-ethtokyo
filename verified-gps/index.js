import Web3 from 'web3'
import { Web3Adapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'

const txServiceUrl = 'https://safe-transaction-goerli.safe.global/'

function displayLatLong(latitude, longitude) {
  // Update the content of the HTML element with the retrieved data
  document.getElementById('currentCoordinates').innerHTML = `Lat: ${latitude}, Long: ${longitude}`;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Display the user's latitude and longitude
        displayLatLong(latitude, longitude);

        resolve({
          latitude,
          longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}
async function getCoordinates() {
  const contractAddress = '0xCBE177C44Cff283701f82e69526677a896F1f4b1';
  const web3 = new Web3(window.ethereum);
  
  const contractAbi = [
    {
      "inputs": [
        {
          "internalType": "int256",
          "name": "latitude",
          "type": "int256"
        },
        {
          "internalType": "int256",
          "name": "longitude",
          "type": "int256"
        }
      ],
      "name": "set",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [
        {
          "internalType": "int256",
          "name": "latitude",
          "type": "int256"
        },
        {
          "internalType": "int256",
          "name": "longitude",
          "type": "int256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];

  const contract = new web3.eth.Contract(contractAbi, contractAddress);
  const coordinates = await contract.methods.get().call();
  const [latitude, longitude] = [coordinates.latitude, coordinates.longitude];
  console.log('Stored coordinates:', { latitude, longitude });

  // Update the content of the HTML element with the retrieved data
  document.getElementById('coordinates').innerHTML = `Lat: ${latitude}, Long: ${longitude}`;
}

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


  //const param1 = '111111111'
  //const param2 = '1111111111'
  // Request user's geolocation
  const { latitude, longitude } = await getCurrentPosition();
  const param1 = Math.round(latitude * 1e7);
  const param2 = Math.round(longitude * 1e7);

  const data = web3.eth.abi.encodeFunctionCall(
    {
      name: 'set',
      type: 'function',
      inputs: [
        { type: 'int256', name: 'latitude' },
        { type: 'int256', name: 'longitude' },
      ],
    },
    [param1, param2]
  )

  /*
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 600000;
  const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');
  */

  const safeTransactionData = {
    from: senderAddress,
    to: contractAddress,
    data,
    value: '0',
    safeTxGas: 80000,
    operation: 0,
    baseGas: 0,
    gasPrice: 0,
    gasToken: '0x0000000000000000000000000000000000000000',
    refundReceiver: '0x0000000000000000000000000000000000000000',
  };
  
  const safeSdk = await Safe.create({ ethAdapter, safeAddress: safeAddress })
  /*
  const options = {
    from: senderAddress,
    gas: 900000,
    gasPrice: 300,
    nonce: await web3.eth.getTransactionCount(senderAddress, 'latest')
  };
  */

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
});

document.getElementById('retrieve').addEventListener('click', () => {
  getCoordinates().catch((error) => {
    console.error('An error occurred:', error);
  });
});

