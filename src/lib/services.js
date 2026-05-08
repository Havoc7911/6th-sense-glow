import { Shield, Smartphone, Cloud, Brain, Compass, Home, Signal } from 'lucide-react';

/* ─── CENTRAL SERVICE CATEGORIES ─── */
export const serviceCategories = [
  {
    name: "Benefit Navigation",
    icon: Compass,
    items: [
      { id: "cost-saving-audit", title: "Cost-Saving Audit", detail: "A comprehensive review of your current subscriptions and services. We'll identify unnecessary expenses, negotiate better rates, and find available discounts or promotions to lower your monthly bills. (Avg. savings $80/mo or 20% of total savings)", price: "$35" }
    ]
  },
  {
    name: "Digital Strategy",
    icon: Brain,
    items: [
      { id: "content-creation", title: "Content Creation/Editing", detail: "Professional creation, editing, and formatting of digital assets including photos, social media posts, documents, dynamic web forms, and marketing materials tailored to your specific needs.", price: "$50/hr" },
      { id: "ai-prompt-engineering", title: "AI & Prompt Engineering", detail: "Expert assistance in crafting effective prompts for AI models (like ChatGPT or Midjourney) to generate high-quality text, code, or images for your personal or business projects.", price: "$75" },
      { id: "app-development", title: "App Development", detail: "End-to-end development of custom web and mobile applications. From initial concept and UI/UX design to coding, testing, and deployment.", price: "$90/hr" },
      { id: "process-automation", title: "Process Automation", detail: "Streamline your digital workflow by connecting apps and automating repetitive tasks using custom scripts and integration tools like Zapier or Make.", price: "$50/hr" },
      { id: "database-schema", title: "Database Schema Management", detail: "Professional design, optimization, and management of complex data structures to ensure your information is stored securely, efficiently, and is highly accessible.", price: "$90/hr" }
    ]
  },
  {
    name: "Data & Cloud",
    icon: Cloud,
    items: [
      { id: "cloud-storage-setup", title: "Cloud Storage Setup", detail: "Complete configuration of cloud storage solutions (iCloud, Google Drive, OneDrive) across all your devices, ensuring your data is safely backed up and easily accessible.", price: "$40" },
      { id: "file-structure-sync", title: "File Structure/Tagging/Sync", detail: "Organization of chaotic digital file systems. We will structure your folders, implement logical tagging conventions, and ensure seamless synchronization across multiple devices.", price: "$65" },
      { id: "self-hosted-app", title: "Self-Hosted App Config", detail: "Installation and configuration of self-hosted applications on your personal server or NAS, giving you total control and privacy over your digital tools.", price: "$100" }
    ]
  },
  {
    name: "Identity & Security",
    icon: Shield,
    items: [
      { id: "account-email-sso", title: "Account/Email/SSO Setup", detail: "Secure creation and configuration of new digital accounts (Google, Apple, Microsoft) including the setup of Single Sign-On (SSO) and robust security settings.", price: "$30" },
      { id: "password-manager", title: "Password Manager Setup", detail: "Migration to and setup of a secure password manager (like 1Password or Bitwarden). Includes organizing existing credentials and providing training on secure usage.", price: "$50" },
      { id: "voip-setup", title: "VOIP Service Setup", detail: "Configuration of Voice Over IP communication services (such as Ooma or Google Voice) to provide reliable, internet-based phone capabilities for your home or business.", price: "$60" },
      { id: "screen-lock-bypass", title: "Screen Lock Bypass", detail: "Technical assistance to regain access to a device by removing or bypassing forgotten PINs, patterns, or passcodes. (Proof of ownership may be required).", price: "$25" }
    ]
  },
  {
    name: "Device Maintenance",
    icon: Smartphone,
    items: [
      { id: "factory-reset", title: "Device Factory Reset", detail: "A complete and secure data wipe of your device, restoring it to factory default settings. Ideal for preparing a device for sale, trade-in, or a fresh start.", price: "$25" },
      { id: "initial-device-setup", title: "Initial Device Setup", detail: "Comprehensive initial configuration for a new smartphone, tablet, or computer. Includes account linkage, network connection, and personalization of basic settings.", price: "$40" },
      { id: "backup-restore", title: "Backup & Restore", detail: "Secure transfer of all your photos, contacts, and personal data from an old device to a new one, or restoring data from a cloud/local backup.", price: "$45" },
      { id: "os-install-upgrade", title: "Install/Upgrade OS", detail: "Professional installation, major version upgrade, or safe downgrade of your device's Operating System (Windows, macOS, iOS, or Android).", price: "$40" }
    ]
  },
  {
    name: "Mobile & Carrier Services",
    icon: Signal,
    items: [
      { id: "number-porting", title: "Number Porting", detail: "Port your existing local landline or mobile number to a new service provider. Note: Landlines may be unreachable for up to 24 hours during porting. Small porting fees may apply and will be authorized before work begins.", price: "$30" },
      { id: "psim-esim-install", title: "Install/Change pSIM or eSIM", detail: "Assistance with swapping a physical SIM card or provisioning a digital eSIM to establish or change your cellular network connection.", price: "$20" },
      { id: "switch-carriers", title: "Switch Mobile Carriers", detail: "Full management of the process to switch your cellular service to a new provider, including porting your existing phone number and ensuring network activation.", price: "$30" },
      { id: "activate-mobile", title: "Activate/Reactivate Mobile Service", detail: "Activation of a new cellular line or the reactivation of a previously suspended mobile service plan with your carrier.", price: "$10" },
      { id: "carrier-unlocking", title: "Carrier Unlocking", detail: "Processing the removal of network restrictions on your smartphone, allowing it to be used with other compatible cellular carriers. (Device must meet carrier eligibility).", price: "$25" }
    ]
  },
  {
    name: "Smart Home & IoT",
    icon: Home,
    items: [
      { id: "smart-home-setup", title: "Smart Home Setup/Device Integration", detail: "Installation and network integration of smart home devices (cameras, thermostats, lights) onto platforms like Alexa, Google Home, Apple HomeKit, or Matter.", price: "$50/hr" }
    ]
  }
];

export function getServicePricing(serviceIdOrName) {
  if (!serviceIdOrName) return null;
  const matchStr = String(serviceIdOrName).toLowerCase();
  for (const cat of serviceCategories) {
    for (const item of cat.items) {
      if (item.id === matchStr || item.title.toLowerCase() === matchStr) {
        return item;
      }
    }
  }
  return null;
}
