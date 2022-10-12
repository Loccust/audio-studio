import * as fs from "fs";
import path from "path";

export default class FileHelper {
  static deleteFile(filepath: string) {
    try {
      fs.unlinkSync(filepath);
    } catch (err) {
      console.error(`erro ao deletar arquivo: ${err}`);
    }
  }

  static cleanDirectory(directory: string){
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      }
    });
  }

  static getBufferFile(filepath: string) {
    try {
      return fs.readFileSync(filepath);
    } catch (err) {
      console.error(`erro ao obter informações do arquivo: ${err}`);
    }
  }

  static async saveLocalFile(buffer: Buffer, outputPath: string) {
    try {
      await fs.promises.writeFile(outputPath, buffer);
      return outputPath;
    } catch (err) {
      console.error(`erro ao deletar arquivo: ${err}`);
      return "";
    }
  }
}
