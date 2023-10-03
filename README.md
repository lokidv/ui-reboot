sudo apt udpate 

install ndoejs
```
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
```
```
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
```
```
NODE_MAJOR=20`
```
```
sudo apt-get update
sudo apt-get install nodejs -y
```
and done nodejs
next create project
```
mkdir server-reboot-app
cd server-reboot-app
npm init -y
npm install express child_process

```
create app.js
```
nano app.js
```
and copy 
```
const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3800; // You can choose any available port

// Serve static files from the 'public' directory
app.use(express.static('/root/server-reboot-app/public'));

// Define an API key (replace with your actual API key)
const apikey = 'loki';
app.get('/', (req, res) => {
  // This can be an optional route or a redirection to your main HTML page.
  res.sendFile('/root/server-reboot-app/public/index.html');
});

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


```
and 
```
mkdir public
nano index.html
```
and copy 
```
<!DOCTYPE html>
<html>
<head>
  <title>Server Reboot</title>
</head>
<body>
  <h1>Server Reboot</h1>
  <p>Enter your API key and click the button below to reboot the server:</p>
  <input type="text" id="apiKeyInput" placeholder="Enter API Key">


  <button id="rebootButton">Reboot Server</button>
  <button id="enableIpForwardingButton">Enable IP Forwarding</button>
  <p id="message"></p>
  <script>
    document.getElementById('rebootButton').addEventListener('click', () => {
      const apiKey = document.getElementById('apiKeyInput').value;
      // Send a request to trigger the reboot with the entered API key
      fetch('/reboot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': apiKey
        }
      })
        .then(response => response.text())
        .then(data => {
          document.getElementById('message').textContent = data; // Display a message from the server
        })
        .catch(error => {
          console.error('Error:', error);
          document.getElementById('message').textContent = 'An error occurred while rebooting the server.';
        });
    });


  document.getElementById('enableIpForwardingButton').addEventListener('click', () => {
      const apiKey = document.getElementById('apiKeyInput').value;
      // Send a request to enable IP forwarding with the entered API key
      fetch('/enable-ip-forwarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': apiKey
        }
      })
        .then(response => response.text())
        .then(data => {
          document.getElementById('message').textContent = data; // Display a message from the server
        })
        .catch(error => {
          console.error('Error:', error);
          document.getElementById('message').textContent = 'An error occurred while enabling IP forwarding.';
        });
    });



  </script>
</body>
</html>

```
then we should create service
```
nano /etc/systemd/system/removeui.service

[Unit]
Description=Tunnel WireGuard with udp2raw
After=network.target

[Service]
Type=simple
User=root
ExecStart=sudo node /root/server-reboot-app/app.js
Restart=no

[Install]
WantedBy=multi-user.target

```
and finally
```
systemctl enable --now removeui.service
```



