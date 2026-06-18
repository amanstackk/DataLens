import { spawn } from "child_process";

export const runPython = () => {
    return new Promise((resolve, reject) => {

        const pythonProcess = spawn(
            "python",
            ["../python-service/app.py"]
        );

        let data = "";
        let error = "";

        pythonProcess.stdout.on("data", (chunk) => {
            data += chunk.toString();
        });

        pythonProcess.stderr.on("data", (chunk) => {
            error += chunk.toString();
        });

        pythonProcess.on("close", (code) => {

            if (code !== 0) {
                reject(error);
                return;
            }

            resolve(JSON.parse(data));
        });
    });
};