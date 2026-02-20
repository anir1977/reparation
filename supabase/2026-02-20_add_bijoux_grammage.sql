-- Ajouter le grammage du produit sur les bijoux
alter table if exists app.bijoux
  add column if not exists grammage_produit numeric(10,2);
