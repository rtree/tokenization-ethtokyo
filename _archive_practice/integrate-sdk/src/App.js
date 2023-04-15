import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { EthersAdapter } from '@safe-global/protocol-kit';

function App() {
  useEffect(() => {
    async function initialize() {
      const web3Provider = window.ethereum;
      const provider = new ethers.providers.Web3Provider(web3Provider);
      const safeOwner = provider.getSigner(0);

      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: safeOwner,
      });

      // Use ethAdapter for further interactions.
    }

    initialize();
  }, []);

  return <div>App</div>;
}

export default App;
