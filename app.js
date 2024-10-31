//app.js
App({
  onLaunch: function () {
    // Show local storage capacity
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // Log In
    wx.login({
      success: res => {
        // Send res.code to the backend to exchange for openId, sessionKey, unionId
      }
    })
    // Obtain user information
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // Authorized, can directly call getUserInfo to obtain avatar nickname without pop-up box
          wx.getUserInfo({
            success: res => {
              // You can send res to the backend to decode the unionId
              this.globalData.userInfo = res.userInfo

              // Due to the fact that getUserInfo is a network request, it may not return until after Page.onLoad
              // So add callback here to prevent this situation
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})