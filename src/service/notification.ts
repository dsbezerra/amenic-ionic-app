import { Injectable, ViewChild } from '@angular/core';
import { Nav, Events } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { DataService } from '../service/data';

// Android topics
const ANDROID_TOPICS = [
    'general', // Will be used to send general notifications
    'premieres', // Will be used to send premiere notifications
];

const PREMIERE: string = 'premiere';
const TYPES = [
    PREMIERE,
]

@Injectable()
export class NotificationService {

    constructor(
        public push: Push,
        public localNotifications: LocalNotifications
    ) { }

    public init() {
        // Initialize push notifications only if we have permission
        this.push.hasPermission()
            .then((res: any) => {
                if (res.isEnabled) {
                    this.setup();
                } else {
                    console.log('We do not have permission to send push notifications');
                }
            })

        this.onMessage = this.onMessage.bind(this);
        this.onRegister = this.onRegister.bind(this);
        this.onError = this.onError.bind(this);
    }

    private setup() {
        const options: PushOptions = {
            android: {
                senderID: '502874192730',
                topics: ANDROID_TOPICS,
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'false'
            },
            windows: {},
            browser: {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            }
        };

        // Register handlers
        const pushObject: PushObject = this.push.init(options);
        pushObject.on('notification').subscribe(this.onMessage)
        pushObject.on('registration').subscribe(this.onRegister)
        pushObject.on('error').subscribe(this.onError)
    }

    private onMessage(notification: any) {
        console.log('Received notification', notification)
        const { title, message } = notification;
        const { foreground, type } = notification.additionalData;
        if (foreground) {
            // TODO
        } else {
            // TODO
        }

    }

    private onRegister(registration: any) {
        console.log('Device registered', registration)
    }

    private onError(error) {
        console.error('Error with Push plugin', error)
    }
}