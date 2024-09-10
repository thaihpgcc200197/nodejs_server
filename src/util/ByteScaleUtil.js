const Bytescale = require("@bytescale/sdk");
const nodeFetch = require("node-fetch");
const {
  BYTE_SCALE_PUBLIC_KEY,
  BYTE_SCALE_SECRET_KEY,
  BYTE_SCALE_ACCOUNT_ID,
} = require("../env");
const BytescaleUtil = {
  async Upload(file, storage_path) {
    const upload_manager = new Bytescale.UploadManager({
      fetchApi: nodeFetch,
      apiKey: BYTE_SCALE_PUBLIC_KEY,
    });

    const { fileUrl, filePath } = await upload_manager.upload({
      data: file.buffer,
      mime: file.mimetype,
      originalFileName: file.originalname,
      path: {
        folderPath: storage_path,
      },
    });

    return { file_url: fileUrl, file_path: filePath };
  },
  Delete(file_path) {
    const file_api = new Bytescale.FileApi({
      fetchApi: nodeFetch,
      apiKey: BYTE_SCALE_SECRET_KEY,
    });

    file_api
      .deleteFile({
        accountId: BYTE_SCALE_ACCOUNT_ID,
        filePath: file_path,
      })
      .then(() => console.log("Delete file success: " + file_path));
  },
  DeleteMultiple(file_paths) {
    const file_api = new Bytescale.FileApi({
      fetchApi: nodeFetch,
      apiKey: BYTE_SCALE_SECRET_KEY,
    });

    file_api
      .deleteFileBatch({
        accountId: BYTE_SCALE_ACCOUNT_ID,
        deleteFileBatchRequest: { files: file_paths },
      })
      .then((result) => {
        console.log("Delete file success: ");
        console.log(result);
      });
  },
};

module.exports = BytescaleUtil;
