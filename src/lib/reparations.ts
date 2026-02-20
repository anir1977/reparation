import { createClient } from "@/lib/supabase/server";
import type { Reparation, ReparationEditPayload, StatutReparation, TypeProduit } from "@/lib/types";
import { unstable_cache } from "next/cache";

function isMissingGrammageColumnError(error: {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
} | null) {
  if (!error) {
    return false;
  }

  const fullMessage = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return error.code === "PGRST204" || fullMessage.includes("grammage_produit");
}

async function getClientsMap(clientIds: string[]) {
  if (!clientIds.length) {
    return new Map<string, { id: string; nom_complet: string; telephone: string | null }>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .schema("app")
    .from("clients")
    .select("id, nom_complet, telephone")
    .in("id", clientIds);

  return new Map((data ?? []).map((client) => [client.id, client]));
}

async function getBijouxCountMap(reparationIds: string[]) {
  if (!reparationIds.length) {
    return new Map<string, number>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .schema("app")
    .from("bijoux")
    .select("id, reparation_id")
    .in("reparation_id", reparationIds);

  const map = new Map<string, number>();
  for (const bijou of data ?? []) {
    map.set(bijou.reparation_id, (map.get(bijou.reparation_id) ?? 0) + 1);
  }

  return map;
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const today = new Date();
  const isoToday = today.toISOString().slice(0, 10);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    .toISOString()
    .slice(0, 10);

  const [{ count: todayCount }, { count: monthCount }, { count: threeMonthsCount }, { count: totalCount }] =
    await Promise.all([
      supabase
        .schema("app")
        .from("reparations")
        .select("id", { count: "exact", head: true })
        .eq("date_reception_client", isoToday),
      supabase
        .schema("app")
        .from("reparations")
        .select("id", { count: "exact", head: true })
        .gte("date_reception_client", monthStart),
      supabase
        .schema("app")
        .from("reparations")
        .select("id", { count: "exact", head: true })
        .gte("date_reception_client", threeMonthsAgo),
      supabase
        .schema("app")
        .from("reparations")
        .select("id", { count: "exact", head: true }),
    ]);

  return {
    today: todayCount ?? 0,
    month: monthCount ?? 0,
    threeMonths: threeMonthsCount ?? 0,
    total: totalCount ?? 0,
  };
}

export async function getReparationsByStatut(statut: StatutReparation): Promise<
  Array<Reparation & { client_nom: string; client_telephone: string | null; bijoux_count: number }>
> {
  const supabase = await createClient();
  const { data: reparations } = await supabase
    .schema("app")
    .from("reparations")
    .select(
      "id, client_id, atelier, date_reception_client, date_retour_atelier, date_livraison_client, prix_reparation, urgent, statut",
    )
    .eq("statut", statut)
    .order("date_reception_client", { ascending: false });

  const rows = reparations ?? [];
  const clientIds = [...new Set(rows.map((row) => row.client_id))];
  const repairIds = rows.map((row) => row.id);

  const [clientsMap, bijouxCountMap] = await Promise.all([
    getClientsMap(clientIds),
    getBijouxCountMap(repairIds),
  ]);

  return rows.map((row) => {
    const client = clientsMap.get(row.client_id);

    return {
      ...row,
      prix_reparation: Number(row.prix_reparation),
      urgent: row.urgent ?? false,
      client_nom: client?.nom_complet ?? "Client inconnu",
      client_telephone: client?.telephone ?? null,
      bijoux_count: bijouxCountMap.get(row.id) ?? 0,
    };
  });
}

export async function getHistoriqueReparations() {
  const supabase = await createClient();
  const { data: reparations } = await supabase
    .schema("app")
    .from("reparations")
    .select(
      "id, client_id, atelier, date_reception_client, date_retour_atelier, date_livraison_client, prix_reparation, urgent, statut",
    )
    .order("date_reception_client", { ascending: false });

  const rows = reparations ?? [];
  const clientIds = [...new Set(rows.map((row) => row.client_id))];
  const clientsMap = await getClientsMap(clientIds);

  return rows.map((row) => {
    const client = clientsMap.get(row.client_id);

    return {
      ...row,
      prix_reparation: Number(row.prix_reparation),
      urgent: row.urgent ?? false,
      client_nom: client?.nom_complet ?? "Client inconnu",
      client_telephone: client?.telephone ?? null,
    };
  });
}

export async function getRecentReparations(limit = 8) {
  const supabase = await createClient();
  const { data: reparations } = await supabase
    .schema("app")
    .from("reparations")
    .select("id, client_id, date_reception_client, statut, urgent")
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = reparations ?? [];
  const clientIds = [...new Set(rows.map((row) => row.client_id))];
  const clientsMap = await getClientsMap(clientIds);

  return rows.map((row) => {
    const client = clientsMap.get(row.client_id);
    return {
      id: row.id,
      date_reception_client: row.date_reception_client,
      statut: row.statut,
      urgent: row.urgent ?? false,
      client_nom: client?.nom_complet ?? "Client inconnu",
      client_telephone: client?.telephone ?? null,
    };
  });
}

export async function getReparationForEdit(id: string): Promise<ReparationEditPayload | null> {
  const supabase = await createClient();

  const { data: reparation } = await supabase
    .schema("app")
    .from("reparations")
    .select(
      "id, client_id, atelier, date_reception_client, date_retour_atelier, date_livraison_client, prix_reparation, urgent, statut",
    )
    .eq("id", id)
    .maybeSingle();

  if (!reparation) {
    return null;
  }

  const { data: client } = await supabase
    .schema("app")
    .from("clients")
    .select("id, nom_complet, telephone")
    .eq("id", reparation.client_id)
    .maybeSingle();

  type BijouRow = {
    id: string;
    type_produit: string;
    type_produit_personnalise: string | null;
    grammage_produit: number | null;
    description: string | null;
    prix_reparation: number;
  };

  let bijoux: BijouRow[] = [];
  const bijouxWithGrammage = await supabase
    .schema("app")
    .from("bijoux")
    .select("id, type_produit, type_produit_personnalise, grammage_produit, description, prix_reparation")
    .eq("reparation_id", reparation.id)
    .order("created_at", { ascending: true });

  if (isMissingGrammageColumnError(bijouxWithGrammage.error)) {
    const legacyBijoux = await supabase
      .schema("app")
      .from("bijoux")
      .select("id, type_produit, type_produit_personnalise, description, prix_reparation")
      .eq("reparation_id", reparation.id)
      .order("created_at", { ascending: true });

    bijoux = (legacyBijoux.data ?? []).map((item) => ({
      ...item,
      grammage_produit: null,
    })) as BijouRow[];
  } else {
    bijoux = (bijouxWithGrammage.data ?? []) as BijouRow[];
  }

  const bijouIds = (bijoux ?? []).map((item) => item.id);
  const { data: photos } = bijouIds.length
    ? await supabase
        .schema("app")
        .from("bijou_photos")
        .select("bijou_id, public_url")
        .in("bijou_id", bijouIds)
    : { data: [] as Array<{ bijou_id: string; public_url: string }> };

  const photosByBijou = new Map<string, string[]>();
  for (const photo of photos ?? []) {
    const current = photosByBijou.get(photo.bijou_id) ?? [];
    current.push(photo.public_url);
    photosByBijou.set(photo.bijou_id, current);
  }

  return {
    id: reparation.id,
    client: {
      id: client?.id ?? "",
      nom_complet: client?.nom_complet ?? "",
      telephone: client?.telephone ?? "",
    },
    atelier: reparation.atelier,
    date_reception_client: reparation.date_reception_client,
    date_retour_atelier: reparation.date_retour_atelier ?? "",
    date_livraison_client: reparation.date_livraison_client ?? "",
    prix_reparation: Number(reparation.prix_reparation).toString(),
    urgent: reparation.urgent ?? false,
    statut: reparation.statut,
    bijoux: (bijoux ?? []).map((item) => ({
      id: item.id,
      type_produit: item.type_produit as TypeProduit,
      type_produit_personnalise: item.type_produit_personnalise ?? "",
      grammage_produit:
        item.grammage_produit === null || item.grammage_produit === undefined
          ? ""
          : Number(item.grammage_produit).toString(),
      description: item.description ?? "",
      prix_reparation: Number(item.prix_reparation ?? 0).toString(),
      photos: photosByBijou.get(item.id) ?? [],
    })),
  };
}

export async function getStatistiques() {
  const supabase = await createClient();

  const [{ data: byStatut }, { data: byAtelier }] = await Promise.all([
    supabase
      .schema("app")
      .from("reparations")
      .select("statut")
      .order("created_at", { ascending: false }),
    supabase
      .schema("app")
      .from("reparations")
      .select("atelier")
      .order("created_at", { ascending: false }),
  ]);

  const statutMap = new Map<string, number>();
  for (const row of byStatut ?? []) {
    statutMap.set(row.statut, (statutMap.get(row.statut) ?? 0) + 1);
  }

  const atelierMap = new Map<string, number>();
  for (const row of byAtelier ?? []) {
    atelierMap.set(row.atelier, (atelierMap.get(row.atelier) ?? 0) + 1);
  }

  return {
    parStatut: Array.from(statutMap.entries()).map(([label, value]) => ({ label, value })),
    parAtelier: Array.from(atelierMap.entries()).map(([label, value]) => ({ label, value })),
  };
}
