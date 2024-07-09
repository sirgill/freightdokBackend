const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');

const sftp = new SftpClient();

async function connectToSftpServer() {
    try {
     const ans= await sftp.connect({
        host: 'files.triumphbcap.com',
        port: 22,
        username: 'FREIGHTDOK_SUNNYDBADEEP',
        password: '5158dfZM',
        algorithms: {
          serverHostKey: ['ssh-rsa', 'ssh-dss'] // Specify the host key algorithms supported by the server
        }
      });
      console.log('Connected to SFTP server');
      
      // Perform SFTP operations here
      
      // await sftp.end();
      // console.log('Disconnected from SFTP server');
    } catch (err) {
      console.error('Error connecting to SFTP server:', err.message);
    }
  }



module.exports=connectToSftpServer
