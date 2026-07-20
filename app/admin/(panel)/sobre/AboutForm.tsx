"use client";

import { useEffect, useState, useTransition } from "react";
import type { AboutUs } from "@/lib/api/types";
import { saveAboutUs } from "./actions";

const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";
const LABEL = "block text-sm font-medium";

/** How long the "saved" confirmation stays on screen. */
const NOTICE_MS = 4000;

/**
 * The single "Sobre" record, edited in place.
 *
 * Unlike the other admin sections there is no list and no modal: the record is
 * a singleton, so the whole page is one form that saves with PUT (create on
 * first save, replace afterwards). `about` is null until it is filled in for
 * the first time.
 */
export function AboutForm({ about }: { about: AboutUs | null }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [saved]);

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await saveAboutUs(formData);
      if (result.error) {
        setError(result.error);
        setSaved(false);
        return;
      }
      setError(null);
      setSaved(true);
    });
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Sobre</h1>
      <p className="mt-1 text-sm text-ink-soft">
        O texto e o vídeo aparecem na página &quot;Sobre nós&quot;. O email e as
        redes sociais aparecem também no rodapé e nos contactos.
      </p>

      <form action={submit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="text" className={LABEL}>
            Texto
          </label>
          <textarea
            id="text"
            name="text"
            required
            rows={8}
            defaultValue={about?.text ?? ""}
            placeholder="A história da empresa, o que fazem, o que a distingue..."
            className={INPUT}
          />
          <p className="mt-1 text-xs text-ink-soft">
            Único campo obrigatório. As mudanças de linha são respeitadas. Para
            negrito, rodeie o texto com dois asteriscos: **assim**.
          </p>
        </div>

        <div>
          <label htmlFor="tagline" className={LABEL}>
            Frase institucional (opcional)
          </label>
          <textarea
            id="tagline"
            name="tagline"
            rows={3}
            defaultValue={about?.tagline ?? ""}
            placeholder="Ex.: Agricultura, ferragens, rações e produtos de limpeza — ao serviço da região há mais de 30 anos."
            className={INPUT}
          />
          <p className="mt-1 text-xs text-ink-soft">
            Frase curta e permanente sobre a empresa. Ao contrário dos
            &quot;Avisos&quot;, não desaparece — é um texto fixo de apresentação.
          </p>
        </div>

        <div>
          <label htmlFor="video_url" className={LABEL}>
            Vídeo (opcional)
          </label>
          <input
            id="video_url"
            name="video_url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            defaultValue={about?.video_url ?? ""}
            className={INPUT}
          />
        </div>

        <div className="border-t border-line pt-5">
          <p className={LABEL}>Contactos e redes (opcionais)</p>
          <p className="mt-1 text-xs text-ink-soft">
            Cada um só aparece no site quando está preenchido.
          </p>

          <div className="mt-3 space-y-4">
            <div>
              <label htmlFor="email" className={LABEL}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="geral@agromoreira.pt"
                defaultValue={about?.email ?? ""}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="facebook_url" className={LABEL}>
                Facebook
              </label>
              <input
                id="facebook_url"
                name="facebook_url"
                type="url"
                placeholder="https://www.facebook.com/..."
                defaultValue={about?.facebook_url ?? ""}
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="instagram_url" className={LABEL}>
                Instagram
              </label>
              <input
                id="instagram_url"
                name="instagram_url"
                type="url"
                placeholder="https://www.instagram.com/..."
                defaultValue={about?.instagram_url ?? ""}
                className={INPUT}
              />
            </div>
          </div>
        </div>

        {saved && (
          <p
            role="status"
            className="rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent-ink"
          >
            Conteúdo guardado.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="border-t border-line pt-5">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-deep disabled:opacity-60"
          >
            {pending ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </form>
    </>
  );
}
