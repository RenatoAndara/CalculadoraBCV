#!/usr/bin/env python3
"""
Script para obtener las tasas oficiales del Banco Central de Venezuela (BCV)
y actualizar el archivo public/bcv_rates.json.
Autor: Renato Andara (RA 2026)
Diseñado para ejecutarse sin dependencias externas en GitHub Actions.
"""

from __future__ import annotations

import json
import os
import re
import ssl
import sys
import unicodedata
import urllib.request
from datetime import datetime, timedelta, timezone
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


MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]


def hoy_caracas() -> str:
    """Fecha de hoy en Venezuela (UTC-4, sin horario de verano) como AAAA-MM-DD."""
    return (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%d")


def fecha_de(snapshot: dict) -> str | None:
    """AAAA-MM-DD desde fecha_valor_iso o, si falta, desde el texto 'Viernes, 13 Noviembre 2026'."""
    iso = snapshot.get("fecha_valor_iso") or ""
    m = re.match(r"(\d{4}-\d{2}-\d{2})", iso)
    if m:
        return m.group(1)
    txt = unicodedata.normalize("NFD", (snapshot.get("fecha_valor") or "").lower())
    txt = "".join(c for c in txt if unicodedata.category(c) != "Mn")
    m = re.search(r"(\d{1,2})\s*(?:de\s+)?([a-z]+)\s*(?:de\s+)?(\d{4})", txt)
    if not m:
        return None
    mes = next((i + 1 for i, x in enumerate(MESES) if m.group(2).startswith(x[:3])), 0)
    return f"{m.group(3)}-{mes:02d}-{int(m.group(1)):02d}" if mes else None


def clasificar_por_fecha(snapshots: list[dict], hoy: str) -> dict:
    """Devuelve {'current': ..., 'next': ...} según la fecha valor frente a hoy."""
    por_fecha: dict[str, dict] = {}
    for snap in snapshots:
        f = fecha_de(snap)
        if f and snap.get("usd") and snap.get("eur"):
            por_fecha[f] = snap  # los últimos de la lista tienen prioridad
    fechas = sorted(por_fecha)
    pasadas = [f for f in fechas if f <= hoy]
    futuras = [f for f in fechas if f > hoy]

    def limpio(snap: dict) -> dict:
        return {k: snap.get(k) for k in ("fecha_valor", "fecha_valor_iso", "usd", "eur")}

    resultado: dict = {}
    if pasadas:
        s = limpio(por_fecha[pasadas[-1]])
        resultado["current"] = {"label": f"Tasa Vigente ({s['fecha_valor']})", "short_label": "Vigente Hoy", **s}
    if futuras:
        f = futuras[0]
        s = limpio(por_fecha[f])
        dia = DIAS_CORTOS[datetime.strptime(f, "%Y-%m-%d").weekday()]
        corta = f"{dia} {f[8:10]}/{f[5:7]}"
        resultado["next"] = {"label": f"Tasa Publicada ({s['fecha_valor']})", "short_label": f"Próx. Día · {corta}", **s}
    return resultado


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

    # Leer el archivo actual para conservar el historial
    old_data: dict = {}
    if target_path.exists():
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                old_data = json.load(f)
        except Exception:
            pass

    history = old_data.get("history", [])
    old_rates_meta = old_data.get("rates", {})

    new_snapshot = {
        "fecha_valor": rates_data["fecha_valor"],
        "fecha_valor_iso": rates_data["fecha_valor_iso"],
        "usd": rates_data["usd"],
        "eur": rates_data["eur"],
    }

    if (
        old_data.get("usd") == rates_data["usd"]
        and old_data.get("eur") == rates_data["eur"]
        and old_data.get("fecha_valor") == rates_data["fecha_valor"]
    ):
        print("Las tasas y la fecha valor ya están al día.")

    # Actualizar historial sin duplicados
    if not any(h.get("fecha_valor") == new_snapshot["fecha_valor"] for h in history):
        history.append(dict(new_snapshot))
    history = history[-30:]

    # Clasificar por FECHA VALOR frente a la fecha de hoy en Caracas (no por orden de
    # publicación): vigente = la más reciente con fecha <= hoy; próximo día = la más
    # cercana con fecha > hoy. El BCV publica la del día siguiente desde ~4 pm.
    pool = history + [s for s in (old_rates_meta.get("current"), old_rates_meta.get("next")) if s]
    pool.append(new_snapshot)
    rates_data["rates"] = clasificar_por_fecha(pool, hoy_caracas())
    rates_data["history"] = history

    # Solo hay cambios si cambió el contenido (tasas, fecha o clasificación)
    comparar = ("usd", "eur", "fecha_valor", "rates", "history")
    has_changed = any(old_data.get(k) != rates_data.get(k) for k in comparar)
    if not has_changed:
        print("No hay cambios.")

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
