/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_FIRESTORE_DATABASE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*/firebase-applet-config.json' {
  const value: Record<string, string>;
  export default value;
}

declare module '../firebase-applet-config.json' {
  const value: Record<string, string>;
  export default value;
}
