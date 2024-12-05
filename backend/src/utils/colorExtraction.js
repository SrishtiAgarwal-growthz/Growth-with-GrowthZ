import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getBackgroundColor = (imageUrl) => {
  return new Promise((resolve, reject) => {
    // Use `path.resolve` to ensure the script is located correctly
    const scriptPath = path.resolve(__dirname, "../utils/backgroundColor.py");
    console.log(`Resolved path to Python script: ${scriptPath}`);

    const pythonProcess = spawn("python", [scriptPath, imageUrl]);

    let color = "";
    let error = "";

    pythonProcess.stdout.on("data", (data) => {
      color += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0 && color) {
        console.log(`[extractBackgroundColor] Python script output: ${color.trim()}`);
        resolve(color.trim()); // Return the `rgb()` string directly
      } else {
        console.error(`Python script error output: ${error}`);
        reject(error || "Python script failed.");
      }
    });
  });
};
