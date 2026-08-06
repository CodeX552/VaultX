import zxcvbn from 'zxcvbn';
import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../config/logger';

export interface PasswordIntelResult {
  score: number;
  entropy: number;
  isPwned: boolean;
  pwnedCount: number;
  suggestions: string[];
  warning: string;
}

export const checkPasswordStrength = async (password: string): Promise<PasswordIntelResult> => {
  // 1. Local Entropy and Strength Check
  const result = zxcvbn(password);
  
  // 2. Have I Been Pwned Check (K-Anonymity)
  let isPwned = false;
  let pwnedCount = 0;
  
  try {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    const lines = response.data.split('\n');
    
    for (const line of lines) {
      const [hashSuffix, count] = line.trim().split(':');
      if (hashSuffix === suffix) {
        isPwned = true;
        pwnedCount = parseInt(count, 10);
        break;
      }
    }
  } catch (err) {
    logger.error('Failed to check HIBP API', err);
  }

  return {
    score: result.score,
    entropy: result.guesses_log10,
    isPwned,
    pwnedCount,
    suggestions: result.feedback.suggestions,
    warning: result.feedback.warning
  };
};
