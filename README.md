# TrackRace

App mobile per trovare piste kart vicine e seguire gli aggiornamenti dei gestori.

## Come avviarla sul tuo telefono (per provarla subito)

1. Installa **Node.js** sul tuo computer (se non ce l'hai già): https://nodejs.org
2. Installa l'app **Expo Go** dal Play Store / App Store sul tuo telefono
3. Apri il terminale in questa cartella ed esegui:
   ```
   npm install
   npx expo start
   ```
4. Si aprirà un QR code nel terminale/browser: inquadralo con la fotocamera del telefono
   (su Android con l'app Expo Go, su iPhone con la fotocamera normale)
5. L'app si aprirà sul tuo telefono

## Struttura del progetto

```
App.tsx                        → entry point, mostra login o app principale
src/lib/supabase.ts            → connessione al database
src/context/AuthContext.tsx    → gestione sessione utente e ruolo
src/navigation/                → tab bar e navigazione tra schermate
src/screens/
  AuthScreen.tsx                → login / registrazione
  HomeScreen.tsx                → lista piste vicine con filtri
  TrackDetailScreen.tsx         → dettaglio pista, follow, feed post
  RequestTrackScreen.tsx        → form "aggiungi la tua pista" per gestori
  ProfileScreen.tsx             → profilo utente
```

## Prima di avviarla: hai bisogno di almeno una pista nel database

Il database è vuoto finché non aggiungi manualmente qualche pista di prova.
Nel pannello Supabase, vai su **Table Editor → tracks** e inserisci una riga di test,
oppure esegui questa query nello **SQL Editor**:

```sql
insert into tracks (name, address, location, indoor, kids_friendly, allows_minimoto, price_info, status)
values (
  'Kartodromo Test',
  'Via Roma 1, Torino',
  st_point(7.6869, 45.0703)::geography, -- lng, lat (nota l'ordine!)
  false, true, true, '25€ / 10 minuti',
  'active'
);
```

## Schema del database

Lo schema completo (tabelle, funzione `nearby_tracks`, Row Level Security) è in
[`backend/schema.sql`](backend/schema.sql).

## Prossimi passi

- Aggiungere una mappa visuale (richiede build EAS con dev client)
- Pannello web per i gestori (pubblicare post, gestire la propria pista)
- Pannello admin per te (approvare richieste gestori, inserire piste)
- Upload immagini da telefono (Supabase Storage)
