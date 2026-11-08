#!/usr/bin/env python3
"""
Script para obtener las tasas oficiales del Banco Central de Venezuela (BCV)
y actualizar el archivo public/bcv_rates.json.
Diseñado para ejecutarse sin dependencias externas en GitHub Actions.
"""

from __future__ import annotations

import json
import os
import re
import ssl
import sys
import urllib.request
from datetime import datetime
from pathlib import Path


def fetch_bcv_html(url: str = "https://bcv.org.ve/", timeout: int = 20) -> str:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    }

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="ignore")


def parse_ve_number(val_str: str) -> float:
    """Convierte cadenas como '897,53830000' o '1.001,18602288' a float."""
    return float(val_str.strip().replace(".", "").replace(",", "."))


def extract_rates(html: str) -> dict:
    usd_match = re.search(
        r'id="dolar"[\s\S]*?<strong[^>]*>\s*([0-9.,]+)\s*</strong>', html, re.IGNORECASE
    )
    eur_match = re.search(
        r'id="euro"[\s\S]*?<strong[^>]*>\s*([0-9.,]+)\s*</strong>', html, re.IGNORECASE
    )

    if not usd_match or not eur_match:
        raise ValueError("No se encontraron los contenedores de USD o EUR en la página del BCV.")

    raw_usd = usd_match.group(1).strip()
    raw_eur = eur_match.group(1).strip()

    date_iso = None
    date_text = "N/A"

    date_match = re.search(
        r'Fecha Valor:\s*<span[^>]*content="([^"]+)"[^>]*>([^<]+)</span>', html, re.IGNORECASE
    )
    if date_match:
        date_iso = date_match.group(1).strip()
        date_text = " ".join(date_match.group(2).split())
    else:
        fallback_match = re.search(
            r'Fecha Valor:\s*<span[^>]*>([^<]+)</span>', html, re.IGNORECASE
        )
        if fallback_match:
            date_text = " ".join(fallback_match.group(1).split())

    return {
        "usd": parse_ve_number(raw_usd),
        "eur": parse_ve_number(raw_eur),
        "raw_usd": raw_usd,
        "raw_eur": raw_eur,
        "fecha_valor": date_text,
        "fecha_valor_iso": date_iso,
        "last_updated": datetime.now().isoformat(),
        "source": "bcv-official",
        "source_name": "BCV Oficial (Directo)",
    }


def main():
    repo_root = Path(__file__).resolve().parent.parent
    target_path = repo_root / "public" / "bcv_rates.json"

    print("Consultando https://bcv.org.ve/ ...")
    try:
        html = fetch_bcv_html()
        rates_data = extract_rates(html)
    except Exception as exc:
        print(f"ERROR al consultar BCV: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"USD: {rates_data['raw_usd']} ({rates_data['usd']})")
    print(f"EUR: {rates_data['raw_eur']} ({rates_data['eur']})")
    print(f"Fecha Valor: {rates_data['fecha_valor']}")

    # Verificar si hubo cambios reales con respecto al archivo actual y gestionar doble tasa
    has_changed = True
    old_data: dict = {}
    if target_path.exists():
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                old_data = json.load(f)
        except Exception:
            pass

    history = old_data.get("history", [])
    old_rates_meta = old_data.get("rates", {})
    current_snapshot = old_rates_meta.get("current")
    next_snapshot = old_rates_meta.get("next")

    new_snapshot = {
        "label": f"Tasa Publicada ({rates_data['fecha_valor']})",
        "short_label": "Próx. Día",
        "fecha_valor": rates_data["fecha_valor"],
        "fecha_valor_iso": rates_data["fecha_valor_iso"],
        "usd": rates_data["usd"],
        "eur": rates_data["eur"],
    }

    if old_data.get("fecha_valor") and old_data.get("fecha_valor") != rates_data["fecha_valor"]:
        # Hubo cambio de Fecha Valor: la tasa previa pasa a ser la tasa vigente
        if next_snapshot:
            current_snapshot = {
                **next_snapshot,
                "label": f"Tasa Vigente ({next_snapshot.get('fecha_valor', '')})",
                "short_label": "Vigente Hoy",
            }
        elif old_data.get("usd"):
            current_snapshot = {
                "label": f"Tasa Vigente ({old_data.get('fecha_valor')})",
                "short_label": "Vigente Hoy",
                "fecha_valor": old_data.get("fecha_valor"),
                "fecha_valor_iso": old_data.get("fecha_valor_iso"),
                "usd": old_data.get("usd"),
                "eur": old_data.get("eur"),
            }
        next_snapshot = new_snapshot
    else:
        next_snapshot = new_snapshot
        if (
            old_data.get("usd") == rates_data["usd"]
            and old_data.get("eur") == rates_data["eur"]
            and old_data.get("fecha_valor") == rates_data["fecha_valor"]
        ):
            has_changed = False
            print("Las tasas y la fecha valor ya están al día. No hay cambios.")

    # Actualizar historial sin duplicados
    if not any(h.get("fecha_valor") == new_snapshot["fecha_valor"] for h in history):
        history.append({
            "fecha_valor": new_snapshot["fecha_valor"],
            "fecha_valor_iso": new_snapshot["fecha_valor_iso"],
            "usd": new_snapshot["usd"],
            "eur": new_snapshot["eur"],
        })
    history = history[-30:]

    rates_data["rates"] = {}
    if current_snapshot:
        rates_data["rates"]["current"] = current_snapshot
    if next_snapshot:
        rates_data["rates"]["next"] = next_snapshot
    rates_data["history"] = history

    # Guardar archivo actualizado
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(rates_data, f, indent=2, ensure_ascii=False)

    print(f"Archivo actualizado en: {target_path}")

    # Indicar a GitHub Actions si hubo cambios
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as f:
            f.write(f"has_changed={'true' if has_changed else 'false'}\n")
            f.write(f"usd={rates_data['usd']}\n")
            f.write(f"eur={rates_data['eur']}\n")
            f.write(f"fecha_valor={rates_data['fecha_valor']}\n")


if __name__ == "__main__":
    main()
