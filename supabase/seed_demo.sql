-- Ben Daoud Réparation - Données démo
-- Exécuter ce script APRÈS supabase/schema.sql

begin;

-- Nettoyage idempotent des anciennes données démo
with demo_clients as (
  select id
  from app.clients
  where nom_complet like 'DEMO BDR %'
)
delete from app.reparations
where client_id in (select id from demo_clients);

delete from app.clients
where nom_complet like 'DEMO BDR %';

-- Clients démo
insert into app.clients (nom_complet, telephone)
values
  ('DEMO BDR - Sara El Fassi', '0600000001'),
  ('DEMO BDR - Yassine Amrani', '0600000002'),
  ('DEMO BDR - Imane Bennis', '0600000003'),
  ('DEMO BDR - Omar Tazi', '0600000004'),
  ('DEMO BDR - Meryem Alaoui', '0600000005'),
  ('DEMO BDR - Hamza Idrissi', '0600000006'),
  ('DEMO BDR - Salma Zniber', '0600000007'),
  ('DEMO BDR - Rachid Benali', '0600000008');

-- Réparations démo (aujourd'hui, ce mois, 3 derniers mois)
insert into app.reparations (
  client_id,
  atelier,
  date_reception_client,
  date_retour_atelier,
  date_livraison_client,
  prix_reparation,
  statut
)
values
  ((select id from app.clients where nom_complet = 'DEMO BDR - Sara El Fassi'), 'Brahim', current_date, current_date + 2, null, 320, 'en cours'),
  ((select id from app.clients where nom_complet = 'DEMO BDR - Yassine Amrani'), 'Miyara', current_date, current_date + 1, null, 180, 'en cours'),
  ((select id from app.clients where nom_complet = 'DEMO BDR - Imane Bennis'), 'Oro', current_date - 3, current_date, null, 450, 'prêt'),
  ((select id from app.clients where nom_complet = 'DEMO BDR - Omar Tazi'), 'mecanica', current_date - 5, current_date - 1, null, 700, 'prêt'),
  ((select id from app.clients where nom_complet = 'DEMO BDR - Meryem Alaoui'), 'Rachid montre', current_date - 9, current_date - 2, current_date - 1, 950, 'livré'),
  ((select id from app.clients where nom_complet = 'DEMO BDR - Hamza Idrissi'), 'Hassan montre (kissariya)', current_date - 18, current_date - 9, current_date - 7, 1200, 'livré'),
  ((select id from app.clients where nom_complet = 'DEMO BDR - Salma Zniber'), 'Youssef', current_date - 35, current_date - 25, null, 250, 'en cours'),
  ((select id from app.clients where nom_complet = 'DEMO BDR - Rachid Benali'), 'Adil', current_date - 62, current_date - 52, current_date - 48, 380, 'livré');

-- Bijoux démo (plusieurs bijoux sur certaines réparations)
insert into app.bijoux (reparation_id, type_produit, description)
values
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Sara El Fassi'
    limit 1
  ), 'bague', 'Mise à taille + polissage'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Sara El Fassi'
    limit 1
  ), 'pendentif', 'Soudure anneau cassé'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Yassine Amrani'
    limit 1
  ), 'chaîne', 'Réparation fermoir'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Imane Bennis'
    limit 1
  ), 'collier', 'Nettoyage et rhodiage'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Omar Tazi'
    limit 1
  ), 'montre', 'Révision mécanisme'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Meryem Alaoui'
    limit 1
  ), 'montre', 'Changement verre'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Hamza Idrissi'
    limit 1
  ), 'gourmette', 'Ressoudage maillon'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Salma Zniber'
    limit 1
  ), 'bracelet', 'Ajustement longueur'),
  ((
    select r.id
    from app.reparations r
    join app.clients c on c.id = r.client_id
    where c.nom_complet = 'DEMO BDR - Rachid Benali'
    limit 1
  ), 'bague', 'Sertissage pierre');

-- Photos démo (URLs factices pour visualiser les cartes/aperçus)
insert into app.bijou_photos (bijou_id, storage_path, public_url)
values
  (
    (select id from app.bijoux where description = 'Mise à taille + polissage' limit 1),
    'demo/bague-sara-1.jpg',
    'https://picsum.photos/seed/bdr-1/600/600'
  ),
  (
    (select id from app.bijoux where description = 'Mise à taille + polissage' limit 1),
    'demo/bague-sara-2.jpg',
    'https://picsum.photos/seed/bdr-2/600/600'
  ),
  (
    (select id from app.bijoux where description = 'Réparation fermoir' limit 1),
    'demo/chaine-yassine-1.jpg',
    'https://picsum.photos/seed/bdr-3/600/600'
  ),
  (
    (select id from app.bijoux where description = 'Révision mécanisme' limit 1),
    'demo/montre-omar-1.jpg',
    'https://picsum.photos/seed/bdr-4/600/600'
  ),
  (
    (select id from app.bijoux where description = 'Changement verre' limit 1),
    'demo/montre-meryem-1.jpg',
    'https://picsum.photos/seed/bdr-5/600/600'
  ),
  (
    (select id from app.bijoux where description = 'Sertissage pierre' limit 1),
    'demo/bague-rachid-1.jpg',
    'https://picsum.photos/seed/bdr-6/600/600'
  );

commit;

-- Vérification rapide
select
  (select count(*) from app.clients where nom_complet like 'DEMO BDR %') as clients_demo,
  (select count(*) from app.reparations r join app.clients c on c.id = r.client_id where c.nom_complet like 'DEMO BDR %') as reparations_demo,
  (select count(*) from app.bijoux b join app.reparations r on r.id = b.reparation_id join app.clients c on c.id = r.client_id where c.nom_complet like 'DEMO BDR %') as bijoux_demo;
