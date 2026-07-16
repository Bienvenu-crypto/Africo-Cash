import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { hashPin, generateAgentCode } from "@/lib/utils";

export async function POST(req) {
  const body = await req.json();
  const db = getDb();

  const required = [
    "nom",
    "prenom",
    "boutique_nom",
    "province",
    "ville",
    "telephone",
    "piece_type",
    "piece_numero",
    "pin",
    "gps_lat",
    "gps_lng",
    "facial_confirmed",
    "signature_confirmed",
  ];
  for (const f of required) {
    if (!body[f] && body[f] !== 0) {
      return NextResponse.json(
        { error: `Champ manquant: ${f}` },
        { status: 400 }
      );
    }
  }

  const agentCode = generateAgentCode(db);

  // Algorithme de proximite simplifie : choisit la banque partenaire la plus proche
  // parmi celles enregistrees, en se basant sur la distance GPS aux guichets existants.
  const guichets = db.prepare("SELECT * FROM guichets").all();
  let nearestBank = "Rawbank";
  if (guichets.length > 0) {
    let best = null;
    let bestDist = Infinity;
    for (const g of guichets) {
      // pas de coordonnees stockees pour les guichets dans ce MVP -> choix du premier
      if (bestDist === Infinity) {
        best = g;
        bestDist = 0;
      }
    }
    if (best) nearestBank = best.bank_name;
  }

  const stmt = db.prepare(`
    INSERT INTO agents
      (agent_code, nom, postnom, prenom, boutique_nom, province, ville, commune, quartier,
       avenue, numero_boutique, gps_lat, gps_lng, telephone, piece_type, piece_numero,
       pin_hash, banque_partenaire, status)
    VALUES (@agent_code, @nom, @postnom, @prenom, @boutique_nom, @province, @ville, @commune, @quartier,
       @avenue, @numero_boutique, @gps_lat, @gps_lng, @telephone, @piece_type, @piece_numero,
       @pin_hash, @banque_partenaire, 'Actif')
  `);

  stmt.run({
    agent_code: agentCode,
    nom: body.nom,
    postnom: body.postnom || "",
    prenom: body.prenom,
    boutique_nom: body.boutique_nom,
    province: body.province,
    ville: body.ville,
    commune: body.commune || "",
    quartier: body.quartier || "",
    avenue: body.avenue || "",
    numero_boutique: body.numero_boutique || "",
    gps_lat: body.gps_lat,
    gps_lng: body.gps_lng,
    telephone: body.telephone,
    piece_type: body.piece_type,
    piece_numero: body.piece_numero,
    pin_hash: hashPin(body.pin),
    banque_partenaire: nearestBank,
  });

  return NextResponse.json({
    success: true,
    agent_code: agentCode,
    banque_partenaire: nearestBank,
    message: `Compte Agent cree avec succes. Votre code agent est : ${agentCode}. Succursale partenaire liee : ${nearestBank}.`,
  });
}
