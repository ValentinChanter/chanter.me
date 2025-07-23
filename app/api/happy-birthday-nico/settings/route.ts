import { NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({
    flag: process.env.NICO_FLAG1
  });
}

export async function GET() {
  return NextResponse.json({ 
    dark_mode: false, 
    language: "fr", 
    font_size: 5, 
    theme: "default", 
    zoom_level: 1,
    // New settings
    notifications: {
      enabled: false,
      sound: false,
      frequency: "immediately"
    },
    privacy: {
      activity_tracking: false,
      allow_cookies: false,
    },
    appearance: {
      show_animations: false,
      layout_type: "comfortable",
      show_tooltips: false
    },
    challenge: {
      difficulty_level: 1,
      hints_enabled: false,
      timer_visible: false,
      show_progress: false,
      auto_save: false
    },
    accessibility: {
      screen_reader: false,
      motion_reduced: false,
      keyboard_shortcuts: false,
      high_contrast: false
    }
  });
}

export async function POST() {
  return NextResponse.json({ message: btoa(process.env.NICO_FLAG1_POST || "") });
}