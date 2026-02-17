# Pac-Man (Web)

A browser-based, open-source implementation of the classic Pac-Man arcade game. Forked from a community-developed project originally led by [NicerWritter27](https://github.com/NicerWritter27).

![Pac-Man Screenshot](https://user-images.githubusercontent.com/92959844/152112411-5c52087d-2f2c-49c2-b8df-a2e9bbfc55d5.png)
> *Shown in fullscreen mode (press `F11` to toggle)*

---
## Acknowledgements

- Original game developed by [NicerWritter27](https://github.com/NicerWritter27) and the open-source community.
- Built on top of the community-maintained fork — thank you to all contributors who helped develop and improve the original project.
---

## Getting Started

### Play in Browser
The game is hosted via GitHub Pages and requires no installation. Visit the public URL to play instantly in any modern browser.

### Run Locally (GitHub Codespaces)
1. Open the repository in [GitHub Codespaces](https://github.com/features/codespaces).
2. Install dependencies:
   ```bash
   npm install --ignore-scripts
   ```
3. Start the development server:
   ```bash
   npm run serve
   ```
4. In the **Ports** panel, set port `8080` visibility to **Public**.
5. Use the generated HTTPS URL for local testing or sharing.

---

## Deployment

### GitHub Pages
1. Push the repository to GitHub.
2. Navigate to **Settings → Pages** and set the source to **GitHub Actions**.
3. The included workflow at `.github/workflows/deploy-pages.yml` will automatically deploy on pushes to `main`/`master`.
4. Your game will be available at:
   ```
   https://<your-github-username>.github.io/<repo-name>/
   ```

---

## How to Play

| Action | PC | Mobile |
|---|---|---|
| Move | `W A S D` or Arrow Keys | On-screen arrow buttons |
| Pause | Pause button (top-left corner) | Same |
| Mute | Mute button (next to Pause) | Same |

**Objective:** Eat all pellets on the map to complete the round.

- **Power Pellets** — Large pellets that temporarily turn ghosts blue and vulnerable. Eat blue ghosts for bonus points. Ghosts can respawn.
- **Fruits** — Appear periodically for bonus points. Fruit type varies by round (e.g., cherry in Round 1).
- **Lives** — You start with 3 lives. Reaching a point threshold rewards an extra life.
- **Blinky** — The red ghost becomes aggressive when most pellets have been eaten and will actively chase the player.

---

## Features

- Classic Pac-Man gameplay faithful to the original arcade experience
- Ghost AI with distinct behaviors (including Blinky's "Elroy" mode)
- Multiple fruit types across rounds
- Pause and mute functionality with unique pause audio
- Extra life awarded upon reaching a score threshold
- Smooth sprite animations
- Embeddable via `<iframe>` for use on external websites
- Deployable as a static site with zero backend dependencies

---

## Project Structure

```
app/
├── scripts/          # Game logic and application scripts
├── style/
│   ├── scss/         # Source stylesheets (SCSS)
│   ├── audio/        # Sound effects and music
│   └── graphics/     # Sprites and spritesheets
build/                # Compiled JS and CSS output
thank-you/            # Thank You page for the Opera browser add-on
```

---

## Notes

- **Offline Play** — This game requires a server to run. For offline use, see the Opera browser add-on (linked in the project's Links section). *Opera browsers only.*
- **Iframe Support** — Iframe embedding is enabled. You may embed this game on your own website.
- **Thank You Page** — The `thank-you/` directory contains a standalone page displayed after installing the Opera add-on.
- **Built with** [GitHub Pages](https://pages.github.com/)

---

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## License

This project is open-source. Please refer to the `LICENSE` file for details.
