import { Injectable } from '@angular/core';

interface Options {
  autoPlay?: boolean;

  height: string;
  width: string;
  videoId: string;
  playerVars: any;
  events?: {
    onReady?: (event: any) => void,
    onStateChange: (event: any) => void,
  }
}

@Injectable()
export class YoutubePlayerService {

  /** The player instance */
  private player: any;

  constructor() {
    this.init();
  }

  // Initializes the Iframe API
  public init() {
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  public setup(id: string, opts?: Options) {
    if (this.player) {
      this.player.destroy();
    }

    window['onYouTubeIframeAPIReady'] = () => {
      if (window['YT']) {
        // Sets the default on ready behavior
        if (!opts.events.onReady && opts.autoPlay) {
          opts.events.onReady = () => {
            this.player.playVideo();
          };
        }

        this.player = new window['YT'].Player(id, opts);
      }
    }

    // If is already defined from previous load then just call
    if (window['onYouTubeIframeAPIReady']) {
      window['onYouTubeIframeAPIReady']();
    } 
  }

  public play() {
    if (this.player) {
      this.player.playVideo();
    }
  }

  public stop() {
    if (this.player) {
      this.player.stopVideo();
    }
  }

  public destroy() {
    // Remove iframe_api script node
    var iframe_apiScript = document.getElementsByTagName('script')[0];
    var yt_apiScript = document.getElementsByTagName('script')[1];
    iframe_apiScript.remove();
    yt_apiScript.remove();

    if (this.player) {
      this.player.destroy();
    }
  }

  public getPlayer() {
    return this.player;
  }
}