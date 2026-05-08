const JOB_TYPE_MAP = {
  'cost-saving-audit':      'Cost-Saving Audit',
  'content-creation':       'Content Creation/Editing',
  'ai-prompt-engineering':  'AI & Prompt Engineering',
  'app-development':        'App Development',
  'process-automation':     'Process Automation',
  'database-schema':        'Database Schema Management',
  'cloud-storage-setup':    'Cloud Storage Setup',
  'file-structure-sync':    'File Structure/Tagging/Sync',
  'self-hosted-app':        'Self-Hosted App Config',
  'account-email-sso':      'Account/Email/SSO Setup',
  'password-manager':       'Password Manager Setup',
  'voip-setup':             'VOIP Service Setup',
  'screen-lock-bypass':     'Screen Lock Bypass',
  'factory-reset':          'Device Factory Reset',
  'initial-device-setup':   'Initial Device Setup',
  'backup-restore':         'Backup & Restore',
  'os-install-upgrade':     'Install/Upgrade OS',
  'psim-esim-install':      'Install/Change pSIM or eSIM',
  'switch-carriers':        'Switch Mobile Carriers',
  'activate-mobile':        'Activate/Reactivate Mobile Service',
  'carrier-unlocking':      'Carrier Unlocking',
  'smart-home-setup':       'Smart Home Setup/Device Integration',
};

export function formatJobType(slug) {
  if (!slug) return '';
  if (JOB_TYPE_MAP[slug]) return JOB_TYPE_MAP[slug];
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
