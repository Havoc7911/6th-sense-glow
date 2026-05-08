import { Smartphone, Wifi } from 'lucide-react';

export function pickServiceIcon(jobType, brand) {
  const s = `${jobType || ''} ${brand || ''}`.toLowerCase();
  if (
    s.includes('router') ||
    s.includes('network') ||
    s.includes('mesh') ||
    s.includes('wifi') ||
    s.includes('eero') ||
    s.includes('comcast')
  ) {
    return Wifi;
  }
  return Smartphone;
}
