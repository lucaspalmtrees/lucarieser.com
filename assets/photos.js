/* ============================================================
   FOTO-DATENBANK  —  Hier neue Alben & Fotos eintragen
   ------------------------------------------------------------
   So fügst du Fotos hinzu:
   1. Lege die JPGs in einen Ordner unter "Fotos/" (z.B. Fotos/Tokyo)
   2. Ergänze unten ein Album-Objekt oder erweitere die "photos"-Liste
   3. Fertig — die Website liest alles aus dieser Datei.
      Neue Alben erscheinen automatisch in der Serienliste,
      auf der Startseite und in der Bildansicht.

   Optional pro Album:
   - "featured": 4–6 Dateinamen, die auf der Startseite gross
     gezeigt werden (Reihenfolge = Reihenfolge auf der Seite).
     Fehlt das Feld, werden die ersten 6 Fotos genommen.
     Alle übrigen Fotos erscheinen unter "Alle Bilder zeigen".
   ============================================================ */

const SITE = {
  name: "Luca Rieser",
  tagline: "Fotografie zwischen Strassen, Städten und Licht.",
  youtube: "https://www.youtube.com/@lucarieser",
  instagram: "https://www.instagram.com/lucarieser/",
  linkedin: "https://ch.linkedin.com/in/luca-rieser-b77211278",
  email: "lucarieser@icloud.com",
  formspree: "https://formspree.io/f/xlgkojgl",
  // Ordnername ist auf dem Mac als "u + Umlautpunkte" gespeichert, daher \u0308
  portrait: "Bilder fu\u0308r Kontakt Luca/L1011539.jpg",
  hero: { album: "newyork", photo: "L1012629.jpg" },
  // Danach folgt automatisch: "Fotografiert in Spanien, New York und …"
  intro: "Strassen, Städte und Licht.",
  about: "[Zwei, drei Sätze über dich: wer du bist, wo du lebst, womit du fotografierst und was dich auf der Strasse interessiert.]",
  year: new Date().getFullYear()
};

const ALBUMS = [
  {
    id: "spain",
    title: "Spanien",
    country: "Spanien",
    city: "Spanien",
    description: "Sonne, Schatten und mediterrane Strassen.",
    folder: "Fotos/SPAIN",
    cover: "L1011995-2.jpg",
    featured: ["L1011995-2.jpg", "L1012260-2.jpg", "L1012281-2.jpg", "L1012140-2.jpg", "L1012225-2.jpg", "L1012017-2.jpg"],
    photos: [
      "L1011922-2.jpg",
      "L1011956-2.jpg",
      "L1011995-2.jpg",
      "L1012017-2.jpg",
      "L1012082-2.jpg",
      "L1012140-2.jpg",
      "L1012175-2.jpg",
      "L1012225-2.jpg",
      "L1012230-2.jpg",
      "L1012260-2.jpg",
      "L1012263-2.jpg",
      "L1012281-2.jpg"
    ]
  },
  {
    id: "newyork",
    title: "New York",
    country: "USA",
    city: "New York",
    description: "Die Stadt, die niemals stillsteht.",
    folder: "Fotos/NewYork",
    cover: "L1012690.jpg",
    featured: ["L1012690.jpg", "L1012939.jpg", "L1012948.jpg", "L1012703.jpg", "L1012837.jpg"],
    photos: [
      "L1012518.jpg",
      "L1012571.jpg",
      "L1012607.jpg",
      "L1012609.jpg",
      "L1012629.jpg",
      "L1012690.jpg",
      "L1012703.jpg",
      "L1012745.jpg",
      "L1012824.jpg",
      "L1012837.jpg",
      "L1012939.jpg",
      "L1012948.jpg"
    ]
  },
  {
    id: "hongkong",
    title: "Hong Kong",
    country: "Hong Kong",
    city: "Hong Kong",
    description: "Neon, Dichte und vertikale Welten.",
    folder: "Fotos/Hong Kong",
    cover: "L1013281-2.jpg",
    featured: ["L1013281-2.jpg", "L1013348-2.jpg", "L1013100-2.jpg", "L1013247-2-2.jpg", "L1013425-2.jpg"],
    photos: [
      "L1013043-2-2.jpg",
      "L1013069-2-2.jpg",
      "L1013100-2.jpg",
      "L1013110-2.jpg",
      "L1013232-2.jpg",
      "L1013237-2-2.jpg",
      "L1013247-2-2.jpg",
      "L1013280-2-2.jpg",
      "L1013281-2.jpg",
      "L1013348-2.jpg",
      "L1013397-2-3.jpg",
      "L1013425-2.jpg",
      "L1013430-2.jpg",
      "L1013434-2.jpg",
      "L1013447-2.jpg"
    ]
  }
  // ---- Vorlage für Portugal (Ordner "Fotos/Portugal" anlegen, dann
  //      die Kommentarzeichen entfernen und Dateinamen eintragen) ----
  // ,{
  //   id: "portugal",
  //   title: "Portugal",
  //   country: "Portugal",
  //   city: "Portugal",
  //   description: "[Eine Zeile zur Serie]",
  //   folder: "Fotos/Portugal",
  //   cover: "DATEINAME.jpg",
  //   photos: [
  //     "DATEINAME.jpg",
  //     "DATEINAME.jpg"
  //   ]
  // }
 ,{
    id: "portugal",
    title: "Portugal",
    country: "Portugal",
    city: "Portugal",
    description: "Ende von Europa.",
    folder: "Fotos/Portugal",
    cover: "L1014496.jpg",
    photos: [
      "L1014496.jpg",
      "L1014505.jpg",
      "L1014524.jpg",
      "L1014526.jpg",
      "L1014536.jpg",
      "L1014545.jpg",
      "L1014563.jpg",
      "L1014570.jpg",
      "L1014585.jpg",
      "L1014593.jpg",
      "L1014650.jpg",
      "L1014671.jpg",
      "L1014679.jpg",
      "L1014688.jpg",
      "L1014742.jpg",
      "L1014743.jpg",
      "L1014745.jpg",
      "L1014791-2.jpg",
      "L1014801-2.jpg",
      "L1014802.jpg",
      "L1014819.jpg",
      "L1014829.jpg"
    ]
  }
];
