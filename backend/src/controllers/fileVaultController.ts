import { type Request, type Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { uploadFile, getFiles, downloadFile, deleteFile } from '../services/fileVaultService';

function requireUserId(request: Request) {
  if (!request.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }
  return request.auth.userId;
}

export async function uploadFileVaultItem(request: Request, response: Response): Promise<void> {
  const userId = requireUserId(request);
  const file = request.file;
  const { key } = request.body; // In a real app, key would be derived/passed securely.

  if (!file) {
    throw new AppError('No file provided', 400);
  }
  if (!key || key.length !== 64) {
    throw new AppError('A valid 256-bit hex encryption key is required', 400);
  }

  const fileItem = await uploadFile(userId, file, key);
  
  response.status(201).json({ 
    success: true, 
    data: {
      id: fileItem.id,
      fileName: fileItem.fileName,
      fileSize: fileItem.fileSize,
      vtScore: fileItem.vtScore,
      vtReport: fileItem.vtReport
    } 
  });
}

export async function listFileVaultItems(request: Request, response: Response): Promise<void> {
  const userId = requireUserId(request);
  const files = await getFiles(userId);
  response.status(200).json({ success: true, data: files });
}

export async function downloadFileVaultItem(request: Request, response: Response): Promise<void> {
  const userId = requireUserId(request);
  const { id } = request.params;
  const { key } = request.query;

  if (!key || typeof key !== 'string' || key.length !== 64) {
    throw new AppError('A valid 256-bit hex encryption key is required in query params', 400);
  }

  const file = await downloadFile(userId, id, key);
  
  response.setHeader('Content-Type', file.mimeType);
  response.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
  response.send(file.buffer);
}

export async function deleteFileVaultItem(request: Request, response: Response): Promise<void> {
  const userId = requireUserId(request);
  const { id } = request.params;
  
  await deleteFile(userId, id);
  response.status(200).json({ success: true, message: 'File deleted' });
}
