## Interactive Historical Map (Next.js Edition)
This repository is a specialized port of the **voivodeships-map** project, rebuilt on the **Next.js** framework. It transitions the original Vite-based SPA into a modular, server-aware application designed for integration into larger web ecosystems.

### Migration & Architectural Highlights

#### 1. Encapsulated Feature Module
The map is no longer a standalone application but a self-contained feature module. It is located within the ``/src/features/historical-map`` directory, making it highly portable. It is integrated into the Next.js App Router via the ``/historical-map`` route.

#### 2. SSR & Hydration Strategy
Since Leaflet requires the ``window`` object, the map component is loaded using Next.js Dynamic Imports (``ssr: false``). This prevents server-side rendering errors and ensures the map initializes only once the browser environment is ready.

#### 3. Server-Side Persistence
Unlike the original project which used a temporary client-side store for metadata edits, this version implements Server-Side Persistence.
- **Server Action**: Changes made in the metadata editor are sent to a Next.js server action ``/editor/actions.ts``.
- **FS Integration**: The server updates the underlying GeoJSON files in the ``public/data`` directory, ensuring changes persist across sessions.

#### 4. Shared UI & Theming
- **Next-Themes**: The light/dark mode logic has been refactored to use next-themes, providing a unified theme state across the map and the host application.
- **Sample Layout**: A sample header and navigation were added to demonstrate how the map sits within a standard website layout without breaking responsiveness.

### To-Do List for Final Integration
- **Role-Based Access Control**: Implement middleware or context-based checks to conditionally render the "Edit" button based on user permissions (Admin/Moderator).

### Local Development
#### Prerequisites
- Node.js
- npm or yarn

#### Setup
Clone the repository:

```bash
git clone https://github.com/romankzk/voivodeships-map-next.git
cd voivodeships-map-next
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Open http://localhost:3000/historical-map to view the map.

### Deployment
Deployment is not implemented for this project as it's intended for the existing web app integration.