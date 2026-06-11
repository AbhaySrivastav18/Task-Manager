import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      {message}
    </div>
  );
}
