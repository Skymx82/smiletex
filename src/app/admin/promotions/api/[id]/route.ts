import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

// GET /admin/promotions/api/[id] - Récupérer un code promo spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = params.id;
    const coupon = await stripe.coupons.retrieve(couponId);
    
    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error(`Erreur lors de la récupération du code promo ${params.id}:`, error);
    
    if (error.code === 'resource_missing') {
      return NextResponse.json(
        { error: 'Code promo non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du code promo', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /admin/promotions/api/[id] - Supprimer un code promo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const couponId = params.id;
    const deleted = await stripe.coupons.del(couponId);
    
    return NextResponse.json({ deleted });
  } catch (error: any) {
    console.error(`Erreur lors de la suppression du code promo ${params.id}:`, error);
    
    if (error.code === 'resource_missing') {
      return NextResponse.json(
        { error: 'Code promo non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du code promo', details: error.message },
      { status: 500 }
    );
  }
}
