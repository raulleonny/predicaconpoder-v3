"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CrearSermonPage() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [pasaje, setPasaje] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [contenido, setContenido] = useState("");

  const [subtemaInput, setSubtemaInput] = useState("");
  const [subtemas, setSubtemas] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===============================================
  // 🔥 AGREGAR SUBTEMA
  // ===============================================
  const addSubtema = () => {
    if (subtemaInput.trim().length === 0) return;

    setSubtemas([...subtemas, subtemaInput.trim()]);
    setSubtemaInput("");
  };

  // ===============================================
  // ❌ ELIMINAR SUBTEMA
  // ===============================================
  const deleteSubtema = (index: number) => {
    setSubtemas(subtemas.filter((_, i) => i !== index));
  };

  // ===============================================
  // 📝 GUARDAR SERMON
  // ===============================================
  const saveSermon = async () => {
    if (!titulo || !pasaje || !contenido) {
      setError("Debes completar todos los campos obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Debes iniciar sesión");
        return;
      }

      await addDoc(collection(db, "sermones"), {
        uid: user.uid,
        titulo,
        pasaje,
        objetivo,
        contenido,
        subtemas,
        creadoEn: Timestamp.now(),
      });

      router.push("/dashboard");
    } catch (e: any) {
      setError("Error al guardar el sermón");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Crear Sermón</h1>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* TITULO */}
        <div>
          <label className="text-sm">Título del sermón</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 bg-neutral-800 rounded-lg"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {/* PASAJE */}
        <div>
          <label className="text-sm">Pasaje bíblico</label>
          <input
            type="text"
            placeholder="Ejemplo: Juan 3:16"
            className="w-full mt-1 px-3 py-2 bg-neutral-800 rounded-lg"
            value={pasaje}
            onChange={(e) => setPasaje(e.target.value)}
          />
        </div>

        {/* OBJETIVO */}
        <div>
          <label className="text-sm">Objetivo del tema</label>
          <textarea
            className="w-full mt-1 px-3 py-2 bg-neutral-800 rounded-lg"
            rows={3}
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          />
        </div>

        {/* CONTENIDO */}
        <div>
          <label className="text-sm">Contenido del sermón</label>
          <textarea
            className="w-full mt-1 px-3 py-2 bg-neutral-800 rounded-lg"
            rows={6}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
          />
        </div>

        {/* SUBTEMAS */}
        <div>
          <label className="text-sm">Subtemas</label>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Escribe un subtema"
              className="flex-1 px-3 py-2 bg-neutral-800 rounded-lg"
              value={subtemaInput}
              onChange={(e) => setSubtemaInput(e.target.value)}
            />
            <button
              onClick={addSubtema}
              className="px-3 py-2 bg-green-600 rounded-lg hover:bg-green-500"
            >
              Agregar
            </button>
          </div>

          {/* LISTA DE SUBTEMAS */}
          <div className="mt-4 space-y-2">
            {subtemas.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-neutral-900 px-3 py-2 rounded-lg"
              >
                <span>{s}</span>
                <button
                  onClick={() => deleteSubtema(i)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <button
          onClick={saveSermon}
          disabled={loading}
          className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-500 mt-6 font-semibold"
        >
          {loading ? "Guardando..." : "Guardar Sermón"}
        </button>
      </div>
    </main>
  );
}
