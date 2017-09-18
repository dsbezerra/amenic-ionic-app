import { AdMobFreeBannerConfig } from '@ionic-native/admob-free';

// general ad unit id
// hide when pushing to remote repo
const AD_UNIT_ID = 'ca-app-pub-8142728452724363/9849476380';

// Default configuration
export const AD_DEFAULT_CONFIG: AdMobFreeBannerConfig = {
  id: AD_UNIT_ID,
  autoShow: true,
  isTesting: false,
 }
