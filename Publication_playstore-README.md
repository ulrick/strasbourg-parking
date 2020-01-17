[Publier son application sur PlayStore](https://ionicframework.com/docs/v1/guide/publishing.html) 

# Procédure pour publier sur PlayStore

1. Modifier ou incrémenter la version dans le fichier config.xml

2. Exécuter les commandes suivantes:

$ ionic cordova build android --release

$ cd C:\Program Files\Java\jdk1.8.0_152\bin

$ keytool -genkey -v -keystore C:\Users\yawo\Desktop\Lab\ShoppingList\shopping-list-release-key.keystore -alias shopping-list-key -keyalg RSA -keysize 2048 -validity 10000



# Procédure pour mettre à jour Strasbourg-parking sur PlayStore

1. Modifier ou incrémenter la version dans le fichier config.xml

2. Exécuter les commandes suivantes:

$ ionic cordova build android --release

$ cd C:\Program Files\Java\jdk1.8.0_152\bin

$ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore C:\Users\yawo\Desktop\Lab\parkinglocation\parking-location-release-key.keystore C:\Users\yawo\Desktop\Lab\parkinglocation\platforms\android\build\outputs\apk\android-release-unsigned.apk parking-location-key

$ cd C:\Users\yawo\AppData\Local\Android\sdk\build-tools\27.0.1
$ zipalign -v 4 C:\Users\yawo\Desktop\Lab\parkinglocation\platforms\android\build\outputs\apk\android-release-unsigned.apk C:\Users\yawo\Desktop\Lab\parkinglocation\parking-location-release-v1.0.[newVersion].apk

go to https://play.google.com/apps/publish/?hl=fr&account=7870916947945793059#AppListPlace


# Help : 

### Pour retrouver l'alias name :
$ cd C:\Program Files\Java\jdk1.8.0_152\bin
$ keytool -keystore C:\Users\yawo\Desktop\Lab\parkinglocation\parking-location-release-key.keystore -list -v
