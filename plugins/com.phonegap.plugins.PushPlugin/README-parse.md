# Cordova Push Notifications Plugin for iOS using Parse
This plugin is based on the *phonegap-build/PushPlugin* code. It is using the Parse.com Installations service to manage devices, you may send push notifications using the parse push service and receive pushes using the PhoneGap Push Plugin.
 

## Manual Installation for iOS and Parse

* **Sign up** for an account at https://parse.com/
* Create a new app, go to the Data Browser. In the left column click "New Class" and instead of custom, select "Installation".  *(The Installation class is a special class that stores push notification subscriptions for each device running your app)*.
* **Download & unzip the SDK:** Make sure you are using the latest version of Xcode (4.6+) and targeting iOS 5.0 or higher. Download link: https://parse.com/downloads/ios/parse-library/latest
* **Add the SDK to your app:** Drag the Parse.framework folder you downloaded into your Xcode project folder target.
Make sure the "Copy items to destination's group folder" checkbox is checked.
* **Add the dependencies:**
Click on Targets → Your app name → and then the 'Build Phases' tab. Expand 'Link Binary With Libraries' as shown. Click the + button in the bottom left of the 'Link Binary With Libraries' section and add the following libraries:

``` 
- AudioToolbox.framework
- CFNetwork.framework
- CoreGraphics.framework
- CoreLocation.framework
- libz.dylib
- MobileCoreServices.framework
- QuartzCore.framework
- Security.framework
- StoreKit.framework
- SystemConfiguration.framework 
```


* Copy the following files from **/src/ios_parse** to your project's Plugins folder:

```
AppDelegate+notification.h
AppDelegate+notification.m
PushPlugin.h
PushPlugin.m
```

* Open the file **AppDelegate+notification.m** and insert your application ID and client key.

```objectivec
[Parse setApplicationId:@"YOUR_APP_ID" clientKey:@"YOUR_CLIEND_KEY"];
```

* Add a reference for this plugin to the plugins section in **config.xml**:

```xml
<feature name="PushPlugin">
  <param name="ios-package" value="PushPlugin" />
</feature>
```

* Add the **PushNotification.js** script to your assets/www folder (or javascripts folder, wherever you want really) and reference it in your main index.html file.

```html
<script type="text/javascript" charset="utf-8" src="PushNotification.js"></script>
```
* Follow the Parse *iOS Push Notifications* tutorial to create your certificates and provisioning profiles: 
https://parse.com/tutorials/ios-push-notifications (Skip step 5. *Adding Code for a Push Enabled iOS Application*).
