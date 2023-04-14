export const TGPS = [
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