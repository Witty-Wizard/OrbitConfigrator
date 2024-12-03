import { useEffect, useState } from "react";
import { Box, Button, TextField, Autocomplete } from "@mui/material";

const Setup = () => {
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [Data, setData] = useState(null);

  const getPorts = async () => {
    try {
      const ports = await window.mavlink.listSerialPorts();
      setAvailablePorts(ports);
    } catch (error) {
      console.error("Error fetching serial ports:", error);
    }
  };

  const handleConnect = async () => {
    if (selectedPort) {
      try {
        const response = await window.mavlink.connectPort(selectedPort);
        console.log(`Attempting to connect to ${selectedPort}`);
        setIsConnected(response);
      } catch (error) {
        console.error("Error connecting to port:", error);
      }
    } else {
      console.error("No port selected");
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await window.mavlink.disconnectPort();
      console.log(response);
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting from port:", error);
    }
  };

  useEffect(() => {
    const mavLinkDataListener = (event, data) => {
      setData(data);
      console.log(data);
    };
    window.mavlink.onMavLinkData(mavLinkDataListener);
    return () => {
      window.mavlink.onMavLinkData(null);
    };
  }, []);

  return (
    <Box sx={{ maxWidth: 160 }}>
      <Box onClick={getPorts}>
        <Autocomplete
          freeSolo
          id="port-select"
          options={availablePorts.map((port) => port.path)}
          value={selectedPort}
          onChange={(event, newValue) => {
            setSelectedPort(newValue || "");
          }}
          onInputChange={(event, newInputValue) => {
            setSelectedPort(newInputValue);
          }}
          disabled={isConnected}
          renderInput={(params) => (
            <TextField {...params} label="Port" variant="outlined" />
          )}
        />
      </Box>

      <Button
        variant="contained"
        color={isConnected ? "secondary" : "primary"}
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={!selectedPort}
        sx={{ mt: 2 }}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </Button>
    </Box>
  );
};

export default Setup;