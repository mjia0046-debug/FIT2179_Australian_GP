const chartMap = [
  ["#chart-001", "001_global_f1_circuits_map.vg.json"],
  ["#chart-002", "002_australian_gp_venues.vg.json"],
  ["#chart-003", "003_australian_home_driver_cloud.vg.json"],
  ["#chart-004", "004_non_aus_top_drivers.vg.json"],
  ["#chart-012", "012_winner_connection_map.vg.json"],
  ["#chart-005-006", "005_006_winner_nationalities_map_bar.vg.json"],
  ["#chart-007", "007_constructor_aus_track.vg.json"],
  ["#chart-013", "013_economic_growth_index.vg.json"],
  ["#chart-008", "008_visitor_origin_stacked_bar.vg.json"],
  ["#chart-009", "009_economic_impact_lines.vg.json"],
  ["#chart-010", "010_fte_jobs_bar.vg.json"],
  ["#chart-011", "011_aus_driver_timeline.vg.json"],
];

async function loadSpec(name) {
  try {
    const response = await fetch(`specs/${name}`);
    return await response.json();
  } catch {
    return window.vegaLiteSpecs[name];
  }
}

const views = {};

async function renderAll() {
  await Promise.all(
    chartMap.map(async ([selector, specName]) => {
      try {
        const spec = await loadSpec(specName);
        const result = await vegaEmbed(selector, spec, { actions: false, renderer: "svg" });
        views[selector] = result.view;
        if (selector === "#chart-003") {
          attachDriverDetail(selector, spec, result.view);
        }
        if (selector === "#chart-005-006") {
          attachWinnerCountryDetail(selector, spec, result.view);
        }
        if (selector === "#chart-007") {
          attachConstructorDetail(selector, spec, result.view);
        }
        if (selector === "#chart-012") {
          result.view.addEventListener("click", (_event, item) => {
            const datum = item?.datum?.datum || item?.datum;
            const country = datum?.country;
            if (!country) return;
            if (typeof window.__renderCountry === "function") {
              try { window.__renderCountry(country); } catch (e) { console.warn("renderCountry failed", e); }
            }
            const target = document.querySelector("#chart-005-006");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
      } catch (error) {
        console.error(`Failed to render ${specName}`, error);
        const el = document.querySelector(selector);
        if (el) {
          el.innerHTML = `<pre style="white-space:pre-wrap;color:#9b1c1c;background:#fff3f3;border:1px solid #f0b8b8;padding:12px;border-radius:6px;">Failed to render ${specName}\n${String(error && error.message ? error.message : error)}</pre>`;
        }
      }
    })
  );
  attachTimelineCrossLink();
}

function attachWinnerCountryDetail(selector, spec, view) {
  const el = document.querySelector(selector);
  const rows = spec.datasets?.winner_driver_details || [];
  const panel = document.createElement("div");
  panel.className = "winner-country-detail";
  panel.innerHTML = `
    <div class="winner-driver-chart"></div>
    <div class="winner-driver-profile"></div>
  `;
  el.insertAdjacentElement("afterend", panel);
  const chartEl = panel.querySelector(".winner-driver-chart");
  const profileEl = panel.querySelector(".winner-driver-profile");

  function renderProfile(driverRows, driver) {
    const d = driverRows.find((row) => row.driver === driver) || driverRows[0];
    if (!d) return;
    profileEl.innerHTML = `
      <strong>${d.driver}</strong>
      <span>${d.driver_nationality} driver · ${d.wins} Australian GP win${d.wins === 1 ? "" : "s"}</span>
      <span>Winning years: ${d.winning_years}</span>
      <span>Constructors: ${d.constructors}</span>
      <span>${d.profile}</span>
    `;
  }

  async function renderCountry(country) {
    const driverRows = rows
      .filter((row) => row.country_name === country)
      .sort((a, b) => b.wins - a.wins || a.driver.localeCompare(b.driver));
    if (!driverRows.length) return;
    const countryWins = driverRows.reduce((sum, row) => sum + row.wins, 0);
    const detailSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      width: "container",
      height: Math.max(160, driverRows.length * 34),
      title: `${country}: winning drivers (${countryWins} wins)`,
      data: { values: driverRows },
      layer: [
        {
          mark: { type: "bar", color: "#2457c5", cornerRadiusEnd: 3, cursor: "pointer" },
          encoding: {
            y: { field: "driver", type: "nominal", sort: "-x", axis: { title: null } },
            x: { field: "wins", type: "quantitative", axis: { title: "Australian GP wins", grid: false } },
            tooltip: [
              { field: "driver" },
              { field: "wins", title: "Wins" },
              { field: "winning_years", title: "Winning years" },
              { field: "constructors", title: "Constructors" },
            ],
          },
        },
        {
          mark: { type: "text", align: "left", dx: 5, fontWeight: "bold" },
          encoding: {
            y: { field: "driver", type: "nominal", sort: "-x" },
            x: { field: "wins", type: "quantitative" },
            text: { field: "wins", format: ".0f" },
          },
        },
      ],
      config: {
        view: { stroke: null },
        axis: { labelColor: "#5d6670", titleColor: "#30353b", gridColor: "#e6e8e3" },
        font: "Inter",
      },
    };
    const result = await vegaEmbed(chartEl, detailSpec, { actions: false, renderer: "svg" });
    renderProfile(driverRows, driverRows[0].driver);
    result.view.addEventListener("click", (_event, item) => {
      const datum = item?.datum?.datum || item?.datum;
      if (datum?.driver) renderProfile(driverRows, datum.driver);
    });
    result.view.addEventListener("mouseover", (_event, item) => {
      const datum = item?.datum?.datum || item?.datum;
      if (datum?.driver) renderProfile(driverRows, datum.driver);
    });
  }

  window.__renderCountry = renderCountry;
  renderCountry("United Kingdom");
  view.addEventListener("click", (_event, item) => {
    const datum = item?.datum?.datum || item?.datum;
    if (datum?.country_name) renderCountry(datum.country_name);
  });
}

function attachConstructorDetail(selector, spec, view) {
  const el = document.querySelector(selector);
  const rows = spec.layer?.find((layer) => layer.data?.values?.[0]?.share_label)?.data?.values || [];
  const detail = document.createElement("div");
  detail.className = "constructor-detail";
  el.insertAdjacentElement("afterend", detail);
  const colorByTeam = Object.fromEntries(rows.map((row) => [row.team, row.team_color]));

  function render(team) {
    const d = rows.find((row) => row.team === team) || rows[0];
    if (!d) return;
    detail.innerHTML = `
      <strong>${d.team}</strong>
      <span>${d.wins} wins, ${d.share_label} of Australian GP winners in this dataset.</span>
      <span>First/last win: ${d.first_year}-${d.last_year}</span>
      <span>Winning drivers: ${d.drivers}</span>
    `;
    highlightTeam(d.team);
  }

  function highlightTeam(team) {
    const active = colorByTeam[team];
    if (!active) return;
    const svg = el.querySelector("svg");
    if (!svg) return;
    svg.querySelectorAll("[fill]").forEach((node) => {
      const fill = node.getAttribute("fill");
      if (!Object.values(colorByTeam).includes(fill)) return;
      node.style.opacity = fill === active ? "1" : "0.28";
    });
  }

  render("Ferrari");
  view.addEventListener("mouseover", (_event, item) => {
    const datum = item?.datum?.datum || item?.datum;
    if (datum?.team && datum?.share_label) render(datum.team);
  });
  view.addEventListener("click", (_event, item) => {
    const datum = item?.datum?.datum || item?.datum;
    if (datum?.team) render(datum.team);
  });
}

function attachDriverDetail(selector, spec, view) {
  const el = document.querySelector(selector);
  const drivers = spec.layer?.[0]?.data?.values || [];
  const detail = document.createElement("div");
  detail.className = "driver-detail";
  el.insertAdjacentElement("afterend", detail);

  function render(driver) {
    const d = drivers.find((row) => row.driver === driver) || drivers[0];
    if (!d) return;
    detail.innerHTML = `
      <strong>${d.driver}</strong>
      <span>${d.profile}</span>
      <span>Career: ${d.career_starts} starts · ${d.career_wins} wins · ${d.career_podiums} podiums · ${d.career_points} points</span>
      <span>Australian GP: ${d.home_gp_starts} starts · ${d.home_gp_top10_finishes} Top 10 finishes · best finish ${d.home_gp_best_finish > 0 ? 'P' + d.home_gp_best_finish : 'N/A'}</span>
    `;
  }

  window.__renderDriver = render;
  render("Mark Webber");
  view.addEventListener("click", (_event, item) => {
    const datum = item?.datum?.datum || item?.datum;
    if (datum?.driver) render(datum.driver);
  });
}

function attachTimelineCrossLink() {}

renderAll();
