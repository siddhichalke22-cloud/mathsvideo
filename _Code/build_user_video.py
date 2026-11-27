"""
Builds the complete synchronized video using the user's own recorded voice (`maths_voice.opus`),
perfectly aligning each scene and mathematical animation beat with the user's spoken words.
"""

import json
import subprocess
from pathlib import Path
import wave
import math
import struct

CODE_DIR = Path(__file__).resolve().parent
BUILD_DIR = CODE_DIR / "build"
OPENING_HOLD_SEC = 4.5
CLOSING_HOLD_SEC = 2.0
SAMPLE_RATE = 48000

BEAT_SEGMENT_RANGES = {
    # scene1_hook
    "s1_intro": (0, 1),
    "s1_question": (2, 5),
    "s1_bridge": (6, 7),
    # scene2_concept
    "s2_objective": (8, 10),
    "s2_augmented": (11, 13),
    "s2_ops": (14, 18),
    "s2_ref": (19, 21),
    # scene3_intuition
    "s3_2d_setup": (22, 24),
    "s3_2d_swap_scale": (25, 31),
    "s3_2d_replace": (32, 35),
    "s3_2d_why": (36, 38),
    "s3_3d_planes": (39, 42),
    # scene4_example
    "s4_setup": (43, 46),
    "s4_swap": (47, 53),
    "s4_elim1": (54, 61),
    "s4_elim2": (62, 69),
    "s4_scale": (70, 73),
    "s4_backsub": (74, 80),
    "s4_verify": (81, 84),
    # scene5_interpretation
    "s5_unique": (85, 87),
    "s5_cases": (88, 95),
    # scene6_summary
    "s6_takeaways": (96, 101),
    "s6_credits": (102, 103),
}


def run(cmd):
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{res.stderr}")
    return res


def generate_ambient_music(duration_sec: float, out_path: Path):
    n_samples = int(math.ceil(duration_sec * SAMPLE_RATE))
    chords = [
        [220.00, 261.63, 329.63, 392.00, 493.88],
        [174.61, 220.00, 261.63, 329.63, 392.00],
        [130.81, 196.00, 261.63, 329.63, 293.66],
        [196.00, 246.94, 293.66, 329.63, 440.00],
    ]
    chord_len = 8.0
    fade_in = 2.5
    fade_out = 4.0

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
                    s_a = math.sin(phase_a) + 0.12 * math.sin(2.0 * phase_a)
                    s_b = math.sin(phase_b) + 0.12 * math.sin(2.0 * phase_b)
                    s = (1.0 - blend) * s_a + blend * s_b
                    pan = 0.5 + 0.18 * math.sin(0.25 * t + k * 1.1)
                    val_l += s * (1.0 - pan * 0.4)
                    val_r += s * (0.6 + pan * 0.4)

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
    with open(CODE_DIR / "narration_script.json") as f:
        script = json.load(f)

    with open(BUILD_DIR / "user_transcript.json") as f:
        segments = json.load(f)

    # Compute beat timings aligned to user speech
    beats_timing = {}
    for b_id, (s_start, s_end) in BEAT_SEGMENT_RANGES.items():
        t_start = segments[s_start]["start"] + OPENING_HOLD_SEC
        t_speech_end = segments[s_end]["end"] + OPENING_HOLD_SEC
        beats_timing[b_id] = {
            "start": round(t_start, 3),
            "speechEnd": round(t_speech_end, 3),
        }

    # Build timeline.json
    timeline_scenes = []
    for s in script["scenes"]:
        scene_beats = []
        for i, b in enumerate(s["beats"]):
            timing = beats_timing[b["id"]]
            # Determine end: next beat's start or speechEnd + pause
            pause = float(b.get("pauseAfter", 0.6))
            scene_beats.append({
                "id": b["id"],
                "text": b["text"],
                "start": timing["start"],
                "speechEnd": timing["speechEnd"],
                "end": timing["speechEnd"] + pause,
                "duration": round(timing["speechEnd"] - timing["start"] + pause, 3),
            })
        scene_start = scene_beats[0]["start"]
        scene_end = scene_beats[-1]["end"]
        timeline_scenes.append({
            "id": s["id"],
            "title": s["title"],
            "start": scene_start,
            "end": scene_end,
            "beats": scene_beats,
        })

    last_speech_end = segments[-1]["end"] + OPENING_HOLD_SEC
    total_duration = round(last_speech_end + CLOSING_HOLD_SEC, 3)

    timeline = {
        "fps": 15,
        "width": 1920,
        "height": 1080,
        "openingHold": OPENING_HOLD_SEC,
        "closingHold": CLOSING_HOLD_SEC,
        "scenes": timeline_scenes,
        "totalDuration": total_duration,
    }

    with open(CODE_DIR / "timeline.json", "w") as f:
        json.dump(timeline, f, indent=2)
    print(f"✅ timeline.json generated with exact user speech synchronization (total duration: {total_duration:.2f}s)")

    # 1. Prepare narration_only.wav (delayed by 4.5s for opening title, padded to total_duration)
    voice_track = BUILD_DIR / "narration_only.wav"
    print("Preparing narration_only.wav with 4.5s opening delay...")
    run([
        "ffmpeg", "-y",
        "-i", str(BUILD_DIR / "maths_voice.opus"),
        "-af", f"aresample=48000,highpass=f=80,acompressor=threshold=-20dB:ratio=2.2:attack=12:release=140,loudnorm=I=-16:TP=-1.5:LRA=7,adelay=4500|4500,apad=whole_dur={total_duration}",
        "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le",
        str(voice_track),
    ])

    # 2. Generate ambient background music
    music_track = BUILD_DIR / "ambient_music.wav"
    print(f"Generating ambient music bed for {total_duration:.2f}s...")
    generate_ambient_music(total_duration, music_track)

    # 3. Mix voice + music
    final_audio = BUILD_DIR / "final_audio.wav"
    print("Mixing final_audio.wav (voice 100% + ambient bed volume=0.12)...")
    run([
        "ffmpeg", "-y",
        "-i", str(voice_track),
        "-i", str(music_track),
        "-filter_complex", "[1:a]volume=0.12[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.95[out]",
        "-map", "[out]", "-c:a", "pcm_s16le",
        str(final_audio),
    ])
    print("✅ final_audio.wav successfully built and balanced!")


if __name__ == "__main__":
    main()
