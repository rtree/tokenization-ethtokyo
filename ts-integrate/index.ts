import Web3 from 'web3'
import { Web3Adapter } from '@safe-global/protocol-kit'
const { INFURA_API_KEY } = process.env;

const provider = new Web3.providers.HttpProvider(INFURA_API_KEY)
const web3 = new Web3(provider)
const safeOwner = '0x485A974140923524a74B0D72aF117852F31B412D'

const ethAdapter = new Web3Adapter({
  web3,
  signerAddress: safeOwner
})