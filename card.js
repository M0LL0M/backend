// Initialize Cloud Development
wx.cloud.init({
  env: 'mol-3gpukkfsaab8e2e7'  // Your cloud development environment ID
});

const db = wx.cloud.database();  // Get cloud database instance
const contactsCollection = db.collection('contacts');  // Point to the 'contacts' collection

Page({
  data: {
    contact: {},  // Used to store contact data obtained from the database
    contactId: "",  // Store the ID of the contact person
    isEditing: false  // Is it in editing mode
  },

  // Lifecycle Function - Monitor Page Loading
  onLoad: function (options) {
    const self = this;

    // Retrieve the passed contact ID from options
    const contactId = options.id;
    self.setData({ contactId: contactId });

    // Retrieve contact information from the database based on the ID
    self.loadContactData(contactId);
  },

  // Encapsulate the function for loading contact information
  loadContactData: function(contactId) {
    const self = this;
    contactsCollection.doc(contactId).get({
      success: function (res) {
        console.log("Data Returned by the Database:", res.data);  // Print the returned data
        self.setData({
          contact: res.data  // Set contact data for the page
        });
      },
      fail: function (err) {
        console.error("Database Read Failed: ", err);
        wx.showToast({
          title: 'Failed to Retrieve Contacts',
          icon: 'none'
        });
      }
    });
  },

  // Enter editing mode
  onEditContact: function () {
    this.setData({
      isEditing: true  // Set to edit mode
    });
  },

  // Process changes in input box content
  onNameInput: function (e) {
    this.setData({
      'contact.name': e.detail.value
    });
  },

  onBirthdayInput: function (e) {
    this.setData({
      'contact.birthday': e.detail.value
    });
  },

  onPhoneInput: function (e) {
    this.setData({
      'contact.phone': e.detail.value
    });
  },

  onEmailInput: function (e) {
    this.setData({
      'contact.email': e.detail.value
    });
  },

  onAddressInput: function (e) {
    this.setData({
      'contact.address': e.detail.value
    });
  },

  // Select avatar
  chooseAvatar: function () {
    const self = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        self.uploadAvatar(tempFilePath);
      },
      fail(err) {
        console.error("Failed to Select Avatar：", err);
      }
    });
  },

  // Upload avatar to cloud storage
  uploadAvatar: function (filePath) {
    const self = this;
    const cloudPath = `avatars/${Date.now()}.png`; // Set cloud storage path
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('Avatar Uploaded Successfully', res.fileID);
        self.updateContactAvatar(res.fileID); // Update contact avatar URL
      },
      fail: err => {
        console.error('Avatar Uploaded Failed', err);
        wx.showToast({
          title: 'Avatar Uploaded Failed',
          icon: 'none'
        });
      }
    });
  },

  // Update the avatar URL in the database
  updateContactAvatar: function (fileID) {
    const self = this;
    contactsCollection.doc(self.data.contactId).update({
      data: {
        avatarUrl: fileID // Update the avatar URL in the database
      },
      success: res => {
        wx.showToast({
          title: 'Avatar has been updated',
          icon: 'success'
        });
        self.setData({
          'contact.avatarUrl': fileID // Update the avatarURL of the local contact
        });
      },
      fail: err => {
        console.error('Failed to Update Avatar', err);
        wx.showToast({
          title: 'Failed to Update Avatar',
          icon: 'none'
        });
      }
    });
  },

  // Save contact modification
  onSaveContact: function () {
    const self = this;
    const updatedContact = self.data.contact;

    // Verify if the input content is empty
    if (!updatedContact.name || !updatedContact.phone) {
      wx.showToast({
        title: 'Please provide complete contact information',
        icon: 'none'
      });
      return;
    }

    // Update contact information to database
    contactsCollection.doc(self.data.contactId).update({
      data: {
        name: updatedContact.name,
        birthday: updatedContact.name,
        phone: updatedContact.phone,
        email: updatedContact.email,
        address: updatedContact.address
      },
      success: function () {
        wx.showToast({
          title: 'Contact Updated',
          icon: 'success'
        });
        self.setData({
          isEditing: false
        });
      },
      fail: function (err) {
        wx.showToast({
          title: 'Update Failed',
          icon: 'none'
        });
        console.error("Failed to Update Contacts: ", err);
      }
    });
  },

  // Delete Contacts
  onDeleteContact: function () {
    const self = this;
    wx.showModal({
      title: 'Delete Confirmation',
      content: 'Are you sure you want to delete this contact?',
      success: function (res) {
        if (res.confirm) {
          // Delete Contacts
          contactsCollection.doc(self.data.contactId).remove({
            success: function () {
              wx.showToast({
                title: 'Contact person has been deleted',
                icon: 'success'
              });
              wx.redirectTo({
                url: '/pages/index/index',  // Jump to the index page
              });
            },
            fail: function (err) {
              wx.showToast({
                title: 'Delete failed',
                icon: 'none'
              });
              console.error("Failed to delete contact: ", err);
            }
          });
        }
      }
    });
  }
});
