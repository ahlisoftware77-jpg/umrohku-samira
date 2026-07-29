import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, mode = 'both', firebaseToken, checkAuthOnly = false } = body;

    // Check CLI Auth Status Only
    if (checkAuthOnly) {
      try {
        const env = { ...process.env };
        if (firebaseToken) env.FIREBASE_TOKEN = firebaseToken;

        const { stdout } = await execPromise('npx firebase-tools projects:list', { env, timeout: 15000 });
        return NextResponse.json({
          success: true,
          isLoggedIn: true,
          message: '✅ Firebase CLI sudah terautentikasi dan siap digunakan.',
          output: stdout,
        });
      } catch (authErr: any) {
        return NextResponse.json({
          success: false,
          isLoggedIn: false,
          message: '⚠️ Firebase CLI Belum Terautentikasi! Perlu login ke akun Firebase terlebih dahulu.',
          output: authErr.stdout || authErr.stderr || authErr.message,
          suggestion: "Jalankan 'npx firebase login:ci' di terminal untuk mendapatkan CI Token, lalu masukkan token tersebut di bawah.",
        });
      }
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID sasaran wajib disertakan!' },
        { status: 400 }
      );
    }

    const cleanProjectId = projectId.replace(/[^a-zA-Z0-9_-]/g, '');

    let targets = 'firestore:rules,firestore:indexes';
    if (mode === 'rules') targets = 'firestore:rules';
    if (mode === 'indexes') targets = 'firestore:indexes';

    const env = { ...process.env };
    if (firebaseToken) {
      env.FIREBASE_TOKEN = firebaseToken;
    }

    const command = `npx firebase-tools deploy --only ${targets} --project ${cleanProjectId} --non-interactive`;

    console.log(`[Web CLI Runner] Executing: ${command}`);

    const { stdout, stderr } = await execPromise(command, {
      timeout: 60000,
      env,
    });

    return NextResponse.json({
      success: true,
      message: `Deploy CLI ke project '${cleanProjectId}' berhasil dijalankan!`,
      command,
      stdout,
      stderr,
      timestamp: new Date().toLocaleString(),
    });
  } catch (err: any) {
    console.error('[Web CLI Runner Error]:', err);

    const fullOutput = `${err.stdout || ''}\n${err.stderr || ''}\n${err.message || ''}`;
    let isAuthIssue = false;
    let authNote = '';

    if (fullOutput.includes('login') || fullOutput.includes('auth') || fullOutput.includes('401') || fullOutput.includes('403') || fullOutput.includes('Permission denied')) {
      isAuthIssue = true;
      authNote = '⚠️ OTENTIKASI DIPERLUKAN: Perintah CLI gagal karena akun Firebase belum terautentikasi (login). Harap masukkan FIREBASE_TOKEN di bawah ini atau jalankan npx firebase login pada server.';
    }

    return NextResponse.json({
      success: false,
      isAuthIssue,
      message: isAuthIssue ? authNote : (err.message || 'Gagal mengeksekusi CLI.'),
      command: err.cmd || '',
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || '',
      timestamp: new Date().toLocaleString(),
    });
  }
}
