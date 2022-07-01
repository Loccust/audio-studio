import { S3 } from "aws-sdk";
import "dotenv/config";

const bucketName = process.env.S3_BUCKET_NAME || "";
const s3 = new S3();

export default class S3Provider {
  static uploadFile = async (buffer: Buffer, filename: string) => {
    const params = {
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
    };
    return await s3.upload(params).promise();
  };

  static deleteFile = async (filePath: string) => {
    const params = {
      Bucket: bucketName,
      Key: filePath,
    };
    return await s3.deleteObject(params).promise();
  };

  static getFileUrl = async (filePath: string) => {
    const params = {
      Bucket: bucketName,
      Key: filePath,
    };
    return await s3.getObject(params).promise();
  };
}