import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { GoogleGenAI } from '@google/genai';

export const getThreats = async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  // Assuming an admin role check would be here in a real scenario,
  // but for VaultX we will let the user see attacks against them or their instance.
  const alerts = await prisma.securityAlert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const totalAttacks = await prisma.securityAlert.count();
  
  const highSeverityCount = await prisma.securityAlert.count({
    where: { severity: { in: ['HIGH', 'CRITICAL'] } }
  });

  res.status(200).json({
    success: true,
    alerts,
    stats: {
      totalAttacks,
      highSeverityCount
    }
  });
};

export const resolveThreat = async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  await prisma.securityAlert.update({
    where: { id },
    data: { resolved: true }
  });

  res.status(200).json({ success: true, message: 'Threat resolved' });
};

export const getIncidentTimeline = async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { ip } = req.query;
  
  if (!ip || typeof ip !== 'string') {
    throw new AppError('IP address is required', 400);
  }

  const alerts = await prisma.securityAlert.findMany({
    where: { ip },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const logs = await prisma.auditLog.findMany({
    where: { ip },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  // Combine and sort by createdAt
  const timeline = [...alerts, ...logs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.status(200).json({ success: true, timeline });
};

export const exportThreats = async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const alerts = await prisma.securityAlert.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // SIEM format (basic JSON dump)
  const exportData = alerts.map(alert => ({
    timestamp: alert.createdAt.toISOString(),
    event_type: 'security_alert',
    attack_type: alert.attackType,
    mitre_id: alert.mitreId,
    severity: alert.severity,
    source_ip: alert.ip,
    payload: alert.payload,
    http_method: alert.method,
    url: alert.url
  }));

  // Setting headers for download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=threat_export.json');
  res.status(200).send(JSON.stringify(exportData, null, 2));
};

export const analyzeThreatWithAI = async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const alert = await prisma.securityAlert.findUnique({
    where: { id }
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('GEMINI_API_KEY is not configured', 500);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      Analyze the following security alert:
      Attack Type: ${alert.attackType}
      URL: ${alert.url}
      Payload: ${alert.payload}
      Method: ${alert.method}
      Severity: ${alert.severity}
      
      Respond with a JSON object in exactly this format without markdown formatting or code blocks:
      {
        "analysis": "A brief explanation of what the attacker was trying to do.",
        "mitreTechnique": "The applicable MITRE ATT&CK ID (e.g. T1190)",
        "confidence": "A percentage (e.g. 95%)",
        "recommendation": "A single sentence recommendation for immediate action.",
        "remediation": [
          "Step 1 to fix the vulnerability permanently",
          "Step 2",
          "Step 3"
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const aiText = response.text || "{}";
    const aiResponse = JSON.parse(aiText);

    res.status(200).json({ success: true, analysis: aiResponse });
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw new AppError('Failed to analyze threat with AI', 500);
  }
};

