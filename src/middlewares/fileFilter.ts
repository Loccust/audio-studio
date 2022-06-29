import Router from "express";
import multer from "multer";

const fileFilter = (
  req: Router.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const isAcceptedFile = file.mimetype === "audio/mpeg";
  cb(null, isAcceptedFile);
};
export default fileFilter;