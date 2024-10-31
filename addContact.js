// Initialize Cloud Development
wx.cloud.init({
  env: 'mol-3gpukkfsaab8e2e7'  // Your cloud development environment ID
});

const db = wx.cloud.database();  // Get cloud database instance
const contactsCollection = db.collection('contacts');  // Point to the 'contacts' collection

Page({
  data: {
    avatarUrl: '', // URL for storing avatars
    name: '',
    birthday: '',
    phone: '',
    email: '',
    address: ''
  },
  
  chooseAvatar() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // Selection successful, obtain image path
        const tempFilePath = res.tempFilePaths[0];
        that.setData({
          avatarUrl: tempFilePath // Set avatar path
        });
      },
      fail(err) {
        console.error("Failed to select avatar：", err);
      }
    });
  },
     
  // Input box event handling
  onNameInput(e) {
    this.setData({
      name: e.detail.value
    });
  },

  onBirthdayInput(e) {
    this.setData({
      birthday: e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },

  onAddressInput(e) {
    this.setData({
      address: e.detail.value
    });
  },

  // Save Contacts
  saveContact() {
    const { avatarUrl, name, birthday, phone, email, address } = this.data;

    // Check if the name and phone number are filled in
    if (!name || !phone) {
      wx.showToast({
        title: 'Please fill in the necessary contact information',
        icon: 'none'
      });
      return;
    }

    // Upload avatar to cloud storage
    const fileExtension = avatarUrl.split('.').pop(); // Get file extension
    const cloudPath = `avatars/${name}-${Date.now()}.${fileExtension}`; // Generate cloud storage path

    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: avatarUrl,
      success: res => {
        // Obtain the cloud storage file ID of the uploaded avatar
        const cloudFileID = res.fileID;

        // Save contact information to cloud database
        contactsCollection.add({
          data: {
            name,
            birthday,
            phone,
            email,
            address,
            avatarUrl: cloudFileID // Save cloud storage file ID
          },
          success: res => {
            wx.showToast({
              title: 'Contact Saved',
            });

            // After successful saving, jump to a new index page
            wx.redirectTo({
              url: '/pages/index/index',  // Jump to a new index page
            });
          },
          fail: err => {
            console.error('Save Failed', err);
            wx.showToast({
              title: 'Save Failed',
              icon: 'none'
            });
          }
        });
      },
      fail: err => {
        console.error('Upload Avatar Failed', err);
        wx.showToast({
          title: 'Upload Avatar Failed',
          icon: 'none'
        });
      }
    });
  }
});
