import { existsSync, mkdirSync, writeFileSync } from "fs";
import { parse } from "node-html-parser";

const rrUrl = "https://www.royalroad.com";
const bookUrl =
  "https://www.royalroad.com/fiction/65629/the-game-at-carousel-a-horror-movie-litrpg";

const bookHtml = await fetch(bookUrl).then((res) => res.text());

const parsedHtml = parse(bookHtml);

const title = parsedHtml.querySelector(".fic-title h1")?.text || "No title";
const chapters = parsedHtml.querySelectorAll(
  ".chapter-row > td:not(.text-right) > a"
);

const bookData: {
  title: string;
  link: string;
  chapters: {
    title: string;
    index: number;
    content: string;
  }[];
} = {
  title,
  link: bookUrl,
  chapters: [],
};

for (const chapter of chapters) {
  const html = await fetch(rrUrl + chapter.getAttribute("href")).then((res) =>
    res.text()
  );

  const chapterHtml = parse(html);

  const chapterTitle = chapterHtml.querySelector(".fic-header h1")?.text;
  const content = chapterHtml.querySelector(".chapter-content")?.innerHTML;

  bookData.chapters.push({
    title: chapterTitle || "No title",
    index: bookData.chapters.length + 1,
    content: content || "No content",
  });

  console.log("Scraped chapter index: ", bookData.chapters.length);
}

if (!existsSync("./books")) mkdirSync("./books");

writeFileSync(
  `./books/${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.json`,
  JSON.stringify(bookData, null, 2),
  {}
);
