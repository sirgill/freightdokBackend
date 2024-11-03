const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');

const sftp = new SftpClient();

const getFileName=(path)=>{
try{
  let lastIndex = path.lastIndexOf('/');
  let filename = path.substring(lastIndex + 1);
  console.log("Returning filepath:",filename)
  return filename
}
catch(err){
console.log("--Error Occured :--",err.message)
}
}

const connectSFTP=async()=>{
  try{
    await sftp.connect({
      host: 'files.triumphbcap.com',
      port: 22,
      username: 'FREIGHTDOK_SUNNYDBADEEP',
      password: '5158dfZM',
      algorithms: {
        serverHostKey: ['ssh-rsa', 'ssh-dss'] // Specify the host key algorithms supported by the server
      }
    })
  }
  catch(er){
    console.log("Error Encountered [While connecting to SFTP Server Triumph BK]:",er.message)
  }
}



async function connectToSftpServerUploadFile(local) {
    try {
    const remote="/TMS_INPUT/"
    connectSFTP()
    console.log('Connected to SFTP server');
    let fileupload=false;  
    const filename=getFileName(local);
    console.log("filename : ",filename)
    const remoteFilePath = `${remote}${filename}`;
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
    console.log("Remote Path : ",remoteFilePath)
    console.log("Local Path : ",local)
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")

    // Upload the file
    await sftp.put(local, remoteFilePath);
    fileupload=true
    console.log(`File uploaded successfully to ${remoteFilePath}`);
    // Disconnect from the SFTP server
    await sftp.end();
    return fileupload;
    } catch (err) {
      console.error('Error connecting to SFTP server:', err.message);
    }
  }



module.exports=connectToSftpServerUploadFile
