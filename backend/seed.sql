-- TrackRace — dati di esempio per popolare la Home in fase di sviluppo.
-- Da eseguire nello SQL Editor di Supabase dopo backend/schema.sql.
-- Le piste create qui sono 'active' così compaiono subito in nearby_tracks().

insert into tracks (name, address, description, location, indoor, kids_friendly, allows_minimoto, price_info, images, status)
values
  (
    'Kartodromo Test Torino',
    'Via Roma 1, Torino',
    'Pista di prova indoor, ideale per principianti e bambini.',
    st_point(7.6869, 45.0703)::geography, -- lng, lat
    true, true, true, '25€ / 10 minuti',
    '{}', 'active'
  ),
  (
    'Autodromo Test Milano',
    'Via Dante 10, Milano',
    'Pista outdoor per piloti più esperti, mini moto disponibili nel weekend.',
    st_point(9.1900, 45.4642)::geography,
    false, false, true, '30€ / 15 minuti',
    '{}', 'active'
  );
