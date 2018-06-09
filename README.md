### [ 项目准备 ]

- 准备
    
    `npm install
    npm install -g cordova
    npm install -g cordova-hot-code-push-cli //需要热更新时安装
    cordova platform add browser
    cordova platform add ios
    cordova platform add android
    cordova run browser -- --lr
    cordova run ios
    cordova run android`

- 开发环境

    `cordova run browser --deploy=dev -- --lr
    cordova run ios --deploy=dev
    cordova run android --deploy=dev`

- api调试(ip更换为需要联调的ip)
    
    `cordova run browser --deploy=dev --api=192.168.20.191:8889 -- --lr
    cordova run ios --deploy=dev --api=192.168.20.191:8889 -- --lr
    cordova run android --deploy=dev --api=192.168.20.191:8889 -- --lr`

- staging环境
    
    `cordova run browser --deploy=staging -- --lr
    cordova run ios --deploy=staging
    cordova run android --deploy=staging`

- prod环境

    `cordova run browser --deploy=prod -- --lr
    cordova run ios --deploy=prod
    cordova run android --deploy=prod`

- 跳板机开发

    `cordova run browser --deploy=jump -- --lr`

- 部署命令
    
    `cordova build browser --deploy=dev -- chcp-dev
    cordova build browser --deploy=staging -- chcp-staging
    cordova build browser --deploy=prod -- chcp-prod`

- 测试
    
    `npm run test  //单次运行
    npm run test:watch //监听`

### [ 远端调试 ]

* [ios web debug](https://github.com/RemoteDebug/remotedebug-ios-webkit-adapter)
    1. 安装依赖 
        * ``` brew install --HEAD libimobiledevice ```
        * ``` brew install --HEAD ios-webkit-debug-proxy ```
        * ``` npm install remotedebug-ios-webkit-adapter -g ```
    2. ios设备开启web inspector, iOS设置=> Safari首选项=>启用“Web Inspector”
    3. 信任设备
    4. remotedebug_ios_webkit_adapter --port=9000
    5. Chrome 
        * 打开 [chrome://inspect](chrome://inspect/#devices)
        * Discover network targets => configure
        * add ["localhost:9000"](localhost:9000)

* [android web debug](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/webviews)


#### [ 注意事项 ]

- android 需要安装jdk1.8.0以上版本及Android Studio, Android Studio打开文件为 platform/android/build.gradle

- ios 安装WKWebView插件后，应用底部会出现空白页，在CDVWKWebViewEngine.m中修改updateSettings函数,在后面添加如下代码[已做处理，下拉代码后不需再次修改]
    ```
    if (@available(iOS 11.0, *)) {
        wkWebView.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    }
    ```
- android打包
    * 需要修改 `-Dorg.gradle.daemon=true` 替换为 `-Dorg.gradle.daemon=false`
    * Cordova.gradle 文件头部import代码后添加`System.setProperty('java.awt.headless','false')`
    
#### [一些本地快捷命令]

`alias dm_prepare="cordova prepare --deploy=dev -- chcp-dev"
alias dm_prepare_staging="cordova prepare --deploy=staging -- chcp-staging"
alias dm_prepare_prod="cordova prepare --deploy=prod -- chcp-prod"
alias dm_and_prepare="cordova prepare android --deploy=dev -- chcp-dev"
alias dm_and_prepare_staging="cordova prepare android --deploy=staging -- chcp-staging"
alias dm_and_prepare_prod="cordova prepare android --deploy=prod -- chcp-prod"
alias dm_ios_prepare="cordova prepare ios --deploy=dev -- chcp-dev"
alias dm_ios_prepare_staging="cordova prepare ios --deploy=staging -- chcp-staging"
alias dm_ios_prepare_prod="cordova prepare ios --deploy=prod -- chcp-prod"
alias dm_run="cordova run browser --deploy=dev -- chcp-dev -- --lr"
alias dm_run_staging="cordova run browser --deploy=staging -- chcp-dev -- --lr"
alias dm_run_prod="cordova run browser --deploy=prod -- chcp-dev -- --lr"
alias dm_ios_run="cordova run ios --deploy=dev -- chcp-dev"
alias dm_ios_run_staging="cordova run ios --deploy=staging -- chcp-staging"
alias dm_ios_run_prod="cordova run ios --deploy=prod -- chcp-prod"
alias dm_and_run="cordova run android --deploy=dev -- chcp-dev"
alias dm_and_run_staging="cordova run android --deploy=staging -- chcp-staging"
alias dm_and_run_prod="cordova run android --deploy=prod -- chcp-prod"
alias dm_and_build="cordova build android --deploy=dev --prod --release -- chcp-dev"
alias dm_and_build_staging="cordova build android --deploy=staging --prod --release -- chcp-staging"
alias dm_and_build_prod="cordova build android --deploy=prod --prod --release -- chcp-prod"`
