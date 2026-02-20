-- Ajouter un type produit personnalisé pour éviter toute dépendance au cache UI
alter table if exists app.bijoux
  add column if not exists type_produit_personnalise text;
