wx.cloud.init({
  env: 'mol-3gpukkfsaab8e2e7'
});

const db = wx.cloud.database();
const contactsCollection = db.collection('contacts');

Page({
  data: {
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ#",  // Alphabet, including # symbol
    contact: [],  // Used to store the original contact name
    filteredContacts: [],  // Used to store filtered contacts
    loc: "",
    screenHeight: 0,
    searchTerm: ""  // Store the content in the search box
  },

  // Retrieve contact names from cloud databases
  loadContactsFromDatabase() {
    let self = this;
    contactsCollection.field({
      name: true,  // Only retrieve the name field
      _id: true    // Need to pass the contact ID for redirection
    }).get({
      success: res => {
        let contacts = res.data;  // Obtained contact array
        self.arrangeContact(contacts);  // Call the contact grouping method
      },
      fail: err => {
        console.error('Failed to retrieve contacts from database：', err);
      }
    });
  },

  // Organize the contact list, categorize Chinese names into #, and group English names according to their first letters
  arrangeContact(contacts) {
    var self = this;
    var contact = [];

    // Traverse the alphabet and group contacts
    for (var i = 0; i < self.data.letters.length; i++) {
      var letter = self.data.letters[i];
      var group = [];

      // Traverse contacts and group them according to rules
      for (var j = 0; j < contacts.length; j++) {
        let contactItem = contacts[j];
        let contactName = contactItem.name;

        // If it is in Chinese, classify it as#
        let contactLetter = /^[\u4e00-\u9fa5]+$/.test(contactName[0]) 
          ? "#"  // If it is in Chinese, classify it as#
          : contactName[0].toUpperCase();  // Take the first letter of the English name directly

        // If the first letter matches the current letter, join the group
        if (contactLetter === letter) {
          group.push(contactItem);  // Only save contact name
        }
      }

      // Add group to contact list
      contact.push({
        letter: letter,
        group: group
      });
    }

    self.setData({
      contact: contact,
      filteredContacts: contact
    });
  },

  // Monitor search box input events and filter contacts in real-time
  onSearchInput: function (e) {
    const searchTerm = e.detail.value.toLowerCase();  // Retrieve the value from the search box
    this.setData({
      searchTerm: searchTerm
    });

    // Call the filtering method
    this.filterContacts();
  },

  // Filter contacts based on search box content
  filterContacts: function () {
    const self = this;
    const searchTerm = self.data.searchTerm;

    if (!searchTerm) {
      // If the search box is empty, display all contacts
      self.setData({
        filteredContacts: self.data.contact
      });
      return;
    }

    // Filter contacts
    const filteredContacts = self.data.contact.map(group => {
      const filteredGroup = group.group.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm)
      );
      return {
        letter: group.letter,
        group: filteredGroup
      };
    }).filter(group => group.group.length > 0);  // Filter out groups without matching contacts

    // Update the display content of the page
    self.setData({
      filteredContacts: filteredContacts
    });
  },

  onLoad: function () {
    this.loadContactsFromDatabase();  // Load contact name data
    var screenHeight = wx.getSystemInfoSync().screenHeight;
    this.setData({
      screenHeight: screenHeight * 2,
    });
  },

  onTapScroll: function (e) {
    var loc = e.currentTarget.dataset.loc;  // Get the clicked letter
    this.setData({
      loc: loc  // Set this letter as the target for scroll in to view
    });
  },

  onAddContact() {
    wx.navigateTo({
      url: '/pages/addContact/addContact'  // Jump to the page for adding contacts
    });
  }
});
