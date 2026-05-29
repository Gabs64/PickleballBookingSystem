import React from 'react';
import { Clock, CreditCard, Play, CheckCircle2, XCircle } from 'lucide-react';

export default function Badge({ status }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          className: 'badge-pending',
          label: 'Pending Pay',
          icon: <Clock size={12} />
        };
      case 'Paid':
        return {
          className: 'badge-paid',
          label: 'Paid / Reserved',
          icon: <CreditCard size={12} />
        };
      case 'Checked-In':
        return {
          className: 'badge-checked-in',
          label: 'Checked In',
          icon: <Play size={12} />
        };
      case 'Completed':
        return {
          className: 'badge-completed',
          label: 'Completed',
          icon: <CheckCircle2 size={12} />
        };
      case 'Cancelled':
        return {
          className: 'badge-cancelled',
          label: 'Cancelled',
          icon: <XCircle size={12} />
        };
      default:
        return {
          className: 'badge-pending',
          label: status,
          icon: <Clock size={12} />
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`badge ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
