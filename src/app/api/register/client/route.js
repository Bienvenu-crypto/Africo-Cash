import { NextResponse } from "next/server";
import { generateAccountNumber, insertClient } from "@/lib/data";
import { hashPin } from "@/lib/utils";

export async function POST(req) {
  try {
    const body = await req.json();

    const required = [
      "nom",
      "prenom",
      "province",
      "ville",
      "profession",
      "telephone",
      "piece_type",
      "piece_numero",
      "pin",
      "otp_confirmed",
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

    if (!/^\d{4}$|^\d{6}$/.test(String(body.pin))) {
      return NextResponse.json(
        { error: "Le code PIN doit contenir 4 ou 6 chiffres." },
        { status: 400 }
      );
    }

    const accountNumber = await generateAccountNumber();

    await insertClient({
      account_number: accountNumber,
      nom: body.nom,
      postnom: body.postnom || "",
      prenom: body.prenom,
      province: body.province,
      ville: body.ville,
      commune: body.commune || "",
      quartier: body.quartier || "",
      avenue: body.avenue || "",
      numero_residence: body.numero_residence || "",
      profession: body.profession,
      telephone: body.telephone,
      piece_type: body.piece_type,
      piece_numero: body.piece_numero,
      pin_hash: hashPin(body.pin),
      agent_inscripteur: body.agent_inscripteur || null,
    });

    return NextResponse.json({
      success: true,
      account_number: accountNumber,
      message: `Bienvenue chez Africo Cash. Votre numero de compte unique a 8 chiffres est : ${accountNumber}.`,
    });
  } catch (e) {
    console.error("register/client:", e);
    return NextResponse.json(
      { error: e.message || "Erreur lors de la création du compte." },
      { status: 500 }
    );
  }
}
