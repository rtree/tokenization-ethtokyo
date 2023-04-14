pragma solidity >=0.5.8;

contract GPSStorage {
    int256 private storedLatitude;
    int256 private storedLongitude;

    function set(int256 latitude, int256 longitude) public {
        storedLatitude = latitude;
        storedLongitude = longitude;
    }

    function get() public view returns (int256 latitude, int256 longitude) {
        return (storedLatitude, storedLongitude);
    }
}
