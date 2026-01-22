import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists by checking the profiles table
    const { data: existingProfile } = await supabaseServer
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    
    if (existingProfile) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }


    // Get the app URL for redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectTo = `${appUrl}/auth/set-password`;

    // Invite user by email (creates user account and sends invitation email)
    const { data: authData, error: authError } = await supabaseServer.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo,
        data: {
          name,
          role: "client",
        },
      }
    );

    if (authError || !authData.user) {
      console.error("Error inviting user:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to invite user" },
        { status: 500 }
      );
    }

    // Create profile record
    const { error: profileError } = await supabaseServer
      .from("profiles")
      .insert({
        id: authData.user.id,
        name,
        email,
        role: "client",
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Try to clean up the auth user if profile creation fails
      await supabaseServer.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create client profile" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Client invited successfully. They will receive an email to set their password.",
      userId: authData.user.id,
    });
  } catch (error) {
    console.error("Error in invite-client API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
