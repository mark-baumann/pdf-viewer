# PDF Viewer

A modern, responsive, and feature-rich PDF viewer built with React, capable of handling local file uploads and integrating with Vercel Blob storage.

## Features

*   **PDF Viewing:** High-quality rendering using `react-pdf`.
*   **Intuitive Navigation:**
    *   Arrow keys (Left/Right) for page navigation.
    *   Touch swipe gestures (Left/Right) for mobile devices.
    *   On-screen navigation buttons.
*   **Zoom Control:** Zoom in/out functionality with persistent state (remembers your last zoom level).
*   **Immersive Mode:**
    *   **Auto-hiding UI:** Controls and header disappear after 3 seconds of inactivity for a distraction-free reading experience.
    *   **Fullscreen Mode:** Toggle button to view documents in full screen.
*   **Document Management:**
    *   Upload PDF files (supports local preview and Vercel Blob upload).
    *   View a list of previously uploaded documents (persisted via Vercel Blob).
*   **Responsive Design:** Optimized for both desktop and mobile viewing.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd pdf-viewer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

To run the application locally with full API support (needed for Vercel Blob uploads):

```bash
npx vercel dev
```

The application will be available at `http://localhost:3000`.

*Note: If you run `npm start`, the frontend will load, but file uploads to the cloud will fail as the API server won't be running. Local file preview will still work.*

## Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the project into Vercel.
3.  **Important:** Configure Vercel Blob Storage:
    *   Go to the "Storage" tab in your Vercel project.
    *   Connect a new Blob store.
    *   This will automatically set the `BLOB_READ_WRITE_TOKEN` environment variable required for uploads.

## Tech Stack

*   **Frontend:** React, React Router, React PDF
*   **Styling:** CSS Modules / Standard CSS
*   **Backend/API:** Vercel Serverless Functions (Node.js)
*   **Storage:** Vercel Blob