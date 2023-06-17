import { HTMLElement, parse } from "node-html-parser";
import epub, { Options, Chapter } from "epub-gen-memory";

const selectors = {
  title: ".fic-title h1",
  author: ".fic-title a",
  coverImg: ".fic-header img",
  chapterLinks: ".chapter-row > td:not(.text-right) > a",
  chapterTitle: ".fic-header h1",
  chapterData: ".chapter-content",
};

export default class RoyalRoadEpub {
  static RR_URL = "https://www.royalroad.com";
  private static verbose = false;

  private constructor() {}

  static async getBookData(dom: HTMLElement) {
    const title = dom.querySelector(selectors.chapterTitle)?.text;
    const author = dom.querySelector(selectors.author)?.text;
    const coverImg = dom.querySelector(selectors.coverImg)?.getAttribute("src");

    const bookData: Options = {
      title: title?.trim() || "No title",
      author,
      version: 3,
      publisher: "Royal Road",
      cover: coverImg?.replace(/\?.*/, "") || "",
    };

    return bookData;
  }

  static async scrapeChapters(dom: HTMLElement): Promise<Chapter[]> {
    const chapterLinks = dom.querySelectorAll(selectors.chapterLinks);

    const chapterData = chapterLinks.map(async (chapter) => {
      const chapterUrl = RoyalRoadEpub.RR_URL + chapter.getAttribute("href");
      const html = await fetch(chapterUrl).then((res) => res.text());

      const chapterHtml = parse(html);

      const title = chapterHtml.querySelector(selectors.chapterTitle)?.text;
      const data = chapterHtml.querySelector(selectors.chapterData)?.innerHTML;

      return {
        title: title?.replace(/[^a-z0-9 ]/gi, "") || "No title",
        url: chapterUrl,
        content: data || "No content",
      };
    });

    return Promise.all(chapterData);
  }

  static async getEpub(
    bookUrl: string,
    options: {
      verbose?: boolean;
    } = {}
  ) {
    RoyalRoadEpub.verbose = options.verbose || false;

    RoyalRoadEpub.log("Fetching book html...");

    const bookHtml = await fetch(bookUrl).then((res) => res.text());
    const dom = parse(bookHtml);

    RoyalRoadEpub.log("Getting book data...");

    const bookData = await RoyalRoadEpub.getBookData(dom);

    RoyalRoadEpub.log("Scraping chapters...");

    const chapterData = await RoyalRoadEpub.scrapeChapters(dom);

    RoyalRoadEpub.log("Generating epub...");

    const epubBuffer = await epub.default(bookData, chapterData);
    const title = bookData.title.replace(/[^a-z0-9 ]/gi, "");

    RoyalRoadEpub.log("Done!");

    return { epubBuffer, title };
  }

  private static log(...args: unknown[]) {
    if (!RoyalRoadEpub.verbose) return;

    console.log("RoyalRoadEpub -", ...args);
  }
}
