import React from "react";
import "./install-support";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "@prisma/writer/word.css";
import "./experience.css";
import "./product-design.css";
import { Capacitor } from "@capacitor/core";
import {startFileHandling} from './file-launch';
import {trackWorkerUpdates} from './install-support';
import './file-launch.css';
startFileHandling();
window.addEventListener('asteoria-file-error',event=>{
 const message=String((event as CustomEvent).detail??'No se pudo abrir el documento.');
 const notice=document.createElement('div');notice.setAttribute('role','alert');notice.className='asteoria-file-alert';
 const text=document.createElement('span');text.textContent=message;const close=document.createElement('button');close.textContent='Cerrar';close.onclick=()=>notice.remove();notice.append(text,close);document.body.append(notice);
});
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
if (
  import.meta.env.PROD &&
  !Capacitor.isNativePlatform() &&
  ["http:", "https:"].includes(location.protocol) &&
  "serviceWorker" in navigator
) {
  trackWorkerUpdates(navigator.serviceWorker);
  void navigator.serviceWorker
    .register(new URL("./sw.js", document.baseURI), { scope: "./", updateViaCache: "none" })
    .then((registration) => {
      void registration.update().catch(() => {});
      return navigator.serviceWorker.ready;
    })
    .then(() => window.dispatchEvent(new Event("prisma-offline-ready")))
    .catch(() => {
      /* PDF processing remains available without offline caching. */
    });
  let lastUpdate = Date.now();
  const checkWhenResumed = () => {
    if (document.visibilityState !== 'visible' || Date.now() - lastUpdate < 60_000) return;
    lastUpdate = Date.now();
    void navigator.serviceWorker.getRegistration(new URL('./', document.baseURI).href)
      .then(registration => registration?.update()).catch(() => {});
  };
  window.addEventListener('online', checkWhenResumed);
  document.addEventListener('visibilitychange', checkWhenResumed);
}
