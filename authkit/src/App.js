import React, { useEffect, useState } from 'react';
import {
  SafeAuthProvider,
  useSafeAppsSDK,
} from '@gnosis.pm/safe-apps-react-sdk';
import { Web3AuthAdapter } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import Web3 from 'web3';
import { ethers } from 'ethers';
import './App.css';

const App = () => {
  const { sdk, connected, safe } = useSafeAppsSDK();
  const [web3AuthAdapter, setWeb3AuthAdapter] = useState(null);

  useEffect(() => {
    if (connected) {
      const initWeb3AuthAdapter = async () => {
        const options = {
          clientId: process.env.REACT_APP_WEB3AUTH_CLIENT_ID,
          web3AuthNetwork: 'testnet',
          chainConfig: {
            chainId: safe.chainId.toString(),
            rpcUrl: safe.network.rpcUri,
          },
        };
        const modalConfig = {};
        const openloginAdapter = new OpenloginAdapter();
        const adapter = new Web3AuthAdapter(
          options,
          [openloginAdapter],
          modalConfig,
        );
        setWeb3AuthAdapter(adapter);
      };

      initWeb3AuthAdapter();
    }
  }, [connected, safe.chainId, safe.network.rpcUri]);

  const signIn = async () => {
    if (web3AuthAdapter) {
      await web3AuthAdapter.signIn();
      console.log('Signed in with address:', web3AuthAdapter.provider.address);
    }
  };

  const signOut = async () => {
    if (web3AuthAdapter) {
      await web3AuthAdapter.signOut();
      console.log('Signed out');
    }
  };

  const sendTransaction = async () => {
    if (web3AuthAdapter) {
      const web3 = new Web3(web3AuthAdapter.provider);
      const accounts = await web3.eth.getAccounts();
      const tx = {
        from: accounts[0],
        to: accounts[0],
        value: web3.utils.toWei('0.01', 'ether'),
      };
      const txHash = await web3.eth.sendTransaction(tx);
      console.log('Transaction sent:', txHash);
    }
  };

  if (!connected) {
    return <div>Connecting to Safe...</div>;
  }

  return (
    <div className="App">
      <h1>Safe Auth Example</h1>
      <button onClick={signIn}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={sendTransaction}>Send Transaction</button>
    </div>
  );
};

const SafeApp = () => (
  <SafeAuthProvider loading={<div>Loading...</div>}>
    <App />
  </SafeAuthProvider>
);

export default SafeApp;
