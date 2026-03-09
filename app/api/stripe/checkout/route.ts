import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
    return NextResponse.redirect(new URL("/billing", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL));
  }

  const { data: membership } = await supabase.from("memberships").select("company_id").eq("user_id", user.id).single();

  if (!membership) {
    return NextResponse.redirect(new URL("/billing", process.env.NEXT_PUBLIC_BASE_URL));
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: 4900,
          recurring: { interval: "month" },
          product_data: {
            name: "AtelierFlow Pro"
          }
        }
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?status=cancel`,
    metadata: {
      company_id: membership.company_id
    }
  });

  return NextResponse.redirect(session.url || `${process.env.NEXT_PUBLIC_BASE_URL}/billing`);
}


