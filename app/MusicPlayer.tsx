"use client";

/* eslint-disable @next/next/no-img-element -- Radio artwork is already sized and compressed for Vinext. */

import {
  Pause,
  Play,
  SpeakerHigh,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

const TRACK_LENGTH = 16;

function createSunnyWalkLoop() {
  const sampleRate = 16000;
  const sampleCount = sampleRate * TRACK_LENGTH;
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, sampleCount * 2, true);

  const chords = [
    [261.63, 329.63, 392],
    [349.23, 440, 523.25],
    [392, 493.88, 587.33],
    [220, 261.63, 329.63],
  ];
  const melodies = [
    [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 880, 783.99],
    [659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25, 783.99],
    [783.99, 880, 987.77, 880, 783.99, 659.25, 783.99, 880],
    [659.25, 783.99, 880, 987.77, 880, 783.99, 659.25, 587.33],
  ];
  const arpeggioPattern = [0, 1, 2, 1, 0, 1, 2, 1];

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const section = Math.floor(time / 4) % chords.length;
    const localTime = time % 4;
    const chord = chords[section];
    const noteIndex = Math.floor(localTime / 0.5) % arpeggioPattern.length;
    const noteTime = localTime % 0.5;
    const arpeggioFrequency = chord[arpeggioPattern[noteIndex]];
    const melodyFrequency = melodies[section][noteIndex];
    const pluckEnvelope = Math.exp(-noteTime * 8) * Math.min(1, noteTime * 80);
    const melodyEnvelope = Math.exp(-noteTime * 5) * Math.min(1, noteTime * 60);
    const padEnvelope = 0.75 + Math.sin(Math.PI * 2 * localTime / 4) * 0.08;
    let sample = 0;

    for (const frequency of chord) {
      sample += Math.sin(Math.PI * 2 * frequency * time) * 0.028 * padEnvelope;
      sample += Math.sin(Math.PI * 2 * frequency * 2 * time) * 0.006 * padEnvelope;
    }

    sample += Math.sin(Math.PI * 2 * arpeggioFrequency * time) * pluckEnvelope * 0.13;
    sample += Math.sin(Math.PI * 2 * arpeggioFrequency * 2 * time) * pluckEnvelope * 0.018;
    sample += Math.sin(Math.PI * 2 * melodyFrequency * time) * melodyEnvelope * 0.055;
    const output = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + index * 2, output * 32767, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.38);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = URL.createObjectURL(createSunnyWalkLoop());
    audio.src = url;
    audio.volume = 0.38;
    audio.load();
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />

      <div className="music-player-banner">
        <strong>萝卜狗的晴天散步</strong>
        <small>RADDIE SUNNY WALK</small>
      </div>
      <div className="music-player-transport">
        <img className="music-player-art" src="/assets/home/radio/raddie-ip-avatar.png" width={240} height={240} alt="《萝卜狗的晴天散步》专辑封面" decoding="async" />
        <div className="music-player-controls">
          <input
            className="music-player-progress"
            type="range"
            min="0"
            max={TRACK_LENGTH}
            step="0.1"
            value={Math.min(currentTime, TRACK_LENGTH)}
            onChange={(event) => {
              const nextTime = Number(event.target.value);
              setCurrentTime(nextTime);
              if (audioRef.current) audioRef.current.currentTime = nextTime;
            }}
            aria-label="音乐播放进度"
          />
          <label className="music-player-volume">
            <SpeakerHigh weight="fill" />
            <span className="sr-only">音乐音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(event) => {
                const nextVolume = Number(event.target.value);
                setVolume(nextVolume);
                if (audioRef.current) audioRef.current.volume = nextVolume;
              }}
            />
          </label>
        </div>
        <button
          type="button"
          className="music-player-toggle"
          onClick={togglePlayback}
          aria-label={playing ? "暂停音乐" : "播放音乐"}
        >
          {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
        </button>
      </div>
    </div>
  );
}
