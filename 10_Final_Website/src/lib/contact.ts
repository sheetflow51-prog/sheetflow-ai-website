/**
 * Single source of truth for where "Book a free automation audit" goes.
 *
 * Calendly's "Free Automation Audit" event type (30 min, Google Meet) —
 * created via the account's default event type, renamed and described to
 * match the real offer. Real booking (time slots, calendar invite,
 * confirmation email) rather than an open-ended chat message.
 */
export const BOOKING_URL = 'https://calendly.com/sheetflow51/30min';

/**
 * WhatsApp click-to-chat — kept as the fallback contact channel.
 * Matches the same pattern already proven on SheetFlow's own client work
 * (see Demo Website/n8n-dental-booking-workflow.json).
 */
export const WHATSAPP_NUMBER = '919756072538';

const AUDIT_MESSAGE = "Hi! I'd like to book a free automation audit for my business.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(AUDIT_MESSAGE)}`;
