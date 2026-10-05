# React + Vite

## API deployment URL

The frontend uses `VITE_API_URL` for both HTTP requests and Socket.IO. Local development defaults to `http://localhost:5001`; production defaults to the same origin as the frontend, which works when a reverse proxy serves the API there.

For a separately hosted backend, set `VITE_API_URL` to its public HTTPS URL (for example, `https://api.example.com`) in the frontend hosting environment and rebuild the frontend. Set backend `CLIENT_ORIGINS` to the exact frontend origin (for example, `https://chat.example.com`). The backend must be deployed on a publicly reachable host; do not use `localhost` for users on other devices.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
