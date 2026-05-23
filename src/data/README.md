# Mock data layer

`src/data` is the temporary content source until the public website is connected to the CRM/API.

Keep reusable, structured content here:

- `news.json` for news list/detail content
- `results.json` for result cards and result detail content
- `program.json` for program sections
- `organization.json` for movement bodies, local boards and person cards
- `documents.json` for public documents and downloadable files

Use `src/data/index.ts` from Astro pages and components instead of importing JSON files directly. That helper localizes records, sorts them, builds internal routes and keeps the future API migration in one place.

Example:

```ts
import { getFeaturedNews } from '../data';

const news = getFeaturedNews(lang, 3);
```

When the API is ready, replace the internals of `src/data/index.ts` with fetch calls or adapter functions, while keeping page-level usage mostly unchanged.
