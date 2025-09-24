
import React from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const checkPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length > 8) score++;
    if (pw.match(/[a-z]/)) score++;
    if (pw.match(/[A-Z]/)) score++;
    if (pw.match(/\d+/)) score++;
    if (pw.match(/[^a-zA-Z0-9]/)) score++;
    return score;
  };

  const score = checkPasswordStrength(password);

  const getStrengthLabel = () => {
    switch (score) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthColor = () => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const strengthLabel = getStrengthLabel();
  const barWidth = password.length > 0 ? `${(score / 5) * 100}%` : '0%';
  const barColor = getStrengthColor();

  return (
    <div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 my-1">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: barWidth }}
        ></div>
      </div>
      <p className="text-xs text-right text-gray-500 dark:text-gray-400 h-4">
        {password.length > 0 && strengthLabel}
      </p>
    </div>
  );
};
