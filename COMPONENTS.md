# Komponensek tervezése

## Áttekintés
A felületet két fő nézetre bontjuk:
1. Chat overview / conversation page
2. Chat details / audit page

A komponensek funkciója a beszélgetés, az előzmények és az auditálható adatok megjelenítése, nem pedig a backend logika kezelése.

---

## 1. ChatOverviewPage
### Feladata
A fő oldal, ahol a felhasználó:
- látja a korábbi chat előzményeket,
- megnézi a kiválasztott beszélgetést,
- írhat új üzenetet,
- kiválaszthat modell és verziót,
- navigálhat a details oldalra.

### Komponensek
#### ChatHistorySidebar
- Pozíció: bal oldali panel
- Feladata: a korábbi chatek listázása
- Tilos: itt nem kell teljes chat tartalom megjelenítése
- Csak a rövid összefoglaló, a summary megjelenítése szükséges
- Kattintásra az adott chat betöltődik a középső panelbe

#### ChatConversationPanel
- Pozíció: középső panel
- Feladata: a kiválasztott beszélgetés megjelenítése
- A felhasználói kérdések és az AI válaszok külön színekkel jelennek meg
- Tárolja a beszélgetés teljes állapotát
- Lehetővé kell tenni, hogy a felhasználó a kiválasztott chathez új üzenetet írjon

#### ChatComposer
- Pozíció: a chat panel alatt vagy felett
- Feladata: új üzenet bevitele
- Tartalmazza:
  - textarea vagy input mezőt
  - küldés gombet
  - modell és verzió dropdownet

#### ModelSelector
- Feladata: modell kiválasztása
- Példák:
  - chatgpt
  - claude
  - gemini

#### ModelVersionSelector
- Feladata: verzió kiválasztása
- Példák:
  - gpt-4.3
  - gpt-4o
  - o3-mini

#### ChatDetailsButton
- Feladata: navigáció a második oldalra
- Elhelyezkedés: a chat ablak felett vagy alatt
- Cél: a chat audit oldal megnyitása

#### ConversationContextPanel
- Pozíció: jobb oldali panel
- Feladata: opcionális összefoglaló, kérdéskörök, kontextus megjelenítése
- Nem kötelező, de hasznos a felhasználói közeg jobb értelmezéséhez

---

## 2. ChatDetailsPage
### Feladata
A részletes audit és ellenőrzési nézet, ahol a felhasználó megtekintheti, hogyan alakult át a kérés és az adatok feldolgozása.

### Komponensek
#### ChatDetailsHeader
- Feladata: a fejléc megjelenítése
- Szöveg: „Chat Details”
- Cél: az oldalon való azonosítás és navigációs kontextus

#### DetailSelector
- Feladata: dropdown, ami a konkrét válaszhoz tartozó részletek közül választ
- Példák:
  - 1
  - 2
  - 3
  - 4
- A kiválasztás hatására a többi panel frissül

#### PreprocessorOutputCard
- Feladata: a preprocesszor kimenetének megjelenítése
- Tartalmazza:
  - a tisztított szöveget
  - a kategóriát
  - a promptet, amit az LLM kap
- Read-only textarea
- Szükséges, hogy ne lehessen szerkeszteni

#### AppliedRulesCard
- Feladata: a rendszer által alkalmazott szabályok megjelenítése
- Példa logika:
  - a név személyes adat
  - a név nem küldhető tovább az LLM felé
- A felhasználó itt látja, mi lett védve, szűrve vagy módosítva

#### FinalPromptCard
- Feladata: a ténylegesen az LLM felé elküldött prompt megjelenítése
- Példa:
  - „Az egyenlegem 100000000 Ft, és 50 Ft kamatot kaptam. Miért nem 100 Ft-ot?”
- Ez a végső, ellenőrizhető prompt

---

## 3. ConfigPage
### Feladata
A konfigurációs oldal elkülönített felületet biztosít a futtatási beállításokhoz.

### Komponensek
#### ConfigHeader
- Feladata: a konfigurációs oldal fejléce.
- Tartalma: „Configuration” vagy „Beállítások”.

#### RuleVersionSelector
- Feladata: szabálykészlet vagy szabályverzió kiválasztása.
- Példák:
  - Rule Set v1
  - Rule Set v2
  - Compliance EU

#### ResponseModeSelector
- Feladata: válaszgenerálási mód kiválasztása.
- A prototípusban alapértelmezetten LLM.
- A felhasználó itt tudja kiválasztani, hogy a rendszer LLM vagy sablonalapú módon működjön.

#### PromptVersionSelector
- Feladata: prompt verzió kiválasztása.
- A verziózást az auditálhatóság és az ismételhetőség indokolja.

#### ModelSelector
- Feladata: modell kiválasztása.
- A modell választás a konfigurációs oldalhoz tartozik.

#### ModelParameterControls
- Feladata: a főbb modellparaméterek beállítása.
- Példák:
  - temperature
  - max tokens

#### AuditLoggingToggle
- Feladata: az audit naplózás bekapcsolása vagy kikapcsolása.
- A rendszer alapértelmezetten logol.

---

## 4. Adatstruktúra
### ChatHistoryItem
A chat history item esetén elegendő csak a summary mezőt megjeleníteni.

```ts
interface ChatHistoryItem {
  id: string;
  summary: string;
  status?: string;
  createdAt?: string;
}
```

### ChatMessage
```ts
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string;
}
```

### ChatDetailView
```ts
interface ChatDetailView {
  selectedResponseId: string;
  preprocessedText: string;
  category: string;
  rewrittenPrompt: string;
  appliedRules: string[];
  finalPromptToLLM: string;
  modelName: string;
  modelVersion: string;
}
```

---

## 4. Layout javaslat
### Első oldal
- bal: ChatHistorySidebar
- közép: ChatConversationPanel + ChatComposer
- jobb: ConversationContextPanel

### Második oldal
- header: ChatDetailsHeader
- felső: DetailSelector
- fő: PreprocessorOutputCard, AppliedRulesCard, FinalPromptCard

---

## 5. UX irányelvek
- A chat history itemben csak a summary jelenjen meg, ne legyen túl sok metaadat.
- A chat panel legyen központosított és jól olvasható.
- A részletes oldal inkább audit és ellenőrzés céljára szolgáljon, ne legyen túl bonyolult.
- A személyes adatokat és a szűrés logikáját explicit módon jelenítsük meg.
- A prompt és a szabályok nyomon követhetők legyenek.

---

## 6. Elfogadási kritériumok
- A chat history listában a felhasználó csak a summary alapján tudja az előzményt azonosítani.
- A beszélgetés tovább folytatható a kiválasztott chat alatt.
- A chat details gomb eljut a részletes oldalra.
- A részletes oldalon a dropdown alapján vált a tartalom.
- A textarea read-only, és az előfeldolgozott adatok látszanak benne.
- A szabályok és a végeredményként elküldött prompt auditálhatók.
