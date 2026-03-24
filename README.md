# Libratica
2025.11.26

## Megvalósított funkciók:
### Autentikáció és felhasználók:
- regisztráció, bejelentkezés (JWT)
- admin szerepkör
- admin dashboard (összes felhasználó, összes hírdetés, felhasználó részletek megtekintése)
- profil szerkesztése oldal
- új jelszó beállítása
- user rating/review rendszer
- felhasználói profil oldal 
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
- form validációk, toast értesítések

  
## Tervezett funkciók a második félévre:
### Alapfunkciók:
- elfelejtett jelszó
- események létrehozása, böngészése oldal
- képfeltöltés a hírdetéseknél mappából
- email verification (ha marad idő)
- szűrő javítása hírdetéseknél
### Bővítések:
- Keresés fejlesztése
- admin CRUD


# Kérdések:
### Második félévben megvalósítsam e az escrow rendszert és ha igen akkor beleírjam-e a prezentációba?
- Jelenleg nem kezel pénzügyeket, a vásárlásnál, átverhetik egymást az emberek
  - Ezért lesz majd kifejlesztve a Review rendszer a jövőben és akkor moderálással ki lehet szűrni az ilyen embereket
	##### Mellette szól szerintem:
	- Stripe teljesen ingyenes amíg nincsen valódi tranzakció
	- Ez az egyetlen metódus amivel megvalósítható az eladói -és vevői védelem 100%-ig
	##### Ellene szól szerintem:
	- Komplex implementációval jár
	- Nehéz tesztelni
#### Alternatíva (jelenlegi megoldás): 
- Review rendszer + moderálás a report rendszer alapján
- Platform csak közvetít, nem kezel pénzügyeket
### Kik lesznek bent a prezentáció során?
### AI vagy plágiumellenőrzés lesz-e ebben a félévben is?

## Technológiák

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- React 19
- React Router v7
- Axios
- Tailwind CSS
- Context API
