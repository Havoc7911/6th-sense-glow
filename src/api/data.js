import { getSupabase } from '../lib/supabase';
import { getServicePricing } from '../lib/services';

export const BACKEND_NOT_CONFIGURED = 'BACKEND_NOT_CONFIGURED';

function assertSupabase() {
  const sb = getSupabase();
  if (!sb) {
    const err = new Error('Supabase is not configured');
    err.code = BACKEND_NOT_CONFIGURED;
    throw err;
  }
  return sb;
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export async function insertQuote(row) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('quotes').insert({
    name: row.name,
    email: row.email,
    phone: row.phone,
    job_type: row.job_type || null,
    service: row.service || null,
    device_type: row.device_type || null,
    brand: row.brand || null,
    model: row.model || null,
    os: row.os || null,
    request_type: row.request_type || 'quote',
    row_service: row.row_service || null,
    status: 'Pending',
    snap_medicaid: row.snap_medicaid || null,
    hardship_financing: row.hardship_financing || false,
    hardship_details: row.hardship_details || null,
    description: row.description || null,
    eligible_for_unlock: row.eligible_for_unlock || false,
    priority: row.priority || 'Normal',
    preferred_contact: row.preferred_contact || 'Email',
    ticket_code: row.ticket_code || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateQuote(quoteId, updates) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('quotes').update(updates).eq('id', quoteId).select().single();
  if (error) throw error;
  return data;
}

export async function convertQuoteToTicket(quote, ticketCode) {
  const payload = {
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    job_type: quote.service || null,
    service: quote.service || null,
    device_type: quote.device_type || 'Unknown',
    brand: quote.brand || 'Unknown',
    os: quote.os || 'Unknown',
    snap_medicaid: quote.snap_medicaid || null,
    hardship_financing: quote.hardship_financing || false,
    hardship_details: quote.hardship_details || null,
    eligible_for_unlock: quote.eligible_for_unlock || false,
    priority: quote.priority || 'Normal',
    status: 'Pending',
    ticket_code: ticketCode,
  };
  let initialInvoiceStatus = 'Estimate. Not final.';
  let initialInvoiceItems = [];
  if (quote.service) {
    const serviceTarget = quote.service;
    let matchedService = getServicePricing(serviceTarget);
    if (matchedService) {
      if (typeof matchedService.price === 'string' && matchedService.price.includes('/hr')) {
        initialInvoiceStatus = 'Awaiting Consult for Estimate.';
      } else {
        initialInvoiceItems = [{ description: matchedService.title, qty: 1, price: matchedService.price }];
      }
      if (quote.priority === 'Urgent') {
        const isHourly = typeof matchedService.price === 'string' && matchedService.price.includes('/hr');
        const surchargeTitle = 'Urgent Priority Service Charge';
        const surchargePrice = '$50';
        initialInvoiceItems.push({ description: surchargeTitle, qty: 1, price: surchargePrice });
      }
    }
  } else if (quote.priority === 'Urgent') {
    initialInvoiceItems.push({ description: 'Urgent Priority Service Charge', qty: 1, price: '$50' });
  }
  payload.invoice_status = initialInvoiceStatus;
  payload.invoice_items = initialInvoiceItems;
  const sb = assertSupabase();
  const { data, error } = await sb.from('tickets').insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    job_type: payload.job_type,
    service: payload.service,
    device_type: payload.device_type,
    brand: payload.brand,
    model: null,
    os: payload.os,
    imei: null,
    iccid: null,
    provider: null,
    snap_medicaid: payload.snap_medicaid,
    hardship_financing: payload.hardship_financing,
    hardship_details: payload.hardship_details,
    notes: null,
    credentials: null,
    status: payload.status || 'Pending',
    priority: payload.priority || 'Normal',
    eligible_for_unlock: payload.eligible_for_unlock,
    ticket_code: payload.ticket_code,
    invoice_status: payload.invoice_status,
    invoice_items: payload.invoice_items,
  }).select().single();
  if (error) throw error;
  await updateQuote(quote.id, { status: 'Converted', accepted_at: new Date().toISOString() });
  try {
    await insertTicketEvent(data.id, 'Client Authorization', 'Quote/estimate accepted. Work Authorized.');
  } catch (e) {
    console.error('Failed to log authorization', e);
  }
  return data;
}

export async function insertTicket(row) {
  const sb = assertSupabase();
  const serviceTarget = row.service || row.job_type;
  let initialInvoiceStatus = 'Estimate. Not final.';
  let initialInvoiceItems = [];
  if (serviceTarget) {
    let matchedService = getServicePricing(serviceTarget);
    if (matchedService) {
      if (typeof matchedService.price === 'string' && matchedService.price.includes('/hr')) {
        initialInvoiceStatus = 'Awaiting Consult for Estimate.';
      } else {
        initialInvoiceItems = [{ description: matchedService.title, qty: 1, price: matchedService.price }];
      }
    }
  }
  if (row.priority === 'Urgent') {
    initialInvoiceItems.push({ description: 'Urgent Priority Service Charge', qty: 1, price: '$50' });
  }
  const { data, error } = await sb.from('tickets').insert({
    name: row.name,
    email: row.email,
    phone: row.phone,
    job_type: row.job_type,
    service: row.service || null,
    device_type: row.device_type || 'Unknown',
    brand: row.brand || 'Unknown',
    model: row.model || 'Unknown',
    os: row.os || 'Unknown',
    imei: row.imei || null,
    iccid: row.iccid || null,
    provider: row.provider || null,
    snap_medicaid: row.snap_medicaid || null,
    hardship_financing: row.hardship_financing || false,
    hardship_details: row.hardship_details || null,
    notes: row.notes || null,
    credentials: row.credentials || null,
    status: row.status || 'Pending',
    priority: row.priority || 'Normal',
    eligible_for_unlock: row.eligible_for_unlock || false,
    ticket_code: row.ticket_code || null,
    invoice_status: initialInvoiceStatus,
    invoice_items: initialInvoiceItems,
  }).select().single();
  if (error) throw error;
  return data;
}

// ─── Ticket Fetches ─────────────────────────────────────────────────────────

export async function fetchAllTickets() {
  const sb = assertSupabase();
  const { data, error } = await sb.from('tickets').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllQuotes() {
  const sb = assertSupabase();
  const { data, error } = await sb.from('quotes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchTicketsByEmail(email) {
  const sb = assertSupabase();
  const normalized = email.trim().toLowerCase();
  const { data, error } = await sb.from('tickets').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).filter((t) => t.email?.toLowerCase() === normalized);
}

export async function fetchQuotesByEmail(email) {
  const sb = assertSupabase();
  const normalized = email.trim().toLowerCase();
  const { data, error } = await sb.from('quotes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).filter((t) => t.email?.toLowerCase() === normalized);
}

// ─── Code-based lookups (public, no auth required) ─────────────────────────

export async function fetchQuoteByCode(code) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('quotes').select('*').eq('ticket_code', code.trim().toUpperCase()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchTicketByCode(code) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('tickets').select('*').eq('ticket_code', code.trim().toUpperCase()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function lookupByCode(code) {
  const normalized = code.trim().toUpperCase();
  // Try tickets first, then quotes
  const ticket = await fetchTicketByCode(normalized);
  if (ticket) return { type: 'ticket', record: ticket };
  const quote = await fetchQuoteByCode(normalized);
  if (quote) return { type: 'quote', record: quote };
  return null;
}

// ─── Status/field updates ───────────────────────────────────────────────────

export async function updateTicketStatus(ticketId, status) {
  const sb = assertSupabase();
  const { error } = await sb.from('tickets').update({ status }).eq('id', ticketId);
  if (error) throw error;
}

export async function updateTicketPriority(ticketId, priority) {
  const sb = assertSupabase();
  const { error } = await sb.from('tickets').update({ priority }).eq('id', ticketId);
  if (error) throw error;
}

export async function updateTicketAccepted(ticketId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('tickets').update({ accepted_at: new Date().toISOString(), status: 'Authorized' }).eq('id', ticketId).select().single();
  if (error) throw error;
  // Log the authorization
  try {
    await insertTicketEvent(ticketId, 'Client Authorization', 'Quote/estimate accepted. Work Authorized.');
  } catch (e) {
    console.error('Failed to log authorization', e);
  }
  return data;
}

export async function updateTicketSummary(ticketId, summary) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('tickets').update({ summary }).eq('id', ticketId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTicket(ticketId) {
  const sb = assertSupabase();
  const { error } = await sb.from('tickets').delete().eq('id', ticketId);
  if (error) throw error;
}

export async function deleteQuote(quoteId) {
  const sb = assertSupabase();
  const { error } = await sb.from('quotes').delete().eq('id', quoteId);
  if (error) throw error;
}

export async function updateTicketInfo(ticketId, payload) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('tickets').update(payload).eq('id', ticketId).select().single();
  if (error) throw error;
  return data;
}

export async function markMagicLinkRequested(email) {
  const sb = assertSupabase();
  const normalized = email.trim().toLowerCase();
  const { error } = await sb.from('tickets').update({ magic_link_requested: true }).eq('email', normalized);
  if (error) throw error;
}

// ─── Ticket Events ──────────────────────────────────────────────────────────

export async function fetchTicketEvents(ticketId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('ticket_events').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function insertTicketEvent(ticketId, eventType, note) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('ticket_events').insert({ ticket_id: ticketId, event_type: eventType, note });
  if (error) throw error;
  return data;
}

export async function updateTicketEvent(eventId, updates) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('ticket_events').update(updates).eq('id', eventId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTicketEvent(eventId) {
  const sb = assertSupabase();
  const { error } = await sb.from('ticket_events').delete().eq('id', eventId);
  if (error) throw error;
}

// ─── Ticket Files ──────────────────────────────────────────────────────────

export async function fetchTicketFiles(ticketId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('ticket_files').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function uploadTicketFile(ticketId, file) {
  const sb = assertSupabase();
  const ext = file.name.split('.').pop();
  const path = `${ticketId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await sb.storage.from('ticket-attachments').upload(path, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;
  const { data: urlData } = sb.storage.from('ticket-attachments').getPublicUrl(path);
  const { data, error } = await sb.from('ticket_files').insert({ ticket_id: ticketId, file_name: file.name, file_url: urlData.publicUrl }).select().single();
  if (error) throw error;
  return data;
}

// ─── Messages ─────────────────────────────────────────────────────────────

export async function fetchMessages(ticketId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function insertMessage({ ticketId, sender, text, isTech }) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('messages').insert({ ticket_id: ticketId, sender, text, is_tech: isTech }).select().single();
  if (error) throw error;
  return data;
}

// ─── Promotions ─────────────────────────────────────────────────────────────

export async function fetchAllPromotions() {
  const sb = assertSupabase();
  const { data, error } = await sb.from('promotions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertPromotion(row) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('promotions').insert({ title: row.title, description: row.description, code: row.code || null, active: row.active !== false }).select().single();
  if (error) throw error;
  return data;
}

export async function updatePromotion(id, updates) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('promotions').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePromotion(id) {
  const sb = assertSupabase();
  const { error } = await sb.from('promotions').delete().eq('id', id);
  if (error) throw error;
}

// ─── Realtime subscriptions ─────────────────────────────────────────────────

export function subscribeTickets(callback) {
  const sb = getSupabase();
  if (!sb) return () => {};
  const channel = sb.channel('tickets-realtime').on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'tickets' },
    callback
  ).subscribe();
  return () => sb.removeChannel(channel);
}

export function subscribeQuotes(callback) {
  const sb = getSupabase();
  if (!sb) return () => {};
  const channel = sb.channel('quotes-realtime').on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'quotes' },
    callback
  ).subscribe();
  return () => sb.removeChannel(channel);
}

// ─── Invoice/Print ──────────────────────────────────────────────────────────

export async function generateInvoicePrint(ticketId) {
  const sb = assertSupabase();
  const { data, error } = await sb.from('tickets').select('*').eq('id', ticketId).single();
  if (error) throw error;
  return data;
}
