-- Optimisation de la base de données pour améliorer les performances

-- Index composites pour les requêtes fréquentes
create index if not exists idx_reparations_statut_date on app.reparations(statut, date_reception_client desc);
create index if not exists idx_reparations_client_statut on app.reparations(client_id, statut);
create index if not exists idx_reparations_date_reception on app.reparations(date_reception_client desc);
create index if not exists idx_reparations_urgent_statut on app.reparations(urgent, statut) where urgent = true;

-- Index pour les clients
create index if not exists idx_clients_nom on app.clients(lower(nom_complet));
create index if not exists idx_clients_telephone on app.clients(telephone) where telephone is not null;

-- Index pour les bijoux
create index if not exists idx_bijoux_type on app.bijoux(type_produit);

-- Analyser les tables pour optimiser le query planner
analyze app.reparations;
analyze app.clients;
analyze app.bijoux;
analyze app.bijou_photos;
