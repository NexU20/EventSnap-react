import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma.ts';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar.' },
        { status: 400 }
      );
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru dengan default kuota harian 50
    const newUser = await prisma.user.create({
      data: {
        name: name || null,
        email: email,
        password: hashedPassword,
        dailyQuota: 50,
        lastResetDate: new Date()
      }
    });

    // Jangan kembalikan password ke client
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil. Silakan masuk.',
        data: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error on user registration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server saat registrasi.',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
