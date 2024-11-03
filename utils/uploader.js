const axios = require('axios').default;
const fs = require("fs")
const FormData = require('form-data');
const path = require("path")
const uploadServerURL = 'http://18.220.161.91:7777/upload';

const uploader = async (files, id, filePath = '../documents/load') => {
  //Extra Check added if file stream is already available dont make another one
  const isFileStream=files.isStream?true:false;
  const filenames=isFileStream?files.filenames:[];
  files=isFileStream?files.allFiles:files

  console.log("isFileStream",files)

  // ==============================================
  return await new Promise((resolve, reject) => {
    try {
      setTimeout(async () => {
        let data = await Promise.all(files.map(async (file,fileIndex) => {
          var data = new FormData();
          data.append('sampleFile', isFileStream?file:fs.createReadStream(path.join(__dirname, filePath, file.name || file.filename)));
          var config = {
            method: 'post',
            url: uploadServerURL,
            headers: {
              ...data.getHeaders()
            },
            data: data
          };
          let fileuploadResponse = await axios(config);
          console.log("File uploaded successfully !",fileuploadResponse.data)
          if (fileuploadResponse.data.status) {
            return ({ fileType: file.fieldname?file.fieldname:filenames[fileIndex], fileLocation: fileuploadResponse.data.fileData.Location })
          }
        }))
        resolve({ success: true, data: data, message: "All Files Successfully Uploded !" })
      }, 2500);
    }
    catch (err) {
      resolve({ success: false, message: "Failed To Upload To S3 Bucket Reason :" + err.message })
    }
  })
}


module.exports = uploader