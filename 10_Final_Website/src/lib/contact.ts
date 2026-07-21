/**
 * Single source of truth for where "Book a free automation audit" goes.
 * WhatsApp click-to-chat — no external scheduling account required, and
 * matches the same booking pattern already proven on SheetFlow's own
 * client work (see Demo Website/n8n-dental-booking-workflow.json).
 */
export const WHATSAPP_NUMBER = '919756072538';

const AUDIT_MESSAGE = "Hi! I'd like to book a free automation audit for my business.";

export const BOOKING_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(AUDIT_MESSAGE)}`;
