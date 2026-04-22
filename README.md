# Libratica
2026.03.25

### Bizottság észrevételei:
- jogi kérdések
- adatvédelmi nyilatkozat
- videó feldarabolása, hozzáadása a folyamatábrákhoz (pl gif?)
- prezin ne legyen fekete háttér
- kategória alapú ellenőrzés is a kívánságlista-ajánlónál
- saját hirdetés megtekintésnél is a szerkesztéshez dob
- adatbázis felesleges táblák eltávolítása (Users: profilepictureurl, isverified, banneduntil, updatedat. Listings: currency
- 

### Konzulens észrevételei:
- kívánságlista alapján történjen a könyvajánlás, ha nincs rajta semmi akkor a korábbi vásárlások alapján✅
- minden jelszóhoz mutasd gomb✅
- a kapcsolatfelvételnél legyen egy másik gomb ami csak az alapértelmezet email alkalmazást nyitja meg✅
- ha valaki profilját megtekinti a felhasználó, akkor legyen ott mindkét email gomb és egy telefonszám gomb, ez akár a hirdetéseknél is ott lehetne de csak akkor, ha az eladó engedélyezi, hogy felfedjék a telefonszámát✅
- ha megrendelés alatt van egy hirdetés, akkor ne lehessen szerkeszteni✅
- az eseményeknél legyen egy beágyazott térkép, ahol a helyszínt lehet kiválasztani✅
- ai keresést a hirdetés oldalra bevonni, felesleges külön oldal neki✅
- eseményeknél helyszín alapú szűrő✅
- könyvet lehessen felrakni 0ft-ért is✅
- kívánságlistára lehessen felvenni külső API szerint is könyveket és ha lesz feltöltve belőle akkor jelenjen meg az ajánlott könyvek között✅
- a könyvgyüjteményben jelenjenek meg a korábban vásárolt könyvek (csak akkor ha kiszállítva az állapot és kétszer ne vegyen fel egy könyvet)✅
- könyvgyüjteményhez könyv hozzáadása manuálisan képfeltöltéssel stb✅
- AI keresés hibája, telefonszám megjelenítési hiba, dupla toast értesítés rendelés oldalon✅
- Könyv feltöltése 0ft-ért is✅
- Kívánságlistára lehessen felvenni külső API szerint is könyveket és ha lesz feltöltve belőle, akkor jelenjen meg az ajánlott könyvek között is (cím és szerző alapú ellenőrzés)✅
- Könyvgyüjteményben jelenjenek meg azok a könyvek, amelyeket korábban megvásárolt a felhasználó (csak egyszer, ha többet vett)✅
- Lehessen felvinni könyv gyüjteménybe manuálisan is könyvet, mint pl. a hirdetéslétrehozásnál✅


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
### Dokumentáció
- AI arányt beírni - kódban használt ai-t is írjam be, szövegben ahol használtam (pl abstract) ott 100%
- Köszönetnyilvánítás - ahogy gondolom
- Témavezetői nyilatkozatot kitöltsem-e - nem
- Milyen pontok legyenek? A jelenlegi megfelelő-e? - megfelelő

## Technológiák

### Backend
- ASP.NET Core 8.0
- Entity Framework Core 9.0.10
- SQL Server Express
- JWT Authentication (Microsoft.AspNetCore.Authentication.JwtBearer)
- BCrypt.Net-Next 4.0.3 (jelszó hash-elés)
- Swagger/OpenAPI (Swashbuckle)

### Frontend
- React 19
- React Router v7
- TanStack React Query v5 (szerverállapot kezelés)
- Axios (HTTP kérések)
- Tailwind CSS (stílusok)
- React Context API (authentikáció kezelés)
- React Toastify (értesítések)
- Leaflet / React Leaflet (interaktív térkép)

### Külső API-k és szolgáltatások
- Open Library API (könyv adatok automatikus kitöltése)
- OpenAI GPT-3.5-turbo (AI alapú természetes nyelvi keresés)
- OpenStreetMap / Nominatim API (térkép megjelenítés és reverse geocoding)
