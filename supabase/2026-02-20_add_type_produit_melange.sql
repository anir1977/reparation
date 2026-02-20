-- Ajout du type de produit spécial pour articles mélangés (mkhalta)
alter type app.type_produit add value if not exists 'mélange';
