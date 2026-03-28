# Libratica
2026.03.25

## Tervezett funkciók a második félévre:
### Kötelező:
- code review, tesztelés

### Konzulens észrevételei:
- kívánságlista alapján történjen a könyvajánlás, ha nincs rajta semmi akkor a korábbi vásárlások alapján✅
- minden jelszóhoz mutasd gomb✅
- a kapcsolatfelvételnél legyen egy másik gomb ami csak az alapértelmezet email alkalmazást nyitja meg✅
- ha valaki profilját megtekinti a felhasználó, akkor legyen ott mindkét email gomb és egy telefonszám gomb, ez akár a hirdetéseknél is ott lehetne de csak akkor, ha az eladó engedélyezi, hogy felfedjék a telefonszámát✅
- ha megrendelés alatt van egy hirdetés, akkor ne lehessen szerkeszteni✅
- az eseményeknél legyen egy beágyazott térkép, ahol a helyszínt lehet kiválasztani✅
- ai keresést a hirdetés oldalra bevonni, felesleges külön oldal neki✅
- eseményeknél helyszín alapú szűrő✅

## Megvalósított funkciók:
### Autentikáció és felhasználók:
- regisztráció, bejelentkezés (JWT)
- admin szerepkör
- admin dashboard (összes felhasználó, összes hírdetés, felhasználó részletek megtekintése)
- profil szerkesztése oldal
- új jelszó beállítása
- user rating/review rendszer
- felhasználói profil oldal
- admin funkciók
### Könyvek és hírdetések:
- könyvek böngészése, szűrése és keresése
- hírdetés létrehozása, szerkesztése, törlése
- hírdetések megtekintése
- saját hírdetések kezelése
- egy adott hírdetés részletes megtekintése
- új könyv vagy meglévő könyv hírdetésének feltöltése
- AI integráció
- könyv kívánságlista
- Open Library API
- könyvgyütemény
- képfeltöltés a hírdetéseknél mappából
- események létrehozása, böngészése oldal
### Vásárlások és rendelések:
- kapcsolatfelvétel gomb
- ajánlórendszer
- kosár
- checkout
- vásárlások és eladások kezelése
- rendelés státuszának beállítása (pending, confirmed, shipped, delivered, cancelled)
- rendelés elutasítása (eladó által)
- rendelés lemondása
- rendelések megtekintése
- saját hírdetés vásárlásának tiltása
- hírdetés report (adminnak)
### UI:
- responsive design
- reactquery használata
- form validációk, toast értesítések

# Kérdések:
### Kik lesznek bent a prezentáció során?
- Tóth Bálint, Ábrahám Gyula, Pulai Gábor

## Technológiák
### Backend
- ASP.NET Core 8.0
- Entity Framework Core 9
- SQL Server Express
- JWT Authentication
- BCrypt.Net (jelszó hash-elés)
- Swagger/OpenAPI

### Frontend
- React 19
- React Router v7
- Axios
- Tailwind CSS
- Context API (auth kezelés)
- React Toastify (értesítések)

### Külső API-k és szolgáltatások
- Open Library API (könyv adatok automatikus kitöltése)
- OpenAI GPT-3.5-turbo (AI alapú könyvkereső)
