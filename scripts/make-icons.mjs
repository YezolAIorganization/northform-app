import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const EMBER = "#FF5B2E";
const BG = "#0E0E10";
const OUT = "assets/images";

// North-pointing arrow, centred on (0, 0).
const ARROW = "M 0 -270 L 250 270 L 0 140 L -250 270 Z";

function drawing({ scale, fill, background }) {
  const size = 1024;
  const c = size / 2;
  const bg = background
    ? `<rect width="${size}" height="${size}" fill="${background}"/>`
    : "";
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      bg +
      `<g transform="translate(${c} ${c}) scale(${scale})">` +
      `<path d="${ARROW}" fill="${fill}" stroke="${fill}" stroke-width="36" stroke-linejoin="round"/>` +
      `</g></svg>`,
  );
}

async function write(name, options, resizeTo) {
  let image = sharp(drawing(options));
  if (resizeTo) image = image.resize(resizeTo, resizeTo);
  await image.png().toFile(`${OUT}/${name}`);
  console.log("wrote", `${OUT}/${name}`);
}

await mkdir(OUT, { recursive: true });

// Full icon: dark square with the arrow.
await write("northform-icon.png", { scale: 1, fill: EMBER, background: BG });

// Android adaptive icon: arrow only, kept inside the safe zone. Background colour is set in app.json.
await write("northform-adaptive-foreground.png", { scale: 0.82, fill: EMBER });

// Android themed icon: single-colour version.
await write("northform-adaptive-monochrome.png", {
  scale: 0.82,
  fill: "#FFFFFF",
});

// Splash image: arrow only, transparent.
await write("northform-splash.png", { scale: 1, fill: EMBER });

// Small icon for web.
await write(
  "northform-favicon.png",
  { scale: 1, fill: EMBER, background: BG },
  48,
);
