import "dotenv/config";
import { Telegraf } from "telegraf";
import {
    downloadMedia,
    downloadAudioMp3,
    deleteFile,
    isAllowedUrl
} from "./downloader.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

const userLinks = new Map();

bot.start((ctx) => {
    ctx.reply(
        "Salom! YouTube yoki Instagram public link yuboring. Men uni MP4 video yoki MP3 audio qilib yuboraman."
    );
});

bot.on("text", async (ctx) => {
    const text = ctx.message.text.trim();

    if (!isAllowedUrl(text)) {
        return ctx.reply("Iltimos, YouTube yoki Instagram link yuboring.");
    }

    userLinks.set(ctx.from.id, text);

    await ctx.reply("Qaysi formatda yuklaymiz?", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🎵 MP3 audio", callback_data: "download_mp3" }],
                [{ text: "🎬 MP4 video", callback_data: "download_video" }]
            ]
        }
    });
});

bot.action("download_mp3", async (ctx) => {
    await ctx.answerCbQuery();

    const url = userLinks.get(ctx.from.id);

    if (!url) {
        return ctx.reply("Link topilmadi. Qaytadan link yuboring.");
    }

    await ctx.reply("MP3 tayyorlanmoqda...");

    let filePath;

    try {
        filePath = await downloadAudioMp3(url);

        await ctx.replyWithAudio(
            { source: filePath },
            {
                caption: "MP3 tayyor ✅"
            }
        );
    } catch (error) {
        console.error(error);
        await ctx.reply(
            "MP3 tayyorlab bo‘lmadi. ffmpeg o‘rnatilganini yoki link public ekanini tekshiring."
        );
    } finally {
        deleteFile(filePath);
    }
});

bot.action("download_video", async (ctx) => {
    await ctx.answerCbQuery();

    const url = userLinks.get(ctx.from.id);

    if (!url) {
        return ctx.reply("Link topilmadi. Qaytadan link yuboring.");
    }

    await ctx.reply("Video yuklanmoqda...");

    let filePath;

    try {
        filePath = await downloadMedia(url);

        await ctx.replyWithVideo(
            { source: filePath },
            {
                caption: "Video tayyor ✅"
            }
        );
    } catch (error) {
        console.error(error);
        await ctx.reply(
            "Video yuklab bo‘lmadi. Link private, hajmi katta yoki ruxsat cheklangan bo‘lishi mumkin."
        );
    } finally {
        deleteFile(filePath);
    }
});

bot.catch((error, ctx) => {
    console.error("Bot error:", error);
    ctx.reply("Kutilmagan xatolik yuz berdi.");
});

bot.launch();

console.log("Bot ishga tushdi");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));