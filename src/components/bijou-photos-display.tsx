"use client";

import { useState } from "react";
import { PhotoGallery } from "./photo-gallery";
import { createClient } from "@/lib/supabase/client";

type BijouPhotosDisplayProps = {
  bijouId: string;
  initialPhotos: string[];
  editable?: boolean;
};

export function BijouPhotosDisplay({ bijouId, initialPhotos, editable = false }: BijouPhotosDisplayProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePhoto = async (photoUrl: string) => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();

      // Trouver l'entrée de la photo dans la base de données
      const { data: photoRecord, error: fetchError } = await supabase
        .schema("app")
        .from("bijou_photos")
        .select("id, storage_path")
        .eq("bijou_id", bijouId)
        .eq("public_url", photoUrl)
        .single();

      if (fetchError || !photoRecord) {
        console.error("Photo introuvable dans la base de données:", fetchError);
        alert("Erreur lors de la suppression de la photo.");
        return;
      }

      // Supprimer le fichier du storage
      const { error: storageError } = await supabase.storage
        .from("bijoux-photos")
        .remove([photoRecord.storage_path]);

      if (storageError) {
        console.error("Erreur suppression storage:", storageError);
        alert("Erreur lors de la suppression du fichier.");
        return;
      }

      // Supprimer l'entrée de la base de données
      const { error: dbError } = await supabase
        .schema("app")
        .from("bijou_photos")
        .delete()
        .eq("id", photoRecord.id);

      if (dbError) {
        console.error("Erreur suppression DB:", dbError);
        alert("Erreur lors de la suppression de la photo.");
        return;
      }

      // Mettre à jour l'affichage
      setPhotos((current) => current.filter((url) => url !== photoUrl));
    } catch (error) {
      console.error("Erreur inattendue:", error);
      alert("Erreur lors de la suppression de la photo.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <PhotoGallery
      photos={photos}
      editable={editable}
      onDeletePhoto={editable ? handleDeletePhoto : undefined}
    />
  );
}
