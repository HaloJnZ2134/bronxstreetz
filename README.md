# Bronx Streetz Official Website

Static GitHub Pages website for Bronx Streetz.

## Pages

- `index.html` - Home page
- `about.html` - About page
- `gallery.html` - Gallery page
- `stats.html` - Roblox statistics page

## Statistics updater

The statistics page reads from `data/roblox-stats.json`.

That file is updated by `.github/workflows/update-roblox-stats.yml` every 15 minutes. To update it right away:

1. Open the repository on GitHub.
2. Go to **Actions**.
3. Select **Update Roblox Stats**.
4. Click **Run workflow**.
5. Wait for it to finish, then refresh the website.

## Gallery images

Upload screenshots into `assets/gallery/`.

The gallery currently looks for these files:

- `city.png`
- `cars.png`
- `cash.png`
- `map.png`
- `spawners.png`
- `community.png`

If you upload JPG or WEBP files instead, update the matching image paths in `gallery.html`.

## Main links

Roblox game: https://www.roblox.com/games/16995353837/Bronx-Streetz

Discord server: https://discord.gg/XVc4PGBFNk
