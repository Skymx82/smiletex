import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia', // Utiliser la version la plus récente de l'API Stripe
});

// GET /admin/promotions/api - Récupérer tous les codes promo
export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les coupons
    const coupons = await stripe.coupons.list({
      limit: 100, // Limite à 100 coupons pour éviter les problèmes de pagination
    });
    
    // Récupérer tous les codes promotionnels
    const promotionCodes = await stripe.promotionCodes.list({
      limit: 100,
      active: true,
    });
    
    // Créer un mapping des codes promotionnels par coupon ID
    const promoCodesByCoupon = promotionCodes.data.reduce((acc: Record<string, any[]>, code) => {
      if (code.coupon && code.coupon.id) {
        if (!acc[code.coupon.id]) {
          acc[code.coupon.id] = [];
        }
        acc[code.coupon.id].push(code);
      }
      return acc;
    }, {});
    
    // Enrichir les coupons avec leurs codes promotionnels
    const enrichedCoupons = coupons.data.map(coupon => ({
      ...coupon,
      promotionCodes: promoCodesByCoupon[coupon.id] || []
    }));
    
    return NextResponse.json({ coupons: enrichedCoupons });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des codes promo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des codes promo', details: error.message },
      { status: 500 }
    );
  }
}

// POST /admin/promotions/api - Créer un nouveau code promo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (body.discount_type === 'percent' && (!body.percent_off || body.percent_off < 1 || body.percent_off > 100)) {
      return NextResponse.json(
        { error: 'Le pourcentage de réduction doit être compris entre 1 et 100' },
        { status: 400 }
      );
    }
    
    if (body.discount_type === 'amount' && (!body.amount_off || body.amount_off < 1)) {
      return NextResponse.json(
        { error: 'Le montant de la réduction doit être supérieur à 0' },
        { status: 400 }
      );
    }
    
    // Vérifier que le code est fourni
    if (!body.code) {
      return NextResponse.json(
        { error: 'Le code promo est obligatoire' },
        { status: 400 }
      );
    }
    
    // Formater le code (en majuscules, sans espaces)
    const formattedCode = body.code.toUpperCase().replace(/\s+/g, '');
    
    // Préparer les données pour Stripe
    const couponData: Stripe.CouponCreateParams = {
      name: body.name,
      duration: body.duration as Stripe.CouponCreateParams.Duration,
      id: formattedCode, // L'ID du coupon dans Stripe sera également le code promo
    };
    
    // Ajouter les champs spécifiques selon le type de réduction
    if (body.discount_type === 'percent') {
      // Convertir en nombre et s'assurer que c'est entre 1 et 100
      const percentOff = parseFloat(body.percent_off);
      if (isNaN(percentOff) || percentOff < 1 || percentOff > 100) {
        return NextResponse.json(
          { error: 'Le pourcentage de réduction doit être un nombre entre 1 et 100' },
          { status: 400 }
        );
      }
      couponData.percent_off = percentOff;
    } else {
      // Convertir en nombre entier (centimes)
      const amountOff = Math.round(parseFloat(body.amount_off) * 100);
      if (isNaN(amountOff) || amountOff < 1) {
        return NextResponse.json(
          { error: 'Le montant de la réduction doit être un nombre positif' },
          { status: 400 }
        );
      }
      couponData.amount_off = amountOff;
      couponData.currency = body.currency;
    }
    
    // Ajouter duration_in_months si nécessaire
    if (body.duration === 'repeating') {
      const durationInMonths = parseInt(body.duration_in_months);
      if (isNaN(durationInMonths) || durationInMonths < 1) {
        return NextResponse.json(
          { error: 'La durée en mois doit être un nombre entier positif' },
          { status: 400 }
        );
      }
      couponData.duration_in_months = durationInMonths;
    }
    
    // Créer le coupon dans Stripe
    const coupon = await stripe.coupons.create(couponData);
    
    // Créer un code promotionnel associé au coupon
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: formattedCode,
      active: true
    });
    
    return NextResponse.json({ coupon, promotionCode });
  } catch (error: any) {
    console.error('Erreur lors de la création du code promo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du code promo', details: error.message },
      { status: 500 }
    );
  }
}
