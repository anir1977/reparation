-- Ajout de nouveaux types de produit
alter type app.type_produit add value if not exists 'mdaja';
alter type app.type_produit add value if not exists 'ensemble';
alter type app.type_produit add value if not exists 'parure';
alter type app.type_produit add value if not exists 'sautoir';
alter type app.type_produit add value if not exists 'broche';
