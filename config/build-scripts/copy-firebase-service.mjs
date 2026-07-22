import fs from "fs/promises";
import path from "path";

const source = path.resolve(
    "config/android/firebaseMessagingService"
);

const destination = path.resolve(
    "android/app/src/main/java/za/co/mamamoney/assessments/frontend"
);

async function copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
            console.log(`Copied ${entry.name}`);
        }
    }
}

try {
    await copyDirectory(source, destination);
    console.log("Firebase messaging service copied successfully.");
} catch (error) {
    console.error("Failed to copy Firebase messaging service:", error);
    process.exit(1);
}