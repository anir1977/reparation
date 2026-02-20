"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ATELIERS, STATUTS, TYPES_PRODUIT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { ReparationEditPayload, StatutReparation, TypeProduit } from "@/lib/types";
import { PhotoGallery } from "@/components/photo-gallery";

type BijouInput = {
  type_produit: TypeProduit;
  type_produit_personnalise: string;
  grammage_produit: string;
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
          type_produit_personnalise: b.type_produit_personnalise ?? "",
          grammage_produit: b.grammage_produit ?? "",
          description: b.description,
          prix_reparation: b.prix_reparation ?? "0",
          existingPhotos: b.photos,
          newPhotos: [],
        }))
      : [
          {
            type_produit: TYPES_PRODUIT[0],
            type_produit_personnalise: "",
            grammage_produit: "",
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

  const sortedTypesProduit = useMemo(
    () => [...TYPES_PRODUIT].sort((a, b) => a.localeCompare(b, "fr")),
    [],
  );

  const addBijou = () => {
    setBijoux((current) => [
      ...current,
      {
        type_produit: TYPES_PRODUIT[0],
        type_produit_personnalise: "",
        grammage_produit: "",
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

  const deletePhotoFromBijou = (bijouIndex: number, photoUrl: string) => {
    setBijoux((current) =>
      current.map((item, currentIndex) => {
        if (currentIndex !== bijouIndex) return item;

        // Si c'est une URL blob (nouvelle photo), on supprime du tableau newPhotos
        if (photoUrl.startsWith("blob:")) {
          const blobIndex = item.newPhotos.findIndex((file) => fileToPreview(file) === photoUrl);
          if (blobIndex !== -1) {
            URL.revokeObjectURL(photoUrl); // Libérer la mémoire
            return {
              ...item,
              newPhotos: item.newPhotos.filter((_, idx) => idx !== blobIndex),
            };
          }
        }

        // Sinon c'est une photo existante, on la retire de existingPhotos
        return {
          ...item,
          existingPhotos: item.existingPhotos.filter((url) => url !== photoUrl),
        };
      }),
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

    const hasMissingCustomType = bijoux.some(
      (bijou) => bijou.type_produit === "autre" && !bijou.type_produit_personnalise.trim(),
    );

    if (hasMissingCustomType) {
      setErrorMessage("Pour le type 'autre', saisissez un type personnalisé.");
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
            type_produit_personnalise:
              bijou.type_produit === "autre" ? bijou.type_produit_personnalise.trim() || null : null,
            grammage_produit: bijou.grammage_produit.trim()
              ? Number(bijou.grammage_produit)
              : null,
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
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      <section className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
        <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Informations client</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Nom complet *</label>
            <input
              value={clientNom}
              onChange={(event) => setClientNom(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Téléphone</label>
            <input
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
              type="tel"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold">Bijoux</h2>
          <button
            type="button"
            onClick={addBijou}
            className="w-full sm:w-auto rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium transition hover:border-amber-300 active:bg-amber-50"
          >
            + Ajouter un bijou
          </button>
        </div>

        <div className="space-y-3 sm:space-y-5">
          {bijoux.map((bijou, index) => (
            <article key={index} className="rounded-lg sm:rounded-xl border border-zinc-200 p-3 sm:p-4 bg-gradient-to-br from-white to-zinc-50/30">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm sm:text-base font-semibold text-amber-900">Bijou {index + 1}</p>
                {bijoux.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeBijou(index)}
                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 active:bg-red-100"
                  >
                    Retirer
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">Type de produit</label>
                  <select
                    value={bijou.type_produit}
                    onChange={(event) => {
                      const nextType = event.target.value as TypeProduit;
                      updateBijou(index, {
                        type_produit: nextType,
                        type_produit_personnalise:
                          nextType === "autre" ? bijou.type_produit_personnalise : "",
                      });
                    }}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
                  >
                    {sortedTypesProduit.map((typeProduit) => (
                      <option key={typeProduit} value={typeProduit}>
                        {typeProduit}
                      </option>
                    ))}
                  </select>
                </div>
                {bijou.type_produit === "autre" ? (
                  <div>
                    <label className="mb-1 block text-xs sm:text-sm font-medium">Type personnalisé *</label>
                    <input
                      value={bijou.type_produit_personnalise}
                      onChange={(event) =>
                        updateBijou(index, { type_produit_personnalise: event.target.value })
                      }
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
                      placeholder="Ex: rivière, gourmette plate, etc."
                    />
                  </div>
                ) : null}
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">Gramage de produit (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={bijou.grammage_produit}
                    onChange={(event) => updateBijou(index, { grammage_produit: event.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
                    placeholder="Ex: 7.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">Description</label>
                  <input
                    value={bijou.description}
                    onChange={(event) => updateBijou(index, { description: event.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
                    placeholder="Détail facultatif"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium">Prix</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={bijou.prix_reparation}
                    onChange={(event) => updateBijou(index, { prix_reparation: event.target.value })}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <label className="mb-2 block text-xs sm:text-sm font-medium">Photos</label>
                <div className="space-y-2">
                  <div>
                    <p className="mb-1 text-xs font-medium text-zinc-500">📁 Depuis la galerie</p>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) =>
                        addPhotosToBijou(index, Array.from(event.target.files ?? []))
                      }
                      className="block w-full text-xs sm:text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-amber-700 hover:file:bg-amber-100"
                    />
                  </div>
                  <div className="md:hidden">
                    <p className="mb-1 text-xs font-medium text-zinc-500">📷 Prendre une photo</p>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      capture="environment"
                      onChange={(event) =>
                        addPhotosToBijou(index, Array.from(event.target.files ?? []))
                      }
                      className="block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCameraIndex(index)}
                    className="hidden md:inline-flex w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-amber-300 justify-center items-center gap-2"
                  >
                    🎥 Ouvrir caméra (PC)
                  </button>
                </div>

                {(previewsByBijou[index]?.existing.length > 0 || previewsByBijou[index]?.newPreviews.length > 0) && (
                  <div className="mt-3">
                    <PhotoGallery
                      photos={[
                        ...previewsByBijou[index].existing,
                        ...previewsByBijou[index].newPreviews,
                      ]}
                      editable={true}
                      onDeletePhoto={(photoUrl) => deletePhotoFromBijou(index, photoUrl)}
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
        <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Détails réparation</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Atelier</label>
            <select
              value={atelier}
              onChange={(event) => setAtelier(event.target.value as (typeof ATELIERS)[number])}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            >
              {ATELIERS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Date réception client *</label>
            <input
              type="date"
              required
              value={dateReception}
              onChange={(event) => setDateReception(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Date retour atelier</label>
            <input
              type="date"
              value={dateRetourAtelier}
              onChange={(event) => setDateRetourAtelier(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Date livraison client</label>
            <input
              type="date"
              value={dateLivraison}
              onChange={(event) => setDateLivraison(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Prix réparation</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={prix}
              onChange={(event) => setPrix(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs sm:text-sm font-medium">Statut</label>
            <select
              value={statut}
              onChange={(event) => setStatut(event.target.value as StatutReparation)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-amber-400"
            >
              {STATUTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 pt-4 sm:pt-6 md:col-span-3">
            <input
              id="urgent"
              type="checkbox"
              checked={urgent}
              onChange={(event) => setUrgent(event.target.checked)}
              className="h-4 w-4 sm:h-5 sm:w-5 rounded border-zinc-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="urgent" className="text-xs sm:text-sm font-medium text-zinc-700">
              🔥 Réparation urgente
            </label>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="sticky bottom-28 md:bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2 -mx-3 sm:-mx-0 px-3 sm:px-0">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-black px-5 py-3 sm:py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60 shadow-lg"
        >
          {isSubmitting
            ? "⏳ Enregistrement..."
            : isEditMode
              ? "✓ Mettre à jour la réparation"
              : "✓ Enregistrer la réparation"}
        </button>
      </div>
      {cameraIndex !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
          <div className="w-full max-w-xl rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold">📷 Caméra</h3>
              <button
                type="button"
                onClick={() => setCameraIndex(null)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 active:bg-zinc-100"
              >
                ✕ Fermer
              </button>
            </div>
            {cameraError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {cameraError}
              </p>
            ) : (
              <div className="space-y-3">
                <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video" />
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full sm:w-auto rounded-lg bg-black px-4 py-3 sm:py-2 text-sm font-medium text-white hover:bg-zinc-800 active:scale-95 transition"
                  >
                    📸 Prendre la photo
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
