const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3800; // You can choose any available port

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define an API key (replace with your actual API key)
const apikey = 'loki';

app.post('/reboot', (req, res) => {
  // Add security measures here to validate access, e.g., check the API key
  const requestApiKey = req.header('API-Key');
  if (requestApiKey !== apikey) {
    res.status(403).send('Access denied: Invalid API key.');
    return;
  }

  // Execute the reboot command (ensure that the user running the Node.js app has the necessary permissions)
  exec('sudo reboot', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      res.status(500).send('Error occurred while rebooting the server.');
    } else {
      console.log(`Server rebooted: ${stdout}`);
      res.send('Server rebooted successfully.');
    }
  });
});

app.post('/enable-ip-forwarding', (req, res) => {
  // Extract the API key from the request headers
  const requestApiKey = req.header('API-Key');

  // Check if the provided API key matches the valid API key
  if (requestApiKey !== apikey) {
    res.status(403).send('Invalid API key.');
    return;
  }

  // Execute the command to enable IP forwarding
  exec('sudo sed -i "s/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/" /etc/sysctl.d/99-sysctl.conf', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      res.status(500).send('Error occurred while enabling IP forwarding.');
    } else {
      console.log(`IP forwarding enabled: ${stdout}`);
      res.send('IP forwarding enabled successfully. You may need to reboot for the changes to take effect.');
    }
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});






