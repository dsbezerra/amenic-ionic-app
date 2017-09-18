import { Component, ElementRef, Renderer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  NavController,
  NavParams,
} from 'ionic-angular';

import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { IsDebug } from '@ionic-native/is-debug';
import { YoutubePlayerService } from '../../service/ytplayer';

@Component({
  selector: 'page-trailer',
  templateUrl: 'trailer.html',
  providers: [YoutubePlayerService]
})
export class TrailerPage {

  private isToolbarHidden: boolean = true;
  private trailer: string;
  private videoId: string;

  private overlay: any;

  trustedVideoUrl: any;

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private sanitizer: DomSanitizer,
    private screenOrientation: ScreenOrientation,
    private androidFullScreen: AndroidFullScreen,
    private ytPlayerService: YoutubePlayerService,
    public element: ElementRef,
    public renderer: Renderer
  ) {
    this.trailer = this.navParams.get('trailer');
    this.ytPlayerService = ytPlayerService;

    // Get video id
    const index = this.trailer.lastIndexOf('/');
    this.videoId = this.trailer.substring(index + 1);

    // Listeners
    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
  }

  ngOnInit() {
    // this.trustedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.getTrailerVideo());
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.immersiveMode())
      .catch((error: any) => console.log(error));

    // Lock orientation in landscape
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

    // Setup player
    this.ytPlayerService.setup('player', {
      height: '100%',
      width: '100%',
      videoId: this.videoId,
      playerVars: {
        showinfo: 0,
        rel: 0,
        origin: window.location.host,
      },
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange,
      }
    });
  }

  public ionViewWillLeave() {
    // Destroy player
    this.ytPlayerService.destroy();
    // Unlock orientation
    this.screenOrientation.unlock();
    // Restore to default mode
    this.androidFullScreen.showSystemUI()
      .then(() => console.log('[full-screen] restored.'))
      .catch(err => console.log(err));
  }

  private onPlayerReady() {
    this.ytPlayerService.play();
  }

  private onPlayerStateChange(event) {
    const wasHidden = this.isToolbarHidden;
    if (event.data === window['YT'].PlayerState.PAUSED) {
      this.isToolbarHidden = false;
    } else {
      this.isToolbarHidden = true;
    }

    this.toggleToolbar(wasHidden);
  }

  private toggleToolbar(wasHidden: boolean) {
    const toolbar = this.element.nativeElement.getElementsByClassName('toolbar')[0];
    this.renderer.setElementStyle(toolbar, 'opacity', this.isToolbarHidden ? '0' : '1');
    this.renderer.setElementStyle(toolbar, 'transition-delay', wasHidden ? '0s' : '3s');
  }

  public getTrailerVideo(): string {
    if (!this.trailer) return '';
    return (
      `${this.trailer}?rel=0&autoplay=1&showinfo=0`
    );
  }
}
