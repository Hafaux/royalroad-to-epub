# RoyalRoad To Epub

Provide a link to a RR fiction to generate an .epub file.

## Example

```typescript
import RoyalRoadEpub from "../lib/RoyalRoadEpub";
import { writeFile } from "fs/promises";

const { title, epubBuffer } = await RoyalRoadEpub.getEpub(bookUrl);

await writeFile(`${title}.epub`, epubBuffer);
```

<img src="https://i.imgur.com/dUCZtLK.png">

<img width="50%" src="https://cdn.discordapp.com/attachments/522517154180890635/1119666361619202108/IMG_2492.png">
