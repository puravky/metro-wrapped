# Metro Wrapped

**Your year, between stations.**

Metro Wrapped is a light, mobile-first Delhi Metro year-in-review. Choose a regular journey, answer a few questions about how you travel, and get an estimated annual commute summary plus a shareable Metro archetype card.

[Try Metro Wrapped](https://metro-wrapped.vercel.app)

## What it does

- Guides riders through a four-stop, Metro-inspired questionnaire.
- Searches a versioned network of 240 Delhi Metro stations.
- Calculates the route, stops, interchanges, distance, estimated time and fare.
- Projects annual rides, kilometres, spend and hours from the rider's routine.
- Assigns one of several rule-based commuter archetypes.
- Generates a compact share card for download, WhatsApp, X and Instagram.
- Gives every result a shareable URL with its own social preview.

## Privacy

Metro Wrapped has no accounts and no database for the core experience. Station selections remain in the browser. Shared result URLs contain only aggregate result data, not the rider's origin or destination.

The calculations are playful estimates, not official journey records.

## Local development

Requirements:

- Node.js 20 or newer
- npm

```bash
git clone https://github.com/puravky/metro-wrapped.git
cd metro-wrapped
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`NEXT_PUBLIC_SITE_URL` controls the absolute URLs used for result pages and social cards. The example environment file points to the production site.

## Validation

Run the complete pre-release check:

```bash
npm run validate:data
npm run typecheck
npm run build
```

The data validator checks station references, line topology and segment consistency before the application is built.

## How the estimate works

The app finds a shortest path through the network with an interchange penalty, then combines that route with the answers supplied by the rider.

Annual projections assume:

- two one-way rides per selected travel day;
- 48 active travel weeks per year;
- coordinate-derived segment distances;
- distance-slab fares with the selected payment discount; and
- estimated per-station and interchange travel time.

Because the app does not connect to a Metro card or live DMRC account, every number is deliberately labelled as an estimate.

## Transit data

The included snapshot covers the DMRC Red, Yellow, Blue, Green, Violet, Pink, Magenta and Grey lines. Airport Express, Noida Aqua Line and Rapid Metro Gurugram are outside the current scope.

The working topology is generated from the DMRC static GTFS published through the Delhi Open Transit Data ecosystem and supplemented for newer operational extensions. See [`src/data/delhi/README.md`](src/data/delhi/README.md) for provenance, caveats and regeneration notes.

To rebuild the snapshot from a GTFS directory:

```bash
node scripts/import-gtfs.mjs /path/to/gtfs-directory
```

Then run `npm run validate:data` before committing the generated network.

## Project structure

```text
src/app/                 Next.js pages, metadata and image endpoint
src/components/          Journey UI, result card and sharing controls
src/data/delhi/          Versioned network snapshot and data notes
src/lib/metro/           Routing, fare, projection and archetype engine
scripts/                 GTFS import and network validation
metro.png                Result-card Metro illustration
train.png                Journey progress marker
```

## Built with

- Next.js App Router
- React and TypeScript
- `ImageResponse` for downloadable and Open Graph cards
- CSS animations with reduced-motion support
- Space Grotesk and Noto Sans Devanagari

## Disclaimer

Metro Wrapped is an independent weekend project. It is not affiliated with, endorsed by or operated by Delhi Metro Rail Corporation. Route, time, distance and fare outputs may differ from official journey information.
