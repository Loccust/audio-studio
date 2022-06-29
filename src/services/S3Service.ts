import { S3 } from "aws-sdk";
import "dotenv/config";

const bucketName = process.env.S3_BUCKET_NAME || "";

export default class S3Service {
  private s3 = new S3();
  uploadFile = async (files: Express.Request["files"]) => {
    if (!files || !Array.isArray(files) || files.length === 0)
      return Promise.reject("Files are required");

    const params = files?.map((file, i) => {
      return {
        Bucket: bucketName,
        Key: `uploads/${i}-${file.originalname}`,
        Body: file.buffer,
      };
    });
    return await Promise.all(
      params.map((param) => this.s3.upload(param).promise())
    );
  };

  deleteFile = async (filePath: string) => {
    const params = {
      Bucket: bucketName,
      Key: `uploads/${filePath}`,
    };
    return await this.s3.deleteObject(params).promise();
  };

  getFileUrl = async (filePath: string) => {
    const params = {
      Bucket: bucketName,
      Key: `uploads/${filePath}`,
    };
    return await this.s3.getObject(params).promise();
  };
}
