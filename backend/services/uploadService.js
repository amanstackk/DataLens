export const processUpload = (file) => {
    return {
        success: true,
        message: "File uploaded successfully",
        filename: file.filename,
        filepath: file.path
    };
};