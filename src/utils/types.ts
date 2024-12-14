export interface LyricData {
    lrcContent: string;
    playbackSpeed: number;
    currentProgress: number;
  }
  
  export interface ParsedLyric {
    time: number;
    text: string;
  }
  
  