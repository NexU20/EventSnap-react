import express from 'express';
import { prisma } from './src/lib/prisma.ts';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { checkAndResetQuota } from './src/lib/quota.ts';

const app = express();
app.use(express.json());

// Set up public static folder for uploaded certificate templates (using /tmp for write access on serverless runtimes)
const uploadDir = path.join('/tmp', 'uploads', 'templates');
mkdirSync(uploadDir, { recursive: true });
app.use('/uploads/templates', express.static(uploadDir));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname || 'template';
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${cleanName}`;
    cb(null, uniqueFileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format berkas tidak didukung. Harap unggah berkas gambar dengan format PNG atau JPEG.'));
    }
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        dailyQuota: 50,
        lastResetDate: new Date(),
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in POST /api/auth/register:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Reset quota if needed
    const updatedUser = await checkAndResetQuota(user.id);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/auth/session', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(200).json({ success: true, user: null });
    }

    const user = await checkAndResetQuota(String(userId));
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in GET /api/auth/session:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data session.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 1. GET /api/dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId: String(userId) } : {};

    const totalProjectAktif = await prisma.project.count({
      where: {
        status: {
          equals: 'Aktif'
        },
        ...filter
      }
    });

    const totalParticipants = await prisma.participant.count({
      where: userId ? {
        project: {
          userId: String(userId)
        }
      } : {}
    });

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil agregasi data dashboard",
      data: {
        totalProjectAktif,
        totalParticipants,
      }
    });
  } catch (error) {
    console.error("Error on GET /api/dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 1b. GET /api/analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Filter by year 2026 for the current context
    const startOfYear = new Date('2026-01-01T00:00:00.000Z');
    const endOfYear = new Date('2026-12-31T23:59:59.999Z');

    const participants = await prisma.participant.findMany({
      where: {
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        },
        ...(userId ? {
          project: {
            userId: String(userId)
          }
        } : {})
      },
      select: {
        createdAt: true,
        deliveryStatus: true
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const monthlyCounts = Array(12).fill(0).map((_, i) => ({
      month: monthNames[i],
      count: 0
    }));

    let delivered = 0;
    let pending = 0;
    let bounced = 0;

    participants.forEach(p => {
      // 1. Monthly Volume
      const date = new Date(p.createdAt);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyCounts[monthIndex].count++;
      }

      // 2. Email Delivery Status
      const status = p.deliveryStatus ? p.deliveryStatus.toLowerCase() : 'pending';
      if (status === 'sent' || status === 'delivered' || status === 'success') {
        delivered++;
      } else if (status === 'pending') {
        pending++;
      } else if (status === 'failed' || status === 'bounced') {
        bounced++;
      } else {
        pending++;
      }
    });

    const total = delivered + pending + bounced;
    const hasData = total > 0;

    res.status(200).json({
      success: true,
      hasData,
      message: "Berhasil mengambil agregasi data analitik",
      data: {
        monthlyVolume: monthlyCounts,
        deliveryStats: {
          delivered: { count: delivered, percentage: hasData ? Math.round((delivered / total) * 100) : 0 },
          pending: { count: pending, percentage: hasData ? Math.round((pending / total) * 100) : 0 },
          bounced: { count: bounced, percentage: hasData ? Math.round((bounced / total) * 100) : 0 },
          total,
          successRate: (delivered + bounced) > 0 ? Math.round((delivered / (delivered + bounced)) * 100) : 100
        }
      }
    });
  } catch (error) {
    console.error("Error on GET /api/analytics:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data analitik",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2. GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId: String(userId) } : {};

    const projects = await prisma.project.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        certificateTemplates: true,
        _count: {
          select: { participants: true }
        }
      }
    });

    const formattedProjects = projects.map(proj => {
      const firstTemplate = proj.certificateTemplates[0];
      return {
        id: proj.id,
        title: proj.projectName,
        type: 'Sertifikat Digital',
        status: proj.status,
        documentCount: proj._count.participants,
        dateString: new Date(proj.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        templateId: firstTemplate ? firstTemplate.id : 'preset-elegant',
        templateUrl: firstTemplate ? firstTemplate.templateUrl : undefined,
        spreadsheetData: [],
        mapping: {
          nama: 'Pilih kolom...',
          email: 'Pilih kolom...',
          nomorSertifikat: 'Pilih kolom...',
          asalInstansi: 'Pilih kolom...',
          tanggalKegiatan: 'Pilih kolom...',
        }
      };
    });

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data project",
      data: formattedProjects
    });
  } catch (error) {
    console.error("Error on GET /api/projects:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data project",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2b. POST /api/projects
app.post('/api/projects', async (req, res) => {
  try {
    const { id, nama_project, template_url, total_peserta, projectName, workspaceId, userId } = req.body;

    const actualProjectName = (nama_project || projectName || "").trim();

    if (!actualProjectName) {
      return res.status(400).json({
        success: false,
        message: "Nama project tidak boleh kosong"
      });
    }

    const actualTotalPeserta = total_peserta ? Number(total_peserta) : 0;

    // Check quota if userId is provided
    if (userId && actualTotalPeserta > 0) {
      const user = await checkAndResetQuota(String(userId));
      if (user.dailyQuota < actualTotalPeserta) {
        return res.status(400).json({
          success: false,
          message: "Kuota harian tidak cukup"
        });
      }

      // Decrement quota
      await prisma.user.update({
        where: { id: String(userId) },
        data: {
          dailyQuota: {
            decrement: actualTotalPeserta
          }
        }
      });
    }

    // IF an ID is provided, perform UPDATE (this prevents duplicated entries)
    if (id) {
      const existingProject = await prisma.project.findUnique({
        where: { id: String(id) }
      });

      if (existingProject) {
        const updatedProject = await prisma.project.update({
          where: { id: String(id) },
          data: {
            projectName: actualProjectName,
            status: "Generated",
            userId: userId ? String(userId) : undefined
          }
        });

        if (template_url) {
          const existingTemplate = await prisma.certificateTemplate.findFirst({
            where: { projectId: String(id) }
          });
          if (existingTemplate) {
            await prisma.certificateTemplate.update({
              where: { id: existingTemplate.id },
              data: {
                templateUrl: template_url
              }
            });
          } else {
            await prisma.certificateTemplate.create({
              data: {
                templateUrl: template_url,
                mappings: {
                  nama: { x: 400, y: 300, fontSize: 32, fontColor: "#c2662c", fontFamily: "serif" },
                  email: { x: 400, y: 380, fontSize: 16, fontColor: "#2d2722", fontFamily: "sans-serif" },
                  nomorSertifikat: { x: 400, y: 150, fontSize: 12, fontColor: "#888888", fontFamily: "mono" }
                },
                projectId: String(id)
              }
            });
          }
        }

        const existingParticipantsCount = await prisma.participant.count({
          where: { projectId: String(id) }
        });

        if (existingParticipantsCount === 0 && actualTotalPeserta > 0) {
          const participantsData = [];
          for (let i = 0; i < actualTotalPeserta; i++) {
            participantsData.push({
              name: `Peserta ${i + 1}`,
              email: `peserta${i + 1}@example.com`,
              certificateNumber: `REG-2026-00${i + 1}`,
              institution: "Umum",
              deliveryStatus: "Pending",
              projectId: String(id)
            });
          }
          await prisma.participant.createMany({
            data: participantsData
          });
        }

        return res.status(200).json({
          success: true,
          message: "Project berhasil diperbarui",
          data: updatedProject
        });
      }
    }

    const targetWorkspaceId = workspaceId || "hima-ti";

    let workspace = await prisma.workspace.findUnique({
      where: { id: targetWorkspaceId }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          id: targetWorkspaceId,
          name: "Workspace Utama"
        }
      });
    }

    const status = nama_project ? "Generated" : "Draft";

    const newProject = await prisma.project.create({
      data: {
        projectName: actualProjectName,
        status: status,
        workspaceId: workspace.id,
        userId: userId ? String(userId) : null
      }
    });

    if (template_url) {
      await prisma.certificateTemplate.create({
        data: {
          templateUrl: template_url,
          mappings: {
            nama: { x: 400, y: 300, fontSize: 32, fontColor: "#c2662c", fontFamily: "serif" },
            email: { x: 400, y: 380, fontSize: 16, fontColor: "#2d2722", fontFamily: "sans-serif" },
            nomorSertifikat: { x: 400, y: 150, fontSize: 12, fontColor: "#888888", fontFamily: "mono" }
          },
          projectId: newProject.id
        }
      });
    }

    if (total_peserta && typeof total_peserta === 'number' && total_peserta > 0) {
      const participantsData = [];
      for (let i = 0; i < total_peserta; i++) {
        participantsData.push({
          name: `Peserta ${i + 1}`,
          email: `peserta${i + 1}@example.com`,
          certificateNumber: `REG-2026-00${i + 1}`,
          institution: "Umum",
          deliveryStatus: "Pending",
          projectId: newProject.id
        });
      }
      await prisma.participant.createMany({
        data: participantsData
      });
    }

    res.status(201).json({
      success: true,
      message: "Project baru berhasil dibuat",
      data: newProject
    });
  } catch (error) {
    console.error("Error on POST /api/projects:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat project baru",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 3. POST /api/templates/upload
app.post('/api/templates/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Gagal mengunggah berkas template."
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;
    const { projectId } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File template tidak ditemukan. Harap unggah berkas template sertifikat."
      });
    }

    let targetProjectId = projectId;

    if (!targetProjectId || targetProjectId.trim() === "") {
      const existingProject = await prisma.project.findFirst();
      if (existingProject) {
        targetProjectId = existingProject.id;
      } else {
        let defaultWorkspace = await prisma.workspace.findFirst();
        if (!defaultWorkspace) {
          defaultWorkspace = await prisma.workspace.create({
            data: {
              name: "HIMA Teknik Informatika"
            }
          });
        }
        const defaultProject = await prisma.project.create({
          data: {
            projectName: "Webinar Nasional EventSnap",
            status: "Draft",
            workspaceId: defaultWorkspace.id
          }
        });
        targetProjectId = defaultProject.id;
      }
    } else {
      const projectExists = await prisma.project.findUnique({
        where: { id: targetProjectId }
      });

      if (!projectExists) {
        let defaultWorkspace = await prisma.workspace.findFirst();
        if (!defaultWorkspace) {
          defaultWorkspace = await prisma.workspace.create({
            data: {
              name: "HIMA Teknik Informatika"
            }
          });
        }
        await prisma.project.create({
          data: {
            id: targetProjectId,
            projectName: "Acara Sertifikasi Otomatis",
            status: "Draft",
            workspaceId: defaultWorkspace.id
          }
        });
      }
    }

    const templateUrl = `/uploads/templates/${file.filename}`;

    const defaultMappings = {
      nama: { x: 400, y: 300, fontSize: 32, fontColor: "#c2662c", fontFamily: "serif" },
      email: { x: 400, y: 380, fontSize: 16, fontColor: "#2d2722", fontFamily: "sans-serif" },
      nomorSertifikat: { x: 400, y: 150, fontSize: 12, fontColor: "#888888", fontFamily: "mono" }
    };

    const newCertificateTemplate = await prisma.certificateTemplate.create({
      data: {
        templateUrl: templateUrl,
        mappings: defaultMappings,
        projectId: targetProjectId
      }
    });

    res.status(201).json({
      success: true,
      message: "Template sertifikat berhasil diunggah dan disimpan ke database Prisma.",
      data: {
        templateId: newCertificateTemplate.id,
        templateUrl: newCertificateTemplate.templateUrl,
        projectId: newCertificateTemplate.projectId,
        mappings: newCertificateTemplate.mappings
      }
    });

  } catch (error) {
    console.error("Error on POST /api/templates/upload:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memproses unggahan template sertifikat",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 4. POST /api/participants
app.post('/api/participants', async (req, res) => {
  try {
    const { participants, projectId } = req.body;

    if (!Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: "Format data tidak valid. Data peserta harus berupa array of objects."
      });
    }

    let targetProjectId = projectId;

    if (!targetProjectId || targetProjectId.trim() === "") {
      const existingProject = await prisma.project.findFirst();
      if (existingProject) {
        targetProjectId = existingProject.id;
      } else {
        let defaultWorkspace = await prisma.workspace.findFirst();
        if (!defaultWorkspace) {
          defaultWorkspace = await prisma.workspace.create({
            data: {
              name: "HIMA Teknik Informatika"
            }
          });
        }
        const defaultProject = await prisma.project.create({
          data: {
            projectName: "Webinar Nasional EventSnap",
            status: "Draft",
            workspaceId: defaultWorkspace.id
          }
        });
        targetProjectId = defaultProject.id;
      }
    } else {
      const projectExists = await prisma.project.findUnique({
        where: { id: targetProjectId }
      });

      if (!projectExists) {
        let defaultWorkspace = await prisma.workspace.findFirst();
        if (!defaultWorkspace) {
          defaultWorkspace = await prisma.workspace.create({
            data: {
              name: "HIMA Teknik Informatika"
            }
          });
        }
        await prisma.project.create({
          data: {
            id: targetProjectId,
            projectName: "Acara Sertifikasi Otomatis",
            status: "Draft",
            workspaceId: defaultWorkspace.id
          }
        });
      }
    }

    // Ubah data peserta ke skema database Prisma
    const dataToInsert = participants.map((p: any, index: number) => {
      const name = p.name || p.nama || `Peserta ${index + 1}`;
      const email = p.email || `peserta${index + 1}@example.com`;
      const institution = p.institution || p.asalInstansi || 'Umum';
      const certificateNumber = p.certificateNumber || p.nomorSertifikat || `REG-2026-00${index + 1}`;

      return {
        name,
        email,
        institution,
        certificateNumber,
        deliveryStatus: "Pending",
        projectId: targetProjectId
      };
    });

    // Masukkan data peserta ke database (createMany)
    const result = await prisma.participant.createMany({
      data: dataToInsert
    });

    res.status(201).json({
      success: true,
      message: "Data peserta berhasil disimpan ke database.",
      data: {
        count: result.count,
        projectId: targetProjectId
      }
    });

  } catch (error) {
    console.error("Error on POST /api/participants:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan data peserta",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 5. POST /api/emails/send-bulk
app.post('/api/emails/send-bulk', async (req, res) => {
  try {
    const { participants, subject, message, projectId } = req.body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Daftar peserta tidak boleh kosong."
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subjek email wajib diisi."
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Template isi pesan email wajib diisi."
      });
    }

    // Process email list and customize content for each participant
    const dispatchedEmails = participants.map((p: any) => {
      const pName = p.nama || p.name || "Peserta";
      const pEmail = p.email || "";
      const pNumber = p.nomorSertifikat || p.certificateNumber || "";
      const pInstansi = p.asalInstansi || p.institution || "";

      // Replace placeholders dynamically
      let customizedMessage = message
        .replace(/\{\{Nama\}\}/g, pName)
        .replace(/\{\{nama\}\}/g, pName)
        .replace(/\{\{NomorSertifikat\}\}/g, pNumber)
        .replace(/\{\{Instansi\}\}/g, pInstansi);

      return {
        to: pEmail,
        recipientName: pName,
        subject: subject,
        body: customizedMessage,
        sentAt: new Date().toISOString(),
        status: "Success"
      };
    });

    // Simulate database status updates if projectId is provided
    if (projectId) {
      try {
        await prisma.participant.updateMany({
          where: {
            projectId: projectId,
            email: {
              in: participants.map((p: any) => p.email).filter(Boolean)
            }
          },
          data: {
            deliveryStatus: "Sent"
          }
        });
      } catch (dbErr) {
        console.warn("Could not update participants' status in database:", dbErr);
      }
    }

    // Simulate processing latency for realism (e.g. 1.2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1200));

    res.status(200).json({
      success: true,
      message: `Sukses menyimulasikan pengiriman email massal kepada ${dispatchedEmails.length} peserta.`,
      data: {
        totalSent: dispatchedEmails.length,
        dispatchedEmails
      }
    });
  } catch (error) {
    console.error("Error on POST /api/emails/send-bulk:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengirimkan email massal",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Integration with Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
  });
}

export default app;
