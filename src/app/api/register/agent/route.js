import { NextResponse } from "next/server";
import {
  generateAgentCode,
  getAllGuichets,
  insertAgent,
} from "@/lib/data";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  const body = await req.json();

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

  const agentCode = await generateAgentCode();

  const guichets = await getAllGuichets();
  let nearestBank = "Rawbank";
  if (guichets.length > 0) {
    nearestBank = guichets[0].bank_name;
  }

  await insertAgent({
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
