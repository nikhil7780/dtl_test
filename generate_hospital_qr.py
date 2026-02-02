#!/usr/bin/env python3
"""
Generate QR codes for Hospital Navigation System
"""

import qrcode
import os
from pathlib import Path

# Hospital Map QR Codes
QR_CODES = {
    "QR_START": "Hospital Entrance - Starting Point",
    "QR_MAIN_1": "Main Junction M1 - Choose Direction",
    "QR_MAIN_2": "Main Junction M2 - Upper Floor",
    "QR_ROOM_1": "Room 1 - General Ward",
    "QR_ROOM_2": "Room 2 - Outpatient Clinic Junction",
    "QR_ROOM_3": "Room 3 - Emergency Ward",
    "QR_ROOM_4": "Room 4 - Operation Theater Junction",
    "QR_ROOM_5": "Room 5 - Intensive Care Unit",
}

# Create output directory
output_dir = Path(__file__).parent / "public" / "qrcodes"
output_dir.mkdir(parents=True, exist_ok=True)

print(f"Generating QR codes in: {output_dir}")

for qr_code, description in QR_CODES.items():
    try:
        # Create QR code with location code as data
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_code)
        qr.make(fit=True)
        
        # Create an image with a label
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save as PNG
        filename = output_dir / f"{qr_code}.png"
        img.save(filename)
        print(f"✓ Generated: {qr_code}.png - {description}")
        
    except Exception as e:
        print(f"✗ Error generating {qr_code}: {e}")

print("\n" + "="*60)
print("QR Code Generation Complete!")
print("="*60)
print("\nHospital Navigation QR Code Map:")
print("-" * 60)
print("\n🟢 ENTRANCE:")
print("  QR_START - Scan this at the hospital entrance\n")

print("🔵 MAIN JUNCTIONS:")
print("  QR_MAIN_1 (M1) - First decision point, choose direction")
print("  QR_MAIN_2 (M2) - Upper floor main junction\n")

print("🟣 ROOMS:")
print("  QR_ROOM_1 - General Ward")
print("  QR_ROOM_2 - Outpatient Clinic (with junction)")
print("  QR_ROOM_3 - Emergency Ward")
print("  QR_ROOM_4 - Operation Theater (with junction)")
print("  QR_ROOM_5 - Intensive Care Unit\n")

print("📍 Navigation Flow:")
print("  1. Scan QR_START at entrance")
print("  2. Follow guidance to QR_MAIN_1")
print("  3. Choose left/right/up direction")
print("  4. Scan junction QR codes (QR_ROOM_X)")
print("  5. Reach destination room\n")

print("✨ All QR codes saved to: public/qrcodes/")
print("   Download and print them for your hospital!")
