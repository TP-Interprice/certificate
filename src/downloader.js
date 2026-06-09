import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const downloadsDir = path.resolve("downloads");

if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

export function isAllowedUrl(url) {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|instagram\.com)\//i.test(url);
}

function findDownloadedFile(id) {
    const file = fs
        .readdirSync(downloadsDir)
        .find((name) => name.startsWith(id + "."));

    if (!file) {
        throw new Error("Fayl topilmadi");
    }

    return path.join(downloadsDir, file);
}

export function downloadMedia(url) {
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        const output = path.join(downloadsDir, `${id}.%(ext)s`);

        const args = [
            "--no-playlist",
            "-f",
            "mp4/best",
            "--max-filesize",
            "45M",
            "--merge-output-format",
            "mp4",
            "-o",
            output,
            url
        ];

        execFile("yt-dlp", args, { timeout: 180000 }, (error) => {
            if (error) return reject(error);

            try {
                resolve(findDownloadedFile(id));
            } catch (err) {
                reject(err);
            }
        });
    });
}

export function downloadAudioMp3(url) {
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        const output = path.join(downloadsDir, `${id}.%(ext)s`);

        const args = [
            "--no-playlist",
            "-x",
            "--audio-format",
            "mp3",
            "--audio-quality",
            "0",
            "--max-filesize",
            "45M",
            "-o",
            output,
            url
        ];

        execFile("yt-dlp", args, { timeout: 180000 }, (error) => {
            if (error) return reject(error);

            try {
                resolve(findDownloadedFile(id));
            } catch (err) {
                reject(err);
            }
        });
    });
}

export function deleteFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}