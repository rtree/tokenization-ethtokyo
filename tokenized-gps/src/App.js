import React, { useState } from "react";
import Web3 from "web3";
import { TGPS } from "./abi/abi";
import './App.css';


const web3 = new Web3(Web3.givenProvider);
const contractAddress = "0xCBE177C44Cff283701f82e69526677a896F1f4b1";
const TGPSContract = new web3.eth.Contract(TGPS, contractAddress);

function App() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [storedLocation, setStoredLocation] = useState(null);

  const storeLocation = async () => {
    if (location.latitude && location.longitude) {
      const accounts = await window.ethereum.enable();
      const account = accounts[0];
      const intLatitude = Math.round(location.latitude * 1e7);
      const intLongitude = Math.round(location.longitude * 1e7);
      const gas = await TGPSContract.methods
        .set(intLatitude, intLongitude)
        .estimateGas();
      await TGPSContract.methods
        .set(intLatitude, intLongitude)
        .send({ from: account, gas });
    }
  };
  const getStoredLocation = async () => {
    const result = await TGPSContract.methods.get().call();
    const storedLatitude = parseFloat(result[0]) / 1e7;
    const storedLongitude = parseFloat(result[1]) / 1e7;
    setStoredLocation({ latitude: storedLatitude, longitude: storedLongitude });
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="main">
      <div className="card">
        <button onClick={getLocation}>Get GPS Location</button>
        {location.latitude && location.longitude && (
          <p>
            Latitude, Longitude = {location.latitude}, {location.longitude}
          </p>
        )}
        <button className="button" onClick={storeLocation} type="button">
          Store GPS Location
        </button>
      </div>
      <div className="card">
        <button className="button" onClick={getStoredLocation} type="button">
          Get Stored GPS Location
        </button>
        {storedLocation && (
          <p>
            Stored Latitude, Longitude = {storedLocation.latitude}, {storedLocation.longitude}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
