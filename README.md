# Korekiyo Shinguji — Dark Academic Shrine

A professional, data-driven character showcase website with custom 3D engine, CMS, and no dependencies.

## Features

- **Watsonian Design**: Presented as the character's personal academic portfolio.
- **Data-Driven**: All content, themes, and assets stored in JSON; swap characters easily.
- **Custom WebGL Engine**: Hand-written 3D scene with floating mask, dynamic lighting, fog, particles.
- **CMS Admin Panel**: Secure login, content editor, theme customizer, image manager.
- **Easter Eggs**: Hidden interactions, secret phrase, zipper cursor, parallax.
- **No Dependencies**: Pure Node.js 13, vanilla JavaScript, SCSS, WebGL.

## Getting Started

1. Clone the repository.
2. Place font files in `public/fonts/`.
3. Place character images in `public/images/korekiyo/`.
4. Run `npm start` or `node server/index.js`.
5. Open `http://localhost:3000` — splash page appears.
6. Admin panel at `/admin` (default credentials: `kiyo` / `anthropology1933`).

## Project Structure

(link to tree)

## Character Data Format

See `src/data/characters/template.json` for creating new characters.

## Technologies

- HTML5, SCSS, ES6+ JavaScript
- Node.js 13 (HTTP server, REST API)
- WebGL 1.0 (custom 3D engine)
- JSON-based database

## License

MIT
