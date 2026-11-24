# Perché usiamo una transazione MongoDB

L'operazione PATCH cambia lo stato di una richiesta e scrive un evento nello storico. Prima della v0.7 queste scritture erano separate: un guasto alla seconda poteva lasciare la richiesta aggiornata senza audit.

Ora `session.withTransaction` raggruppa lettura, controllo versione, aggiornamento e evento di audit. Se una scrittura fallisce, la transazione non viene confermata. Il filtro `{ _id, version, status }` implementa optimistic concurrency: due modifiche basate sulla stessa versione non possono entrambe riuscire. Il client riceve `409 Conflict` per una versione obsoleta.

**Prerequisito:** MongoDB replica set (anche a nodo singolo per lo sviluppo) oppure cluster sharded. Un server standalone non supporta queste transazioni.

Avvio locale:
1. `docker compose up -d`
2. `docker compose exec mongo mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'` (solo prima inizializzazione)
3. Impostare `MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true` in `.env.local`
4. `npm install && npm test && npm run dev`

**Limitazione:** la gestione degli errori transitori di commit e il test di integrazione reale devono ancora essere verificati. Il codice non prova da solo che l'infrastruttura sia configurata correttamente.
