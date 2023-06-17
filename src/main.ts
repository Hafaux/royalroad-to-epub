import { mkdir, writeFile } from "fs/promises";
import RoyalRoadEpub from "../lib/RoyalRoadEpub.js";
import { exists } from "./utils.js";

if (process.argv.length < 3) throw new Error("No fiction url provided");

const bookUrl = process.argv[2];

console.time("Time taken");

const book = await RoyalRoadEpub.getEpub(bookUrl, { verbose: true });

console.timeEnd("Time taken");

if (!(await exists("./epubs"))) await mkdir("./epubs");

await writeFile(`./epubs/${book.title}.epub`, book.epubBuffer);
