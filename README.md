# Australian Grand Prix: Global Race, Local Impact

**FIT2179 — Data Visualisation 2 (Semester 1, 2026)**  
Menghan Jiang · 35582138 · Monash University

## Live page

After GitHub Pages is turned on, the story should be here:

`https://mjia0046-debug.github.io/FIT2179_Australian_GP/`

If the repo keeps this folder as a subfolder, the link might need `/Australian_GP_story_package/` at the end. Check whichever URL actually loads `index.html` before submitting on Moodle.

You need an internet connection — the page pulls Vega libraries from a CDN and loads map data the same way.

---

## What this project is

This is a visual story about the Australian Grand Prix. I wanted to show three things in one scroll:

1. Where the race sits inside global Formula 1 (circuits, host cities, winners from overseas).
2. The local side — Australian drivers, home-race stats, and how fans connect to the sport here.
3. What happened after COVID: visitors coming back, money spent in Victoria, and jobs tied to the event.

The main file is `index.html`. Charts are Vega-Lite specs in `specs/`, loaded by `vega-page.js`.

---

## Story structure (5 sections)

**01 — A global sport lands in Australia**  
Starts with a world map of F1 circuits (`001_global_f1_circuits_map.vg.json`, data from `001f1_circuits_map.csv`). Dot size = how many races were held there; Adelaide and Melbourne stand out. Next is a block chart of host eras (`002`, from `002australian_gp_venues.csv`): Adelaide 1985–95, Melbourne 1996–2019, the 2020–21 gap, then the return from 2022.

**02 — Home drivers and global champions**  
Australian drivers in a text-style cloud (`003`, `003australian_gp_home_drivers.csv`) — click a name for career + home GP stats. Beside that, a bar chart of top non-Australian drivers (`004`) with a dropdown for wins / podiums / top-10s. Below is a timeline (`011`) of when each Aussie driver was in F1 and when they raced at the Australian GP.

**03 — Winning the Australian GP is international history**  
A map with arcs from winning countries to Melbourne (`012`), then a treemap of nationalities (`005_006`, `005_006australian_gp_winner_nationalities.csv`). Click a country to see which drivers won for that nation. Chart 012 and the treemap are linked — clicking a country on the map scrolls you down and updates the detail chart.

**04 — Constructor legacy**  
The AUS-shaped year track plus constructor treemap (`007`, `007australian_gp_constructor_track_aus_text.csv`). Hover or click a team to see wins, share of total, years, and drivers. The script dims other teams when you pick one.

**05 — Economic impact after the pandemic**  
Growth index chart (`013`, from `008_009_010F1_GDP.csv`) with everything indexed to 2022 = 100, so you can compare growth rates. Then three smaller charts: visitor origins (`008`), spending and GSP (`009`), and FTE jobs (`010`). Same CSV for all three.

---

## Tech stack

- HTML + CSS (`index.html`, `vega-styles.css`)
- JavaScript (`vega-page.js`) — loads each `.vg.json` from `specs/` and calls `vegaEmbed()`
- Vega-Lite v5 specs (one file per chart)
- Vega / Vega-Embed from jsDelivr CDN
- World map background: `world-atlas` TopoJSON (also via CDN)

Some charts keep data inside the JSON (e.g. timeline, connection map, growth index) because I reshaped them during design. The rest use cleaned CSV files in this folder — I did not dump the full Kaggle tables straight into the specs.

Extra interaction (driver detail box, country drill-down, constructor highlight) is plain JS on top of the embedded views, not all done inside Vega-Lite.

---

## Files worth knowing

```
index.html              # entry point
vega-styles.css
vega-page.js            # chart loading + click handlers
specs/*.vg.json         # Vega-Lite specifications
001f1_circuits_map.csv
002australian_gp_venues.csv
003australian_gp_home_drivers.csv
004australian_gp_non_aus_top_drivers.csv
005_006australian_gp_winner_nationalities.csv
007australian_gp_constructor_track_aus_text.csv
008_009_010F1_GDP.csv
```

---

## Run it locally

Easiest: open `index.html` in a browser while online.

If charts do not load (some browsers block `fetch` on local files), run a small server in this folder:

```bash
python -m http.server 8125
```

Then go to `http://127.0.0.1:8125/`

---

## Data sources

- [Formula 1 World Championship (1950–2024)](https://www.kaggle.com/datasets/rohanrao/formula-1-world-championship-1950-2020) on Kaggle (CC0) — circuits, results, drivers, constructors; filtered and aggregated for each chart.
- Victorian Government (DJSIR) Australian Grand Prix economic impact reports: [2022](https://djsir.vic.gov.au/__data/assets/pdf_file/0011/2397782/2022-Formula-1-Australian-Grand-Prix-Economic-Impact.pdf), [2023](https://djsir.vic.gov.au/__data/assets/pdf_file/0004/2397784/2023-Formula-1-Australian-Grand-Prix-Economic-Impact.pdf), [2024–2025](https://djsir.vic.gov.au/__data/assets/pdf_file/0005/2464286/Economic-impact-assessment-of-the-2024-and-2025-Australian-Grand-Prix.pdf) — visitors, expenditure, GSP, FTE jobs.
- [world-atlas](https://github.com/topojson/world-atlas) for country boundaries on the maps.

---

## Acknowledgements

I used generative AI (Claude / ChatGPT / GitHub Copilot) to help polish some English on the page, suggest Vega-Lite patterns, and rough out parts of the CSS layout. The data cleaning, chart choices, story order, and sketches are my own work.

Fonts: Google Fonts (Titillium Web, Inter).

---

Last updated: 15 May 2026
