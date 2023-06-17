import { access, constants, mkdir, writeFile } from "fs/promises";
import { parse } from "node-html-parser";
import epub from "epub-gen-memory";

const rrUrl = "https://www.royalroad.com";

if (process.argv.length < 3) throw new Error("No url provided");

const bookUrl = process.argv[2];
const bookHtml = await fetch(bookUrl).then((res) => res.text());
const parsedHtml = parse(bookHtml);

const title = parsedHtml.querySelector(".fic-title h1")?.text || "No title";
const author = parsedHtml.querySelector(".fic-title a")?.text || "No author";
const coverImg = parsedHtml
  .querySelector(".fic-header img")
  ?.getAttribute("src");

const chapters = parsedHtml.querySelectorAll(
  ".chapter-row > td:not(.text-right) > a"
);

const bookData: {
  title: string;
  author: string;
  version: number;
  publisher: string;
  cover: string;
  verbose?: boolean;
  url: string;
  content: {
    title: string;
    url?: string;
    index: number;
    content: string;
  }[];
} = {
  title,
  author,
  version: 3,
  publisher: "Royal Road",
  cover: coverImg?.replace(/\?.*/, "") || "",
  url: bookUrl,
  content: [],
};

for (const chapter of chapters) {
  const chapterUrl = rrUrl + chapter.getAttribute("href");
  const html = await fetch(chapterUrl).then((res) => res.text());

  const chapterHtml = parse(html);

  const chapterTitle = chapterHtml.querySelector(".fic-header h1")?.text;
  const chapterTitleAlphanumberic = chapterTitle?.replace(/[^a-z0-9 ]/gi, "");

  const data = chapterHtml.querySelector(".chapter-content")?.innerHTML;

  bookData.content.push({
    title: chapterTitleAlphanumberic || "No title",
    url: chapterUrl,
    index: bookData.content.length + 1,
    content: data || "No content",
  });

  console.log(
    "Scraped chapter index: ",
    bookData.content.length + "/" + chapters.length
  );
}

async function exists(filepath: string) {
  try {
    await access(filepath, constants.F_OK);

    return true;
  } catch (err) {
    return false;
  }
}

if (!(await exists("./epubs"))) await mkdir("./epubs");

const slugTitle = title.replace(/[^a-z0-9 ]/gi, "");

const content = await epub.default(bookData, bookData.content);

await writeFile(`./epubs/${slugTitle}.epub`, Buffer.from(content));
