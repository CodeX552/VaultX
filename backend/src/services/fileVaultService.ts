import { prisma } from '../database/prisma';
import crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

// Using memory storage for simplicity, but could be adapted to S3/Disk
export const uploadFile = async (userId: string, file: Express.Multer.File, key: string) => {
  // 1. Check Malware with VirusTotal
  let vtScore = 0;
  let vtReport = 'Clean';
  
  try {
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY;
    
    if (vtApiKey) {
      const response = await axios.get(`https://www.virustotal.com/api/v3/files/${fileHash}`, {
        headers: { 'x-apikey': vtApiKey }
      });
      
      const stats = response.data?.data?.attributes?.last_analysis_stats;
      if (stats && (stats.malicious > 0 || stats.suspicious > 0)) {
        vtScore = stats.malicious * 10 + stats.suspicious * 5;
        vtReport = `Malicious: ${stats.malicious}, Suspicious: ${stats.suspicious}`;
        
        if (vtScore > 20) {
          throw new AppError('File rejected: Malware detected', 403);
        }
      }
    }
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    logger.error('VirusTotal check failed', err);
  }

  // 2. Encrypt File Content
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 3. Save to Database
  return prisma.fileVaultItem.create({
    data: {
      userId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      vtScore,
      vtReport
    }
  });
};

export const getFiles = async (userId: string) => {
  return prisma.fileVaultItem.findMany({
    where: { userId },
    select: { id: true, fileName: true, fileSize: true, mimeType: true, vtScore: true, vtReport: true, createdAt: true }
  });
};

export const downloadFile = async (userId: string, fileId: string, key: string) => {
  const file = await prisma.fileVaultItem.findUnique({
    where: { id: fileId, userId }
  });

  if (!file) {
    throw new AppError('File not found', 404);
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(file.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(file.authTag, 'hex'));

  const decrypted = Buffer.concat([decipher.update(file.encryptedData), decipher.final()]);

  return {
    buffer: decrypted,
    fileName: file.fileName,
    mimeType: file.mimeType
  };
};

export const deleteFile = async (userId: string, fileId: string) => {
  await prisma.fileVaultItem.delete({
    where: { id: fileId, userId }
  });
};
