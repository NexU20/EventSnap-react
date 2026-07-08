import { prisma } from './prisma.ts';

/**
 * Memeriksa dan mereset kuota harian pengguna jika hari telah berganti.
 * Kuota akan direset kembali ke 50 dan lastResetDate diperbarui ke waktu sekarang.
 */
export async function checkAndResetQuota(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  const now = new Date();
  const lastReset = new Date(user.lastResetDate);

  // Periksa apakah hari, bulan, atau tahun telah berubah
  const isDifferentDay =
    now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (isDifferentDay) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyQuota: 50,
        lastResetDate: now,
      },
    });
    return updatedUser;
  }

  return user;
}

/**
 * Mengonsumsi kuota harian pengguna setelah memproses dokumen/sertifikat.
 */
export async function consumeQuota(userId: string, amount: number = 1): Promise<{ success: boolean; remainingQuota: number; message: string }> {
  // Pastikan kuota terbaru dicek/reset dulu sebelum dikurangi
  const user = await checkAndResetQuota(userId);

  if (user.dailyQuota < amount) {
    return {
      success: false,
      remainingQuota: user.dailyQuota,
      message: `Kuota harian tidak mencukupi. Sisa kuota Anda: ${user.dailyQuota} dokumen.`,
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      dailyQuota: {
        decrement: amount,
      },
    },
  });

  return {
    success: true,
    remainingQuota: updatedUser.dailyQuota,
    message: `Kuota berhasil dikurangi sebesar ${amount} dokumen.`,
  };
}
