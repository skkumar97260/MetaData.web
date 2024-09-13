import S3 from "aws-sdk/clients/s3";

export const uploadFile = async (file, FOLDER) => {
  const contentType = file.type;
  const bucket = new S3({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region:process.env.REACT_APP_AWS_S3_REGION,
  });

  const params = {
    Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
    Key: FOLDER + file.name,
    Body: file,
    ACL: "public-read",
    ETag: "ETag",
    ContentType: contentType,
  };
  return new Promise((resolve, reject) => {
    bucket.upload(params, function (err, data) {
      if (err) {
        console.log("There was an error uploading your file: ", err);
        reject(err);
      }
      console.log("Successfully uploaded file.", data.Location);
      resolve(data);
    });
  });
};
