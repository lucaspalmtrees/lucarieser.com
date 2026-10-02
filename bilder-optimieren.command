#!/bin/bash
# ============================================================
#  Web-Versionen der Fotos erzeugen (für macOS, per Doppelklick)
#  ------------------------------------------------------------
#  Funktioniert mit JEDEM Ordner in "Fotos" – der Name ist egal,
#  am Skript muss nie etwas angepasst werden.
#
#  1. Legt in jedem Foto-Ordner einen Unterordner "web" an und
#     speichert dort verkleinerte Kopien (max. 2000 px, ~300 KB).
#     Die Website lädt diese schnellen Versionen und greift nur
#     aufs Original zurück, wenn keine Web-Version existiert.
#     Bereits vorhandene Web-Versionen werden übersprungen.
#  2. Für jeden Ordner in "Fotos", der noch nicht in
#     assets/photos.js steht, wird ein fertiger Eintrag erzeugt
#     und in "neues-album.txt" gespeichert, zum Kopieren.
# ============================================================
cd "$(dirname "$0")" || exit 1

count=0
for dir in Fotos/*/ Bilder*/; do
  [ -d "$dir" ] || continue
  mkdir -p "${dir}web"
  for f in "$dir"*.jpg "$dir"*.jpeg "$dir"*.JPG "$dir"*.JPEG; do
    [ -f "$f" ] || continue
    out="${dir}web/$(basename "$f")"
    [ -f "$out" ] && continue
    sips -Z 2000 -s format jpeg -s formatOptions 80 "$f" --out "$out" >/dev/null && count=$((count + 1))
    echo "✓ $out"
  done
done

echo ""
echo "Fertig: $count neue Web-Versionen erstellt."

# ---------- Einträge für neue Alben vorbereiten ----------
snippet="neues-album.txt"
: > "$snippet"
for dir in Fotos/*/; do
  folder="${dir%/}"
  # schon eingetragen? (auskommentierte Zeilen zählen nicht)
  [ -f assets/photos.js ] && grep -v '^[[:space:]]*//' assets/photos.js | grep -q "folder: \"$folder\"" && continue
  name="$(basename "$folder")"
  id="$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9')"
  files=()
  for f in "$dir"*.jpg "$dir"*.jpeg "$dir"*.JPG "$dir"*.JPEG; do
    [ -f "$f" ] && files+=("$(basename "$f")")
  done
  [ ${#files[@]} -eq 0 ] && continue
  {
    echo "  ,{"
    echo "    id: \"$id\","
    echo "    title: \"$name\","
    echo "    country: \"$name\","
    echo "    city: \"$name\","
    echo "    description: \"[Eine Zeile zur Serie]\","
    echo "    folder: \"$folder\","
    echo "    cover: \"${files[0]}\","
    echo "    photos: ["
    last=$((${#files[@]} - 1))
    for i in "${!files[@]}"; do
      sep=","; [ "$i" -eq "$last" ] && sep=""
      echo "      \"${files[$i]}\"$sep"
    done
    echo "    ]"
    echo "  }"
  } >> "$snippet"
  echo "Neues Album gefunden: $name (${#files[@]} Fotos)"
done

if [ -s "$snippet" ]; then
  echo ""
  echo "Der fertige Eintrag steht in \"$snippet\"."
  echo "Kopiere ihn in assets/photos.js direkt vor die letzte Zeile \"];\"."
  open -e "$snippet" 2>/dev/null
else
  rm -f "$snippet"
fi

echo ""
echo "Auf GitHub reicht es, pro neuem Album den Ordner mit dem"
echo "Unterordner \"web\" in \"Fotos\" hochzuladen – ohne die grossen Originale."
read -r -p "Enter drücken zum Schliessen …"
