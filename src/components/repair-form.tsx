"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ATELIERS, STATUTS, TYPES_PRODUIT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ReparationEditPayload, StatutReparation, TypeProduit } from "@/lib/types";

type BijouInput = {
  type_produit: TypeProduit;
  description: string;
  prix_reparation: string;
  newPhotos: File[];
  existingPhotos: string[];
};

const DEFAULT_STATUS: StatutReparation = "en cours";

function fileToPreview(file: File) {
  return URL.createObjectURL(file);
}

export function RepairForm({ initialData }: { initialData: ReparationEditPayload | null }) {
  const router = useRouter();
  const isEditMode = Boolean(initialData);

  const [clientNom, setClientNom] = useState(initialData?.client.nom_complet ?? "");
  const [telephone, setTelephone] = useState(initialData?.client.telephone ?? "");
  const [atelier, setAtelier] = useState(initialData?.atelier ?? ATELIERS[0]);
  const [dateReception, setDateReception] = useState(initialData?.date_reception_client ?? "");
  const [dateRetourAtelier, setDateRetourAtelier] = useState(initialData?.date_retour_atelier ?? "");
  const [dateLivraison, setDateLivraison] = useState(initialData?.date_livraison_client ?? "");
  const [prix, setPrix] = useState(initialData?.prix_reparation ?? "0");
  const [urgent, setUrgent] = useState(initialData?.urgent ?? false);
  const [statut, setStatut] = useState<StatutReparation>(initialData?.statut ?? DEFAULT_STATUS);
  const [bijoux, setBijoux] = useState<BijouInput[]>(
    initialData?.bijoux.length
      ? initialData.bijoux.map((b) => ({
          type_produit: b.type_produit,
          description: b.description,
          prix_reparation: b.prix_reparation ?? "0",
          existingPhotos: b.photos,
          newPhotos: [],
        }))
      : [
          {
            type_produit: TYPES_PRODUIT[0],
            description: "",
            prix_reparation: "0",
            existingPhotos: [],
            newPhotos: [],
          },
        ],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cameraIndex, setCameraIndex] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const previewsByBijou = useMemo(
    () =>
      bijoux.map((item) => ({
        existing: item.existingPhotos,
        newPreviews: item.newPhotos.map((file) => fileToPreview(file)),
      })),
    [bijoux],
  );

  const addBijou = () => {
    setBijoux((current) => [
      ...current,
      {
        type_produit: TYPES_PRODUIT[0],
        description: "",
        prix_reparation: "0",
        existingPhotos: [],
        newPhotos: [],
      },
    ]);
  };

  const removeBijou = (index: number) => {
    setBijoux((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateBijou = (index: number, partial: Partial<BijouInput>) => {
    setBijoux((current) =>
      current.map((item, currentIndex) => (currentIndex === index ? { ...item, ...partial } : item)),
    );
  };

  const addPhotosToBijou = (index: number, files: File[]) => {
    if (!files.length) {
      return;
    }
    setBijoux((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index
          ? { ...item, newPhotos: [...item.newPhotos, ...files] }
          : item,
      ),
    );
  };

  useEffect(() => {
    if (cameraIndex === null) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraError("");
      return;
    }

    let isActive = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        setCameraError("Impossible d'acceder a la camera.");
      }
    };

    void startCamera();

    return () => {
      isActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraIndex]);

  const capturePhoto = async () => {
    if (cameraIndex === null || !videoRef.current || !canvasRef.current) {
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) {
      return;
    }
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
    addPhotosToBijou(cameraIndex, [file]);
    setCameraIndex(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!clientNom.trim()) {
      setErrorMessage("Le nom complet du client est obligatoire.");
      return;
    }

    if (!dateReception) {
      setErrorMessage("La date de réception client est obligatoire.");
      return;
    }

    if (!bijoux.length) {
      setErrorMessage("Ajoutez au moins un bijou.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Session expirée. Reconnectez-vous.");
        return;
      }

      let clientId = initialData?.client.id ?? "";

      if (isEditMode && clientId) {
        const { error: updateClientError } = await supabase
          .schema("app")
          .from("clients")
          .update({
            nom_complet: clientNom.trim(),
            telephone: telephone.trim() || null,
          })
          .eq("id", clientId);

        if (updateClientError) {
          setErrorMessage(updateClientError.message);
          return;
        }
      } else {
        const { data: newClient, error: clientError } = await supabase
          .schema("app")
          .from("clients")
          .insert({
            nom_complet: clientNom.trim(),
            telephone: telephone.trim() || null,
          })
          .select("id")
          .single();

        if (clientError || !newClient) {
          setErrorMessage(clientError?.message ?? "Erreur création client.");
          return;
        }

        clientId = newClient.id;
      }

      let reparationId = initialData?.id ?? "";

      if (isEditMode && reparationId) {
        const { error: updateError } = await supabase
          .schema("app")
          .from("reparations")
          .update({
            client_id: clientId,
            atelier,
            date_reception_client: dateReception,
            date_retour_atelier: dateRetourAtelier || null,
            date_livraison_client: dateLivraison || null,
            prix_reparation: Number(prix || 0),
            urgent,
            statut,
          })
          .eq("id", reparationId);

        if (updateError) {
          setErrorMessage(updateError.message);
          return;
        }

        const { data: oldBijoux } = await supabase
          .schema("app")
          .from("bijoux")
          .select("id")
          .eq("reparation_id", reparationId);

        const oldBijouIds = (oldBijoux ?? []).map((item) => item.id);
        if (oldBijouIds.length) {
          const { data: oldPhotos } = await supabase
            .schema("app")
            .from("bijou_photos")
            .select("storage_path")
            .in("bijou_id", oldBijouIds);

          const oldPaths = (oldPhotos ?? []).map((item) => item.storage_path);
          if (oldPaths.length) {
            await supabase.storage.from("bijoux-photos").remove(oldPaths);
          }

          await supabase.schema("app").from("bijoux").delete().eq("reparation_id", reparationId);
        }
      } else {
        const { data: newRepair, error: createError } = await supabase
          .schema("app")
          .from("reparations")
          .insert({
            client_id: clientId,
            atelier,
            date_reception_client: dateReception,
            date_retour_atelier: dateRetourAtelier || null,
            date_livraison_client: dateLivraison || null,
            prix_reparation: Number(prix || 0),
            urgent,
            statut,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (createError || !newRepair) {
          setErrorMessage(createError?.message ?? "Erreur création réparation.");
          return;
        }

        reparationId = newRepair.id;
      }

      for (const bijou of bijoux) {
        const { data: createdBijou, error: bijouError } = await supabase
          .schema("app")
          .from("bijoux")
          .insert({
            reparation_id: reparationId,
            type_produit: bijou.type_produit,
            description: bijou.description.trim() || null,
            prix_reparation: Number(bijou.prix_reparation || 0),
          })
          .select("id")
          .single();

        if (bijouError || !createdBijou) {
          setErrorMessage(bijouError?.message ?? "Erreur création bijou.");
          return;
        }

        for (const photo of bijou.newPhotos) {
          const extension = photo.name.split(".").pop() ?? "jpg";
          const path = `${reparationId}/${createdBijou.id}/${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from("bijoux-photos")
            .upload(path, photo, { upsert: false, contentType: photo.type });

          if (uploadError) {
            setErrorMessage(uploadError.message);
            return;
          }

          const { data: publicUrlData } = supabase.storage.from("bijoux-photos").getPublicUrl(path);

          const { error: photoDbError } = await supabase.schema("app").from("bijou_photos").insert({
            bijou_id: createdBijou.id,
            storage_path: path,
            public_url: publicUrlData.publicUrl,
          });

          if (photoDbError) {
            setErrorMessage(photoDbError.message);
            return;
          }
        }
      }

      const trimmedPhone = telephone.trim();
      const statusWasReady = initialData?.statut === "prêt";
      const statusIsReady = statut === "prêt";

      if (trimmedPhone) {
        try {
          if (statusIsReady && !statusWasReady) {
            await fetch("/api/whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                telephone: trimmedPhone,
                message: `Bonjour ${clientNom}, votre réparation est prête. Vous pouvez passer la récupérer au magasin.`,
              }),
            });
          } else if (!isEditMode) {
            await fetch("/api/whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                telephone: trimmedPhone,
                message: `Bonjour ${clientNom}, votre réparation a bien été enregistrée. Nous vous tiendrons informé de l'avancement.`,
              }),
            });
          }
        } catch (error) {
          console.error("Erreur notification WhatsApp", error);
        }
      }

      router.push("/reparations-en-cours");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Informations client</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nom complet *</label>
            <input
              value={clientNom}
              onChange={(event) => setClientNom(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Téléphone</label>
            <input
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bijoux</h2>
          <button
            type="button"
            onClick={addBijou}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium transition hover:border-amber-300"
          >
            Ajouter un bijou
          </button>
        </div>

        <div className="space-y-5">
          {bijoux.map((bijou, index) => (
            <article key={index} className="rounded-xl border border-zinc-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium">Bijou {index + 1}</p>
                {bijoux.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeBijou(index)}
                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Retirer
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Type de produit</label>
                  <select
                    value={bijou.type_produit}
                    onChange={(event) =>
                      updateBijou(index, { type_produit: event.target.value as TypeProduit })
                    }
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
                  >
                    {TYPES_PRODUIT.map((typeProduit) => (
                      <option key={typeProduit} value={typeProduit}>
                        {typeProduit}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <input
                    value={bijou.description}
                    onChange={(event) => updateBijou(index, { description: event.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
                    placeholder="Détail facultatif"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Prix (DH)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bijou.prix_reparation}
                    onChange={(event) => updateBijou(index, { prix_reparation: event.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium">Photos</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium text-zinc-500">Depuis la galerie</p>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) =>
                        addPhotosToBijou(index, Array.from(event.target.files ?? []))
                      }
                      className="block w-full text-sm"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-zinc-500">Prendre une photo</p>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      capture="environment"
                      onChange={(event) =>
                        addPhotosToBijou(index, Array.from(event.target.files ?? []))
                      }
                      className="block w-full text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCameraIndex(index)}
                  className="mt-3 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-amber-300"
                >
                  Ouvrir camera (PC)
                </button>

                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {previewsByBijou[index]?.existing.map((url, photoIndex) => (
                    <Image
                      key={`existing-${photoIndex}`}
                      src={url}
                      alt="Photo existante"
                      width={160}
                      height={160}
                      unoptimized
                      className="h-20 w-full rounded-md border border-zinc-200 object-cover"
                    />
                  ))}
                  {previewsByBijou[index]?.newPreviews.map((url, photoIndex) => (
                    <Image
                      key={`new-${photoIndex}`}
                      src={url}
                      alt="Aperçu"
                      width={160}
                      height={160}
                      unoptimized
                      className="h-20 w-full rounded-md border border-zinc-200 object-cover"
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Détails réparation</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Atelier</label>
            <select
              value={atelier}
              onChange={(event) => setAtelier(event.target.value as (typeof ATELIERS)[number])}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            >
              {ATELIERS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Date réception client *</label>
            <input
              type="date"
              required
              value={dateReception}
              onChange={(event) => setDateReception(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Date retour atelier</label>
            <input
              type="date"
              value={dateRetourAtelier}
              onChange={(event) => setDateRetourAtelier(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Date livraison client</label>
            <input
              type="date"
              value={dateLivraison}
              onChange={(event) => setDateLivraison(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Prix réparation (MAD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={prix}
              onChange={(event) => setPrix(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Statut</label>
            <select
              value={statut}
              onChange={(event) => setStatut(event.target.value as StatutReparation)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
            >
              {STATUTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              id="urgent"
              type="checkbox"
              checked={urgent}
              onChange={(event) => setUrgent(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="urgent" className="text-sm font-medium text-zinc-700">
              Réparation urgente
            </label>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-black px-5 py-2.5 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSubmitting
          ? "Enregistrement..."
          : isEditMode
            ? "Mettre à jour la réparation"
            : "Enregistrer la réparation"}
      </button>
      {cameraIndex !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Camera</h3>
              <button
                type="button"
                onClick={() => setCameraIndex(null)}
                className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium"
              >
                Fermer
              </button>
            </div>
            {cameraError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {cameraError}
              </p>
            ) : (
              <div className="space-y-3">
                <video ref={videoRef} className="w-full rounded-lg bg-black" />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white"
                  >
                    Prendre la photo
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      ) : null}
    </form>
  );
}
