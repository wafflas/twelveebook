export interface SoundPad {
  id: string;
  audioUrl: string;
}

export interface Soundboard {
  pads: SoundPad[];
}
