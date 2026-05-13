# Audio Assets

The audio system is fully wired and dormant (see `src/lib/audio.ts`,
`src/components/providers/AudioProvider.tsx`).

No audio plays until the user explicitly enables it via the AudioToggle in
the navigation. Audio is NEVER autoplay. The site ships without audio files
and the toggle simply does nothing until they are added here.

## Required files

| File | Duration | Max size | Category | Notes |
|---|---|---|---|---|
| `ui-hover.mp3` | 80–100ms | 15 KB | `ui` | Soft sine tone — micro-interaction |
| `ui-click.mp3` | 50–80ms | 10 KB | `ui` | Subtle click — micro-interaction |
| `signal-notify.mp3` | 200–300ms | 25 KB | `signal` | Intelligence event — new signal |
| `signal-success.mp3` | 300–500ms | 35 KB | `signal` | Completion tone |
| `ambient-atmos.mp3` | 30–60s loop | 200 KB max | `ambient` | Textural pad — no melody, no rhythm |

## Tone direction

- UI sounds: soft, pitched-sine character. Never percussive.
- Signal sounds: single-frequency resonance. Never melodic.
- Ambient: atmospheric texture only. ≤0.18 gain when active.
- Nothing should exceed the ambient bed in volume.
- All sounds should feel like they belong in a luxury AI operating system.

## Registering

Sounds are registered in `AudioProvider.tsx`. When files are added here,
the audio system activates automatically — no code changes needed.

## Format

MP3 for broad compatibility. If producing from DAW, export at 44.1 kHz,
192 kbps, normalized to -12 LUFS.
