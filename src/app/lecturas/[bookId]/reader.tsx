"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// === Dynamic imports necesarios para evitar errores de SSR ===
import dynamic from "next/dynamic";

const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((m) => m.Viewer),
  { ssr: false }
);

const Worker = dynamic(
  () => import("@react-pdf-viewer/core").then((m) => m.Worker),
  { ssr: false }
);

// === ESTOS SÍ SE IMPORTAN NORMAL ===
import { SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

type Theme = "oscuro" | "sepia" | "claro";

const highlightColors = [
  { key: "amarillo", hex: "#fef08a" },
  { key: "verde", hex: "#bbf7d0" },
  { key: "cian", hex: "#bae6fd" },
  { key: "rosa", hex: "#fecdd3" },
  { key: "naranja", hex: "#fed7aa" },
];

export default function LecturaReader({ bookId }: { bookId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<Theme>("oscuro");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [note, setNote] = useState("");
  const [currentColor, setCurrentColor] = useState(highlightColors[0].key);

  // === Plugin principal del visor PDF ===
  const layoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "lecturas", bookId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setData(null);
          setLoading(false);
          return;
        }

        const d = snap.data();
        setData(d);
        setCurrentPage(d.lastPage ?? 1);

        if (d.notes?.[d.lastPage]) {
          setNote(d.notes[d.lastPage]);
        }
      } catch (e) {
        console.error("Error cargando libro:", e);
      }

      setLoading(false);
    };

    load();
  }, [bookId]);

  const saveProgress = async () => {
    if (!data) return;

    const ref = doc(db, "lecturas", bookId);
    await updateDoc(ref, { lastPage: currentPage });

    alert("Progreso guardado");
  };

  const saveNote = async () => {
    if (!data) return;

    const pageKey = String(currentPage);
    const ref = doc(db, "lecturas", bookId);

    await updateDoc(ref, {
      [`notes.${pageKey}`]: note,
      [`highlights.${pageKey}`]: currentColor,
      lastPage: currentPage,
    });

    alert("Nota guardada");
  };

  if (loading) return <p className="text-white p-6">Cargando…</p>;
  if (!data) return <p className="text-white p-6">Libro no encontrado.</p>;

  return (
    <main className="min-h-screen bg-black text-white p-4 flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <Link href="/lecturas" className="bg-neutral-700 px-3 py-2 rounded-lg hover:bg-neutral-600">
          ← Volver
        </Link>

        <Link href="/dashboard" className="bg-neutral-700 px-3 py-2 rounded-lg hover:bg-neutral-600">
          Ir al Dashboard
        </Link>
      </div>

      {/* TEMA */}
      <div className="flex gap-3 items-center">
        <span>Tema:</span>
        <button onClick={() => setTheme("oscuro")}>Oscuro</button>
        <button onClick={() => setTheme("sepia")}>Sepia</button>
        <button onClick={() => setTheme("claro")}>Claro</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">

        {/* VISOR PDF */}
        <div
          className="flex-1 bg-neutral-900 rounded-xl"
          style={{
            height: "calc(100vh - 200px)",
            overflow: "auto",
          }}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={data.pdfUrl}
              defaultScale={SpecialZoomLevel.PageFit}
              plugins={[layoutPluginInstance]}
            />
          </Worker>
        </div>

        {/* PANEL DERECHA */}
        <div className="w-full lg:w-80 bg-neutral-900 rounded-xl p-4">
          <textarea
            className="w-full h-24 bg-neutral-800 p-2 rounded mb-2"
            placeholder="Notas…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            onClick={saveNote}
            className="bg-indigo-600 w-full py-2 rounded-lg hover:bg-indigo-500"
          >
            Guardar nota
          </button>

          <button
            onClick={saveProgress}
            className="bg-green-600 w-full py-2 rounded-lg hover:bg-green-500 mt-3"
          >
            Guardar progreso
          </button>
        </div>

      </div>
    </main>
  );
}
