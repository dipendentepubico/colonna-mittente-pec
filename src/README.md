# Colonna Mittente PEC

Questo add-on aggiunge due nuove colonne alla tabella contenente la lista dei messaggi:
1) Colonna "Mittente": mostra il contenuto dell'header Reply-To che contiene il reale mittente della PEC
- caso header presente
```
Reply-To: c.cappuccio@pec.dipendentepubico.it
```
in colonna compare
```
c.cappuccio@pec.dipendentepubico.it
```
- caso header assente
in colonna compare l'autore ripulito da Thunderbird
```
From: Fornitore Posta Certificata <posta-certificata@pec.fornitore.it>
```
in colonna compare
```
Fornitore Posta Certificata
```



2) Colonna "Mittente PCD": mostra il mittente estratto con regex dall'header From
Nei tre casi
```
From: "Per conto di: c.cappuccio@pec.dipendentepubico.it" <posta-certificata@pec.fornitore.it>
From: Fornitore Posta Certificata <posta-certificata@pec.fornitore.it>
From: posta-certificata@pec.fornitore.it
```
applicando la regex
```
/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
```
estrae l'indirizzo email o il nome del mittente
```
c.cappuccio@pec.dipendentepubico.it
posta-certificata@pec.fornitore.it
posta-certificata@pec.fornitore.it
```


## Fork
Forked from namenaddress-column  add-on, by Savasdotexe that is  
Forked from 'Full address column' add-on, by lkosson, which was based on "SFreq" by Jorg K.

