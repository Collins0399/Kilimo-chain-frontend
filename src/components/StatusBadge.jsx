import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;
  
  let badgeClass = 'badge-warning';
  const s = String(status).toUpperCase();
  
  if (
    s === 'APPROVED' || 
    s === 'COMPLETED' || 
    s === 'SUCCESS' || 
    s === 'ACTIVE' || 
    s === 'VERIFIED' || 
    s === 'PAID' || 
    s === 'DELIVERED'
  ) {
    badgeClass = 'badge-success';
  } else if (
    s === 'REJECTED' || 
    s === 'FAILED' || 
    s === 'DEACTIVATED' || 
    s === 'INACTIVE' || 
    s === 'UNVERIFIED' || 
    s === 'CANCELLED'
  ) {
    badgeClass = 'badge-danger';
  } else if (
    s === 'PENDING' || 
    s === 'PROCESSING' || 
    s === 'AWAITING_PAYMENT'
  ) {
    badgeClass = 'badge-warning';
  } else if (
    s === 'INFO' || 
    s === 'BROADCAST'
  ) {
    badgeClass = 'badge-info';
  }
  
  return <span className={`badge ${badgeClass}`}>{status}</span>;
}
