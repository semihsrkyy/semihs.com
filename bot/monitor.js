const puppeteer = require('puppeteer');
const config = require('../config/config');

class AppointmentMonitor {
  constructor() {
    this.browser = null;
    this.appointments = [];
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Monitor initialized');
  }

  async checkAppointments(country) {
    try {
      const page = await this.browser.newPage();
      await page.goto(`${config.vfsGlobal.baseUrl}/${country}`);
      
      // Extract appointment availability data
      const appointments = await page.evaluate(() => {
        return document.querySelectorAll('.appointment-slot').length;
      });

      console.log(`Found ${appointments} available slots for ${country}`);
      return { country, available: appointments > 0, count: appointments };
    } catch (error) {
      console.error(`Error checking appointments for ${country}:`, error);
      return { country, available: false, error: error.message };
    }
  }

  async monitorAppointments() {
    for (const country of config.vfsGlobal.countries) {
      const result = await this.checkAppointments(country);
      this.appointments.push(result);
    }
    return this.appointments;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('Monitor closed');
    }
  }
}

module.exports = AppointmentMonitor;