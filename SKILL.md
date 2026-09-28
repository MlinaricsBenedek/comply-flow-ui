Tervezd meg egy modern, letisztult webalkalmazás UI-ját az alábbi backend API és UI workflow alapján.

## Alkalmazás célja

Az alkalmazás egy AI-alapú panaszkezelő rendszer. A felhasználó beszélgetéseket hozhat létre, amelyeken belül panaszokat vagy kérdéseket küldhet be. A rendszer a beérkezett üzeneteket előfeldolgozza, szabályalapú döntést hoz, elkészíti a válasz tervét, majd konfiguráció alapján template-alapú vagy LLM-alapú választ generál.

A UI elsődleges célja a beszélgetés egyszerű kezelése, valamint az egyes üzenetek feldolgozási folyamatának és eredményeinek részletes megtekintése.

---

# 1. Home Page

A Home Page legyen az alkalmazás kezdőoldala.

### Tartalom

Jelenjen meg:

* az alkalmazás neve
* a korábbi beszélgetések listája
* minden beszélgetésnél:

  * cím
  * státusz
  * létrehozás dátuma
* "New Conversation" / "Add" gomb
* "Configurations" navigációs lehetőség

### API

Az oldal betöltésekor:

`GET /api/conversations`

Egy beszélgetés kiválasztásakor:

`GET /api/conversations/{id}`

### Workflow

Home Page
→ beszélgetés kiválasztása
→ Conversation Page

Az "Add" gomb megnyomásakor egy modal jelenjen meg, amelyben a felhasználó megadhatja az új beszélgetés címét.

Mentés:

`POST /api/conversations`

Request:

```json
{
  "title": "Fejhallgató reklamáció"
}
```

Sikeres létrehozás után a felhasználó kerüljön az új Conversation Page-re.

---

# 2. Conversation / Chat Page

Ez legyen az alkalmazás fő chat felülete.

### Tartalom

A képernyőn jelenjen meg:

* beszélgetés címe
* korábbi üzenetek
* user és system üzenetek különböző megjelenítéssel
* szöveges input mező
* Send gomb
* configuration dropdown

A configuration dropdown tartalmazza az összes elérhető konfigurációt.

Az adatokat:

`GET /api/configurations`

végponttal kell lekérni.

### Üzenet küldése

A felhasználó kiválaszt egy konfigurációt, beírja az üzenetet, majd elküldi.

Endpoint:

`POST /api/conversations/{conversationId}/messages`

Request:

```json
{
  "content": "A múlt héten vásárolt fejhallgatóm elromlott. Szeretném visszakapni a pénzem.",
  "configurationId": 2
}
```

A response:

```json
{
  "processingRunId": 501,
  "messageId": 101,
  "status": "Completed",
  "createdAt": "2026-09-27T14:20:00Z"
}
```

A rendszer válasza jelenjen meg a chatben.

### Message → Details

A user által küldött üzenetek legyenek kattinthatók.

Egy üzenetre kattintva a felhasználó kerüljön a Message Details oldalra.

A kiválasztott üzenethez tartozó `processingRunId` alapján töltsük be a feldolgozási eredményeket.

---

# 3. Message Details Page

Ez az oldal egy konkrét user message teljes feldolgozási folyamatát mutassa be.

A cél az, hogy a felhasználó egy helyen lássa, hogyan dolgozta fel a rendszer az üzenetet.

Az oldal lehetőleg jól elkülönített szekciókból vagy accordion/tab elemekből álljon.

## 3.1. Original Message

Felül jelenjen meg:

* eredeti user message
* message ID
* processing run ID
* használt configuration

---

## 3.2. Preprocessing

Endpoint:

`GET /api/processing-runs/{id}/preprocessing`

Jelenjen meg:

* cleaned text
* case type
* structured case state

Példa:

```json
{
  "cleanedText": "A múlt héten vásárolt fejhallgatóm elromlott.",
  "caseType": "RefundRequest",
  "structuredCaseState": {
    "product": "Fejhallgató",
    "issue": "Defective",
    "requestedAction": "Refund"
  }
}
```

A structured case state legyen jól olvasható kulcs-érték formában.

---

## 3.3. Rule Engine

Endpoint:

`GET /api/processing-runs/{id}/rules`

Jelenjen meg:

* decision
* reason
* rule set version
* matched rules

A matched rules legyenek egy jól áttekinthető listában vagy táblázatban.

Minden szabálynál jelenjen meg:

* rule code
* matched status
* reason

---

## 3.4. Response Plan

Endpoint:

`GET /api/processing-runs/{id}/response-plan`

Jelenjen meg:

* decision
* reason
* required elements
* response structure
* sources

A response structure lehet vizuálisan egy lépéssor vagy lista.

---

## 3.5. Generated Response

A konfiguráció alapján csak a megfelelő response endpointot hívd meg.

### Template esetén:

`GET /api/processing-runs/{id}/response/template`

Jelenjen meg:

* generation mode
* generated response
* template version
* processing time

### LLM esetén:

`GET /api/processing-runs/{id}/response/llm`

Jelenjen meg:

* generation mode
* generated response
* prompt version
* model name
* model parameters
* processing time

Az LLM response esetében a model parameters legyen összecsukható részben megjeleníthető.

---

# 4. Configuration Page

Külön oldal legyen a konfigurációk kezelésére.

A Home Page-ről legyen elérhető.

### Tartalom

Jelenjen meg:

* konfigurációk listája
* konfiguráció neve
* konfiguráció típusa
* "Add Configuration" gomb

Endpoint:

`GET /api/configurations`

Példa:

```json
[
  {
    "id": 1,
    "name": "Template Configuration"
  },
  {
    "id": 2,
    "name": "LLM Configuration"
  }
]
```

Egy konfigurációra kattintva jelenjenek meg a részletei.

Endpoint:

`GET /api/configurations/{id}`

---

# 5. Configuration Details

A kiválasztott konfiguráció részletes adatai jelenjenek meg.

Például LLM konfiguráció esetén:

* name
* rule set version
* generation mode
* prompt version
* model name
* model parameters

Az adatokat:

`GET /api/configurations/{id}`

endpoint segítségével kell betölteni.

---

# 6. Create Configuration Page

A Configuration Page-en található "Add Configuration" gomb egy új konfiguráció létrehozására szolgáló oldalra navigáljon.

Elsőként a felhasználó válassza ki:

* Template
* LLM

A kiválasztott típustól függően jelenjenek meg a releváns mezők.

## Template configuration

Mezők:

* name
* ruleSetVersion
* templateVersion

Mentés:

`POST /api/configurations/template`

Request:

```json
{
  "name": "Template Configuration",
  "ruleSetVersion": "1.0",
  "templateVersion": "1.0"
}
```

## LLM configuration

Mezők:

* name
* ruleSetVersion
* promptVersion
* modelName
* temperature
* maxTokens

Mentés:

`POST /api/configurations/llm`

Request:

```json
{
  "name": "LLM Configuration",
  "ruleSetVersion": "1.0",
  "promptVersion": "2.0",
  "modelName": "Llama-3",
  "modelParameters": {
    "temperature": 0.2,
    "maxTokens": 500
  }
}
```

---

# Navigáció

A fő navigáció legyen egyszerű és egyértelmű:

Home
├── Conversation
│   └── Message Details
│
└── Configurations
    ├── Configuration Details
    └── Create Configuration

---

# UI/UX követelmények

A design legyen:

* modern
* letisztult
* professzionális
* könnyen áttekinthető
* desktop-first, de legyen responsive
* ne legyen túlzsúfolt
* használjon jól elkülönített cardokat/sectionöket
* az API-ból érkező technikai információk legyenek könnyen értelmezhetők

A Message Details oldal legyen különösen jól strukturált, mivel ezen az oldalon a teljes feldolgozási pipeline látható:

User Message
→ Preprocessing
→ Rule Engine
→ Response Plan
→ Response Generation
→ Final Response

A feldolgozási lépések vizuálisan is jelenjenek meg, például stepper, timeline, accordion vagy egymás alatti cardok segítségével.

A rendszer hibáit a UI jól látható, de felhasználóbarát módon kezelje.

Példák:

* 400 Bad Request → validációs hiba jelenjen meg
* 404 Not Found → jelezze, hogy az adott erőforrás nem található
* 500 Internal Server Error → általános rendszerhiba
* 504 Gateway Timeout → jelezze, hogy az AI szolgáltatás nem válaszolt időben

Ne használj feleslegesen bonyolult UI-elemeket. A cél egy jól használható, egyetemi/projekt környezetben is könnyen implementálható felület.

Az API endpointokat ne módosítsd, hanem a fenti backend szerződéshez igazítsd a UI-t.
