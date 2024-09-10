const multer = require("multer");
const { MimeType } = require("../constant");
const FIleHandler = () => {
  try {
    return multer({
      storage: multer.memoryStorage(),
      fileFilter: function (req, file, cb) {
        if (
          ![MimeType.PNG, MimeType.JPEG, MimeType.JPG, MimeType.WEBP].includes(
            file.mimetype
          )
        ) {
          return cb(null, false, new Error("goes wrong on the mimetype"));
        }
        req.body.contain_file = true;
        cb(null, true);
      },
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = FIleHandler;
