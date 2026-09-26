# SKILL.md

## Projekt célja
A Comply Flow UI célja, hogy egy auditálható, szabályvezérelt panaszkezelő rendszer felhasználói felületét megtervezze és implementálja kizárólag a frontend számára. A rendszer AI támogatással segíti a panaszok feldolgozását, ugyanakkor biztosítja a szabályok és az adatok nyomon követhetőségét.

A UI-nak nem a backend logika a központi eleme, hanem az auditálhatóság, a kontextus láthatósága és a beszélgetés folytathatósága.

---

## Projekt hatóköre
- Kizárólag UI és UX tervezés/implementáció.
- Nincs backend integráció a jelenlegi fázisban.
- Mintaadatok használata a prototípushoz és az UI validációhoz.
- Az alkalmazás célja a chates panaszkezelés és a részletes audit infók megjelenítése.

---

## Fő funkcionális követelmények

### 1. Első oldal: Chat és előzmények

#### A) Korábbi chat előzmények listája
- A bal oldalon vagy bal felső panelben listázódik a korábbi beszélgetések.
- A chat history item esetén elegendő a rövid summary megjelenítése.
- A lista általában szűrhető vagy rendezhető lehet.
- Kattintásra a felhasználó megnyithatja az adott beszélgetés teljes kontextusát.
- A további metaadatok opcionálisak lehetnek, de nem kötelezőek a fő listanézetben.

#### B) Chatablak és beszélgetés megjelenítése
- A chat középen jelenik meg, igazítva a layout közepére.
- A beszélgetésben a felhasználó kérdései és az AI válaszai különíthetők el.
- A jobb oldalon jelenjenek meg a felhasználói kérdések.
- A bal oldalon jelenjenek meg a felhasználó válaszai / állapotok.
- A chat fölött legyen egy beviteli mező és egy küldés gomb.
- Az AI válasz megjelenhet például külön mezőben, színekkel és ikonokkal elkülönítve.
- A chat felület legyen olvasható, jól tagolt, mobil és desktop méretben is működő.

#### C) Beszélgetés folytathatósága
- Ha a felhasználó kiválaszt egy korábbi chat előzményt, a beszélgetés tovább folytatható.
- A kiválasztott előzmény betöltődik, és a felhasználó új üzenetet küldhet hozzá.
- Fontos, hogy az előzmények ne csak „read-only” listaként jelenjenek meg, hanem kontextusban működjenek.

#### D) Chat details button
- A chat panelben legyen egy „Chat details” vagy hasonló gomb.
- E gomb nyomására navigáljon a felhasználó a második oldalra.
- A navigáció legyen egyértelmű és közvetlen, a teljes beszélgetés kontextusával.

#### E) Modell és verzió kiválasztása
- A chat felett vagy a toolbarban legyen dropdown menü a modell kiválasztására.
- Példák:
  - chatgpt
  - claude
  - gemini
- Továbbá legyen verzió dropdown is:
  - gpt-4.3
  - gpt-4o
  - o3-mini
  - stb.
- A megjelenített modell-választásnak nyomon követhetőnek kell lennie a beszélgetés részleteinél is.

---

### 2. Második oldal: Chat details / Audit panel

#### A) Header
- A headerben legyen látható a szöveg: „Chat Details” vagy magyarul: „Chat adatok / Chat details”.
- A header legyen egyszerű, strukturált és jól elválasztva a tartalmaktól.

#### B) Dropdown a részletek kiválasztásához
- A felhasználó válasszon ki egy konkrét chat válaszhoz tartozó detailet.
- Példák:
  - 1
  - 2
  - 3
  - 4
  - 5
- A dropdown alapján a rendszer módosítja a detail panel tartalmát.
- A kiválasztott elemhez tartozó audit és prompt adatok jelenjenek meg.

#### C) Előfeldolgozó modul eredménye
- Egy nem szerkeszthető textarea mezőben jelenjen meg az előfeldolgozó modul kimenete.
- Ezen belül szerepelnie kell:
  - a tisztított szöveg
  - a kategória
  - az átfogalmazott prompt, amelyet az LLM-nek elküldünk
- A textarea legyen read-only, nem szerkeszthető.
- A felhasználó itt csak megtekintésre tudja használni.

#### D) Alkalmazott szabály megjelenítése
- Jelenítsük meg azokat a szabályokat, amelyeket a rendszer alkalmaz az adatok védelmére.
- Példa:
  - „Tóth Jakab vagyok, az egyenlegem 100000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?”
- A rendszerben legyen rögzített leírás, hogy a név személyes adat, ezért nem küldhető tovább az LLM felé.
- A UI-nak meg kell jelenítenie ezt a szabályt: például:
  - „A név személyes adat; nem küldjük tovább az LLM számára.”
- Ez a funkció fontos az auditálhatóság miatt: a felhasználó láthassa, mi került szűrésre vagy módosításra.

#### E) LLM felé küldött prompt megjelenítése
- Jelenjen meg az az utolsó prompt, amit ténylegesen az LLM felé küldünk.
- Példa:
  - „00000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?”
- Ez azt mutatja, hogy a személyes adat (név) kiszűrésre került a promptből.
- A felületnek itt is auditálható, ellenőrizhető formában kell megjeleníteni.

---

## UX és UI alapelvek
- Minimalista, tisztán olvasható és professzionális felület.
- Középre igazított chat panel és strukturált oldalelrendezés.
- Külön színsémával jelölhető a felhasználói kérés és az AI válasz.
- A részletes audit oldal legyen információs, nem interaktív, a felhasználó elsősorban ellenőrzésre használja.
- A rendszer legyen biztonságos, nyomon követhető és szabályvezérelt.

---

## Adatmodell és UI-állapotok
A frontend elképzelhető egyfajta mockadat modell szerint:

- ChatHistoryItem
  - id
  - summary
  - createdAt
  - status
  - messages[]

A chat history listában a felhasználó számára elegendő csak a summary megjelenítése; a title, illetve a többi metaadat opcionális információként kezelhető.

- ChatMessage
  - id
  - sender: 'user' | 'ai'
  - content
  - timestamp

- ChatDetailView
  - selectedResponseId
  - preprocessedText
  - category
  - rewrittenPrompt
  - appliedRules[]
  - finalPromptToLLM
  - modelName
  - modelVersion

Ez a struktúra támogatja a listázást, a beszélgetés részleteit és az audit oldal logikáját.

---

## Funkcionális elfogadási kritériumok
1. A felhasználó lát egy korábbi chatelési előzmény listát.
2. A chat panel középen jelenik meg, és tartalmazza a korábbi és új üzeneteket.
3. A felhasználó tud írni egy új üzenetet és elküldeni.
4. A beszélgetés kiválasztott előzménye alapján folytatható.
5. A chat details gomb navigál a részletes nézetre.
6. A második oldalon a felhasználó dropdownből választhat detailet.
7. A textarea csak olvasható, tartalmazza az előfeldolgozott szöveget és promptet.
8. A rendszer explicit módon megjeleníti a védett/eltávolított adatokat és a szabályokat.
9. A végső prompt a felhasználó számára ellenőrizhető formában jelenik meg.
10. A modell és verzió kiválasztása egyértelműen látszik a felületen.

---

## Technikai és implementációs megjegyzések
- A projekt Angular frontend alapokra épül.
- A layoutet komponensalapú felépítésben kell megvalósítani.
- A navigáció a routeren keresztül történhet.
- A UI-hoz mock adatokkal kell dolgozni, mert jelenleg nincs backend.
- Az audit panelben a read-only textarea és a külön szakaszok (szabály, prompt, előfeldolgozás) segítik a láthatóságot.
- A design és a UX célja az auditálhatóság és a nyomon követhetőség biztosítása, nem csak a chates felület látványossága.

---

## Javasolt felület felépítése

### 1. oldal
- bal oldali panel: chat előzmények
- középső panel: chat ablak + input mező + model selector
- jobb oldali panel: kérdések / kontextus / összegzés
- footer vagy toolbar: Chat details gomb

### 2. oldal
- header: Chat Details
- felső rész: dropdown a válasz kiválasztására
- fő tartalom:
  - Preprocessor output textarea
  - Applied rules section
  - Final LLM prompt section

---

## Példa feltöltött adat
Példa a kontextusra:

Input:
„Tóth Jakab vagyok, az egyenlegem 100000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?”

Szabály:
- A név személyes adat.
- A név nem küldhető tovább a model felé.

Előfeldolgozott / tisztított szöveg:
„Az egyenlegem 100000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?”

LLM prompt:
„Az egyenlegem 100000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?”

Ez a példaminta a UI által megjelenítendő auditfolyam lényegét mutatja.

---

## Összefoglalás
Ez a projekt a szabályvezérelt, auditálható és AI támogatott panaszkezelés front-end felületére fókuszál. A UI célja, hogy a felhasználó hozzáférjen a beszélgetéshez, a korábbi előzményekhez, az AI válaszokhoz és a részletes szabály- és prompt szintekhez anélkül, hogy elveszne a nyomon követhetőség és a biztonsági logika.
