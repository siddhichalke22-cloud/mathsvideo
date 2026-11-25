"""
Generates voice-over narration clips (via macOS `say` + ffmpeg normalization),
synthesizes an original subtle ambient background music track,
mixes them cleanly (-26 dB music bed beneath clear narration),
and writes `_Code/timeline.json` with exact millisecond-accurate beat timestamps.
"""

import json
import math
import os
import struct
import subprocess
import wave
from pathlib import Path

CODE_DIR = Path(__file__).resolve().parent
BUILD_DIR = CODE_DIR / "build"
AUDIO_DIR = BUILD_DIR / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

with open(CODE_DIR / "student_config.json", "r", encoding="utf-8") as f:
    STUDENT_CFG = json.load(f)

with open(CODE_DIR / "narration_script.json", "r", encoding="utf-8") as f:
    SCRIPT = json.load(f)

SAMPLE_RATE = 48000
OPENING_HOLD_SEC = 4.5
CLOSING_HOLD_SEC = 2.0


def run(cmd):
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{res.stderr}")
    return res


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / float(w.getframerate())


def synthesize_beat(beat_id: str, text: str, voice: str, rate: int) -> Path:
    aiff_path = AUDIO_DIR / f"{beat_id}.aiff"
    wav_path = AUDIO_DIR / f"{beat_id}.wav"
    run(["say", "-v", voice, "-r", str(rate), "-o", str(aiff_path), text])
    # Convert to 48kHz stereo PCM WAV with gentle compression/normalization for clarity
    run([
        "ffmpeg", "-y", "-i", str(aiff_path),
        "-af", "aresample=48000,highpass=f=85,acompressor=threshold=-18dB:ratio=2.5:attack=10:release=120,loudnorm=I=-16:TP=-1.5:LRA=7",
        "-ac", "2", "-ar", str(SAMPLE_RATE), "-c:a", "pcm_s16le",
        str(wav_path),
    ])
    if wav_duration(wav_path) < 0.2:
        raise RuntimeError(f"Generated empty audio for {beat_id}; ensure speech synthesis is permitted.")
    return wav_path


def generate_ambient_music(duration_sec: float, out_path: Path):
    """
    Synthesizes an original, warm, gentle ambient pentatonic pad in C major / A minor
    using pure Python math + wave (no external audio assets needed).
    """
    n_samples = int(math.ceil(duration_sec * SAMPLE_RATE))
    # Chord progression (warm sine + soft 2nd harmonic): Am9 -> Fmaj7 -> Cmaj9 -> G6
    chords = [
        [220.00, 261.63, 329.63, 392.00, 493.88],
        [174.61, 220.00, 261.63, 329.63, 392.00],
        [130.81, 196.00, 261.63, 329.63, 293.66],
        [196.00, 246.94, 293.66, 329.63, 440.00],
    ]
    chord_len = 8.0  # seconds per chord
    fade_in = 2.5
    fade_out = 4.0

    # Write in chunks to keep memory small and fast
    chunk_size = 48000
    with wave.open(str(out_path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)

        for start_idx in range(0, n_samples, chunk_size):
            end_idx = min(n_samples, start_idx + chunk_size)
            frames = bytearray()
            for i in range(start_idx, end_idx):
                t = i / SAMPLE_RATE
                c_pos = (t / chord_len) % len(chords)
                c_idx = int(c_pos)
                next_idx = (c_idx + 1) % len(chords)
                frac = c_pos - c_idx
                # Smooth crossfade during last 1.5s of each chord
                blend = 0.0
                if frac > 0.8125:
                    u = (frac - 0.8125) / 0.1875
                    blend = u * u * (3 - 2 * u)

                val_l = 0.0
                val_r = 0.0
                c_a = chords[c_idx]
                c_b = chords[next_idx]
                for k in range(len(c_a)):
                    fa = c_a[k]
                    fb = c_b[k]
                    phase_a = 2.0 * math.pi * fa * t
                    phase_b = 2.0 * math.pi * fb * t
                    # Subtle stereo detune & gentle 2nd harmonic warmth
                    s_a = math.sin(phase_a) + 0.12 * math.sin(2.0 * phase_a)
                    s_b = math.sin(phase_b) + 0.12 * math.sin(2.0 * phase_b)
                    s = (1.0 - blend) * s_a + blend * s_b
                    pan = 0.5 + 0.18 * math.sin(0.25 * t + k * 1.1)
                    val_l += s * (1.0 - pan * 0.4)
                    val_r += s * (0.6 + pan * 0.4)

                # Slow breathing LFO
                lfo = 0.85 + 0.15 * math.sin(2.0 * math.pi * 0.08 * t)
                env = 1.0
                if t < fade_in:
                    env = t / fade_in
                elif t > duration_sec - fade_out:
                    env = max(0.0, (duration_sec - t) / fade_out)

                amp = 0.18 * lfo * env / len(c_a)
                l_int = max(-32767, min(32767, int(val_l * amp * 32767)))
                r_int = max(-32767, min(32767, int(val_r * amp * 32767)))
                frames += struct.pack("<hh", l_int, r_int)
            wf.writeframes(frames)


def main():
    voice = STUDENT_CFG.get("voice", "Daniel")
    rate = int(STUDENT_CFG.get("speechRateWpm", 162))
    print(f"Synthesizing narration with voice='{voice}' @ {rate} WPM...")

    timeline = {
        "fps": SCRIPT["fps"],
        "width": SCRIPT["width"],
        "height": SCRIPT["height"],
        "openingHold": OPENING_HOLD_SEC,
        "closingHold": CLOSING_HOLD_SEC,
        "scenes": [],
    }

    t_cursor = OPENING_HOLD_SEC
    concat_parts = []

    # Leading silence for opening frame
    open_sil = AUDIO_DIR / "_sil_opening.wav"
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SAMPLE_RATE}:cl=stereo", "-t", f"{OPENING_HOLD_SEC:.3f}", str(open_sil)])
    concat_parts.append(open_sil)

    for scene in SCRIPT["scenes"]:
        scene_start = t_cursor
        beats_out = []
        for beat in scene["beats"]:
            wav_path = synthesize_beat(beat["id"], beat["text"], voice, rate)
            dur = wav_duration(wav_path)
            pause = float(beat.get("pauseAfter", 0.6))
            beat_start = t_cursor
            beat_end = t_cursor + dur
            beats_out.append({
                "id": beat["id"],
                "text": beat["text"],
                "start": round(beat_start, 3),
                "speechEnd": round(beat_end, 3),
                "end": round(beat_end + pause, 3),
                "duration": round(dur + pause, 3),
            })
            concat_parts.append(wav_path)
            sil_path = AUDIO_DIR / f"_sil_{beat['id']}.wav"
            run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SAMPLE_RATE}:cl=stereo", "-t", f"{pause:.3f}", str(sil_path)])
            concat_parts.append(sil_path)
            t_cursor = beat_end + pause
            print(f"  {beat['id']}: {dur:.2f}s + {pause:.2f}s pause -> [{beat_start:.2f}s .. {t_cursor:.2f}s]")

        timeline["scenes"].append({
            "id": scene["id"],
            "title": scene["title"],
            "start": round(scene_start, 3),
            "end": round(t_cursor, 3),
            "beats": beats_out,
        })

    # Trailing hold for closing frame
    close_sil = AUDIO_DIR / "_sil_closing.wav"
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SAMPLE_RATE}:cl=stereo", "-t", f"{CLOSING_HOLD_SEC:.3f}", str(close_sil)])
    concat_parts.append(close_sil)
    total_duration = round(t_cursor + CLOSING_HOLD_SEC, 3)
    timeline["totalDuration"] = total_duration

    # Concatenate narration track
    concat_list = AUDIO_DIR / "concat.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for p in concat_parts:
            f.write(f"file '{p}'\n")

    voice_track = BUILD_DIR / "narration_only.wav"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list), "-c:a", "pcm_s16le", str(voice_track)])

    # Generate subtle ambient music bed
    music_track = BUILD_DIR / "ambient_music.wav"
    print(f"Synthesizing {total_duration:.2f}s ambient background music...")
    generate_ambient_music(total_duration, music_track)

    # Mix voice (100%) + ambient music (-24 dB / 0.065 linear)
    final_audio = BUILD_DIR / "final_audio.wav"
    run([
        "ffmpeg", "-y",
        "-i", str(voice_track),
        "-i", str(music_track),
        "-filter_complex", "[1:a]volume=0.12[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.95[out]",
        "-map", "[out]", "-c:a", "pcm_s16le", str(final_audio),
    ])

    timeline_path = CODE_DIR / "timeline.json"
    with open(timeline_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2)

    mins = int(total_duration // 60)
    secs = total_duration % 60
    print(f"\nAudio build complete! Total duration: {total_duration:.2f}s ({mins}:{secs:05.2f})")
    if total_duration > 420:
        raise RuntimeError(f"Duration {total_duration:.2f}s exceeds 7-minute (420s) hard limit!")


if __name__ == "__main__":
    main()
