const axios = require('axios').default;
const fs = require("fs")
const FormData = require('form-data');
const path = require("path")
const uploadServerURL = 'http://3.6.22.119:7777/upload';

const uploader = async (files, id, filePath = '../documents/load') => {
  // ==============================================
  return await new Promise((resolve, reject) => {
    try {
      setTimeout(async () => {
        let data = await Promise.all(files.map(async (file) => {
          var data = new FormData();
          data.append('sampleFile', fs.createReadStream(path.join(__dirname, filePath, file.name || file.filename)));
          var config = {
            method: 'post',
            url: uploadServerURL,
            headers: {
              ...data.getHeaders()
            },
            data: data
          };
          let fileuploadResponse = await axios(config);
          // console.log(fileuploadResponse.data)
          if (fileuploadResponse.data.status) {
            return ({ fileType: file.fieldname, fileLocation: fileuploadResponse.data.fileData.Location })
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