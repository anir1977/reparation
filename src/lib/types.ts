import type { ATELIERS, STATUTS, TYPES_PRODUIT } from "@/lib/constants";

export type Atelier = (typeof ATELIERS)[number];
export type TypeProduit = (typeof TYPES_PRODUIT)[number];
export type StatutReparation = (typeof STATUTS)[number];

export interface Client {
  id: string;
  nom_complet: string;
  telephone: string | null;
}

export interface BijouPhoto {
  id: string;
  storage_path: string;
  public_url: string;
}

export interface Bijou {
  id: string;
  reparation_id: string;
  type_produit: TypeProduit;
  description: string | null;
  prix_reparation: number;
  bijou_photos?: BijouPhoto[];
}

export interface Reparation {
  id: string;
  client_id: string;
  atelier: Atelier;
  date_reception_client: string;
  date_retour_atelier: string | null;
  date_livraison_client: string | null;
  prix_reparation: number;
  urgent: boolean;
  statut: StatutReparation;
  client?: Client;
  bijoux?: Bijou[];
}

export interface ReparationFormValues {
  clientNomComplet: string;
  clientTelephone: string;
  atelier: Atelier;
  dateReceptionClient: string;
  dateRetourAtelier: string;
  dateLivraisonClient: string;
  prixReparation: string;
  statut: StatutReparation;
}

export interface ExistingBijouInput {
  id: string;
  type_produit: TypeProduit;
  description: string;
  photos: string[];
  prix_reparation: string;
}

export interface ReparationEditPayload {
  id: string;
  client: {
    id: string;
    nom_complet: string;
    telephone: string;
  };
  atelier: Atelier;
  date_reception_client: string;
  date_retour_atelier: string;
  date_livraison_client: string;
  prix_reparation: string;
  urgent: boolean;
  statut: StatutReparation;
  bijoux: ExistingBijouInput[];
}
