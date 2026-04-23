import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#8b4513' }}>
                    Adatvédelmi nyilatkozat
                </h1>
                <p className="text-sm text-gray-500 mb-8">Utoljára frissítve: 2026. április</p>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        1. Adatkezelő
                    </h2>
                    <p className="text-gray-700">
                        A Libratica platform üzemeltetője és adatkezelője a platform fejlesztője. Az
                        adatkezeléssel kapcsolatos kérdésekkel kérjük, forduljon hozzánk a platformon
                        keresztül.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        2. Kezelt adatok köre
                    </h2>
                    <p className="text-gray-700 mb-2">
                        A regisztráció során a következő adatokat kezeljük:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Email cím</li>
                        <li>Felhasználónév</li>
                        <li>Teljes név</li>
                        <li>Jelszó (titkosított formában tárolva)</li>
                        <li>Telefonszám (opcionális)</li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                        A platform használata során a következő adatokat kezeljük:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mt-1">
                        <li>Hirdetések adatai (könyvcím, ár, állapot, helyszín, képek)</li>
                        <li>Rendelési adatok (szállítási cím, fizetési mód)</li>
                        <li>Értékelések és kommentek</li>
                        <li>Kívánságlista és könyvgyűjtemény adatai</li>
                        <li>Bejelentkezési előzmények</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        3. Adatkezelés célja
                    </h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>A platform szolgáltatásainak biztosítása</li>
                        <li>Felhasználói fiók kezelése</li>
                        <li>Hirdetések és rendelések kezelése</li>
                        <li>Felhasználók közötti kommunikáció elősegítése</li>
                        <li>Biztonságos vásárlási környezet fenntartása</li>
                        <li>Személyre szabott ajánlások biztosítása</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        4. Adatkezelés jogalapja
                    </h2>
                    <p className="text-gray-700">
                        Az adatkezelés jogalapja a felhasználó önkéntes hozzájárulása, amelyet a
                        regisztráció során az adatvédelmi nyilatkozat elfogadásával ad meg. Az adatkezelés
                        az Európai Unió általános adatvédelmi rendeletének (GDPR) megfelelően történik.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        5. Adatok tárolása és biztonsága
                    </h2>
                    <p className="text-gray-700">
                        A felhasználók jelszavai BCrypt algoritmussal titkosítva kerülnek tárolásra. A
                        platform JWT token alapú hitelesítést alkalmaz a biztonságos hozzáférés
                        érdekében. Az adatok SQL Server adatbázisban kerülnek tárolásra, amelyhez csak
                        az arra jogosult személyek férhetnek hozzá.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        6. Adatok megosztása
                    </h2>
                    <p className="text-gray-700">
                        A platform harmadik félnek nem adja el a felhasználók személyes adatait. Az
                        email cím más felhasználók számára csak akkor látható, ha a felhasználó
                        kapcsolatfelvételi célból megosztja azt. A telefonszám csak akkor jelenik meg
                        más felhasználók számára, ha a felhasználó ezt kifejezetten engedélyezi.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        7. Felhasználói jogok
                    </h2>
                    <p className="text-gray-700 mb-2">A felhasználóknak joguk van:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Hozzáférni a saját adataikhoz</li>
                        <li>Módosítani a saját adataikat a profil szerkesztési oldalon</li>
                        <li>Törölni a saját hirdetéseiket</li>
                        <li>Tiltakozni az adatkezelés ellen</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        8. Külső szolgáltatások
                    </h2>
                    <p className="text-gray-700">
                        A platform az alábbi külső szolgáltatásokat veszi igénybe:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                        <li>
                            <span className="font-medium">Open Library API</span> — könyvadatok lekéréséhez,
                            személyes adatot nem továbbít
                        </li>
                        <li>
                            <span className="font-medium">OpenAI API</span> — AI keresési funkció működtetéséhez,
                            csak a keresési kifejezést továbbítja
                        </li>
                        <li>
                            <span className="font-medium">OpenStreetMap / Nominatim</span> — térképes
                            megjelenítéshez, személyes adatot nem továbbít
                        </li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        9. Adatmegőrzési időszak
                    </h2>
                    <p className="text-gray-700">
                        A felhasználók adatait a fiók aktív fennállásáig őrizzük meg. A fiók törlésekor
                        a személyes adatok törlésre kerülnek, kivéve azokat az adatokat, amelyek
                        megőrzése jogszabályi kötelezettség alapján szükséges.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-3" style={{ color: '#8b4513' }}>
                        10. Módosítások
                    </h2>
                    <p className="text-gray-700">
                        Fenntartjuk a jogot az adatvédelmi nyilatkozat módosítására. A módosításokról
                        a felhasználókat a platformon keresztül értesítjük.
                    </p>
                </section>

                <div className="border-t pt-6">
                    <Link to="/register" className="text-[#8b4513] hover:underline text-sm">
                        ← Vissza a regisztrációhoz
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;