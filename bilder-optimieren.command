#!/bin/bash
# ============================================================
#  Web-Versionen der Fotos erzeugen (für macOS, per Doppelklick)
#  ------------------------------------------------------------
#  Legt in jedem Foto-Ordner einen Unterordner "web" an und
#  speichert dort verkleinerte Kopien (max. 2000 px, ~300 KB).
#  Die Website lädt diese schnellen Versionen und greift nur
#  aufs Original zurück, wenn keine Web-Version existiert.
#  Bereits vorhandene Web-Versionen werden übersprungen.
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
echo "Vergiss nicht, die neuen Ordner mit zu committen."
read -r -p "Enter drücken zum Schliessen …"
