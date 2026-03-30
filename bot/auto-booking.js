const puppeteer = require('puppeteer');
const config = require('../config/config');

class AutoBookingBot {
  constructor(userInfo) {
    this.browser = null;
    this.userInfo = userInfo;
    this.bookingResult = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox']
    });
    console.log('Auto-booking bot initialized');
  }

  async fillUserInfo(page) {
    try {
      // Fill in user information
      await page.type('input[name="firstName"]', this.userInfo.firstName);
      await page.type('input[name="lastName"]', this.userInfo.lastName);
      await page.type('input[name="email"]', this.userInfo.email);
      await page.type('input[name="phone"]', this.userInfo.phone);
      
      console.log('User information filled');
      return true;
    } catch (error) {
      console.error('Error filling user info:', error);
      return false;
    }
  }

  async bookAppointment(appointmentUrl) {
    try {
      const page = await this.browser.newPage();
      await page.goto(appointmentUrl, { waitUntil: 'networkidle2' });

      // Fill user information
      const filled = await this.fillUserInfo(page);
      if (!filled) throw new Error('Failed to fill user information');

      // Submit booking
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      this.bookingResult = { success: true, message: 'Appointment booked successfully' };
      console.log('Appointment booked successfully!');
      return this.bookingResult;
    } catch (error) {
      this.bookingResult = { success: false, error: error.message };
      console.error('Booking failed:', error);
      return this.bookingResult;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Auto-booking bot closed');
    }
  }
}

module.exports = AutoBookingBot;