
``` 

yarn install

yarn global add cordova

cordova platform add browser
cordova platform add ios
cordova platform add android

cordova run browser -- --lr
cordova run ios
cordova run android

```

### 开发环境
```
cordova run browser --deploy=dev -- --lr
cordova run ios --deploy=dev
cordova run android --deploy=dev
```
### api调试(ip更换为需要联调的ip)
```
cordova run browser --deploy=dev --api=192.168.20.191:8889 -- --lr
cordova run ios --deploy=dev --api=192.168.20.191:8889 -- --lr
cordova run android --deploy=dev --api=192.168.20.191:8889 -- --lr
```
### staging环境
```
cordova run browser --deploy=staging -- --lr
cordova run ios --deploy=staging
cordova run android --deploy=staging
```
### prod环境
```
cordova run browser --deploy=prod -- --lr
cordova run ios --deploy=prod
cordova run android --deploy=prod
```
### 跳板机开发
```
cordova run browser --deploy=jump -- --lr
```
### 部署命令
```
cordova build browser --deploy=dev
cordova build browser --deploy=staging
cordova build browser --deploy=prod
```

- android 需要安装jdk1.8.0以上版本及Android Studio, Android Studio打开文件为 platform/android/build.gradle



#### 一些本地快捷命令
```
alias dm_prepare="cd ~/projects/datamap_app; cordova prepare --deploy=dev -- chcp-dev"
alias dm_prepare_staging="cd ~/projects/datamap_app; cordova prepare --deploy=staging -- chcp-staging"
alias dm_prepare_prod="cd ~/projects/datamap_app; cordova prepare --deploy=prod -- chcp-prod"
alias dm_and_prepare="cd ~/projects/datamap_app; cordova prepare android --deploy=dev -- chcp-dev"
alias dm_and_prepare_staging="cd ~/projects/datamap_app; cordova prepare android --deploy=staging -- chcp-staging"
alias dm_and_prepare_prod="cd ~/projects/datamap_app; cordova prepare android --deploy=prod -- chcp-prod"
alias dm_ios_prepare="cd ~/projects/datamap_app; cordova prepare ios --deploy=dev -- chcp-dev"
alias dm_ios_prepare_staging="cd ~/projects/datamap_app; cordova prepare ios --deploy=staging -- chcp-staging"
alias dm_ios_prepare_prod="cd ~/projects/datamap_app; cordova prepare ios --deploy=prod -- chcp-prod"
alias dm_run="cd ~/projects/datamap_app; cordova run browser --deploy=dev -- chcp-dev"
alias dm_run_staging="cd ~/projects/datamap_app; cordova run browser --deploy=staging -- chcp-staging"
alias dm_run_prod="cd ~/projects/datamap_app; cordova run browser --deploy=prod -- chcp-prod"
alias dm_ios_run="cd ~/projects/datamap_app; cordova run ios --deploy=dev -- chcp-dev"
alias dm_ios_run_staging="cd ~/projects/datamap_app; cordova run ios --deploy=staging -- chcp-staging"
alias dm_ios_run_prod="cd ~/projects/datamap_app; cordova run ios --deploy=prod -- chcp-prod"
alias dm_and_run="cd ~/projects/datamap_app; cordova run android --deploy=dev -- chcp-dev"
alias dm_and_run_staging="cd ~/projects/datamap_app; cordova run android --deploy=staging -- chcp-staging"
alias dm_and_run_prod="cd ~/projects/datamap_app; cordova run android --deploy=prod -- chcp-prod"
alias dm_and_build="cd ~/projects/datamap_app; cordova build android --deploy=dev --release -- chcp-dev"
alias dm_and_build_staging="cd ~/projects/datamap_app; cordova build android --deploy=staging --release -- chcp-staging"
alias dm_and_build_prod="cd ~/projects/datamap_app; cordova build android --deploy=prod --release -- chcp-prod"
```