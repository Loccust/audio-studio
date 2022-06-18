import * as fs from "fs";

export default class FileHelper {

  static deleteFile(filepath: string) {
    try {
      fs.unlinkSync(filepath);
    } catch (err) {
      console.error(`erro ao deletar arquivo: ${err}`);
    }
  }
  
}
