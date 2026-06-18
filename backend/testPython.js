import { runPython } from "./services/pythonService.js";

try {
    const result = await runPython();

    console.log("Python Result:");
    console.log(result);
} catch (error) {
    console.error("Python Error:");
    console.error(error);
}