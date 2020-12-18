npm run prod
cd dist/ng-lister-pwa
7z a ng-lister-pwa *
curl --upload-file "ng-lister-pwa.7z" -u "jfg:sawq2222" ftp://10.0.0.4
