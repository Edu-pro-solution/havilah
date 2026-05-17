// // Import the selenium-webdriver module
// const { Builder } = require("selenium-webdriver");

// // Define a function to create a WebDriver instance and open a browser
// async function openBrowser() {
//   // Create a new instance of the WebDriver
//   const driver = await new Builder().forBrowser("chrome").build();

//   try {
//     // Open a browser window
//     await driver.get("https://hlhs.edupro.com.ng/dashboard/admin");

//     // Sleep for a few seconds to see the browser window
//     await driver.sleep(5000);
//   } finally {
//     // Close the browser window and quit the WebDriver
//     await driver.quit();
//   }
// }

// // Call the function to open the browser
// openBrowser();

// const { Builder } = require("selenium-webdriver");
// const fs = require("fs");

// async function captureDashboardPage() {
//   const driver = await new Builder().forBrowser("chrome").build();
//   try {
//     // Navigate to the dashboard page
//     await driver.get("https://hlhs.edupro.com.ng/dashboard/admin");

//     // Wait for the dashboard page to fully load
//     await driver.sleep(5000);

//     // Capture the HTML content of the dashboard page
//     const dashboardHtml = await driver.getPageSource();

//     // Save the HTML content to a local file
//     fs.writeFileSync("dashboard.html", dashboardHtml);

//     console.log("Dashboard page captured and saved as dashboard.html");
//   } finally {
//     await driver.quit();
//   }
// }

// captureDashboardPage();

// const { Builder } = require("selenium-webdriver");
// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");

// async function captureDashboardPage() {
//   const driver = await new Builder().forBrowser("chrome").build();
//   try {
//     // Navigate to the dashboard page
//     await driver.get("https://hlhs.edupro.com.ng/dashboard/admin");

//     // Wait for the dashboard page to fully load
//     await driver.sleep(5000);

//     // Capture the HTML content of the dashboard page
//     const dashboardHtml = await driver.getPageSource();

//     // Save the HTML content to a local file
//     fs.writeFileSync("dashboard.html", dashboardHtml);

//     // Extract CSS URLs from the HTML content
//     const cssUrls = dashboardHtml
//       .match(/href="([^"]+\.css)"/g)
//       .map((match) => match.slice(6, -1));

//     // Download CSS files and save them locally
//     for (const cssUrl of cssUrls) {
//       const cssFileName = path.basename(cssUrl);
//       const cssResponse = await axios.get(cssUrl, {
//         responseType: "arraybuffer",
//       });
//       fs.writeFileSync(cssFileName, Buffer.from(cssResponse.data));
//       console.log(`Downloaded ${cssFileName}`);
//     }

//     console.log(
//       "Dashboard page captured with styling and saved as dashboard.html"
//     );
//   } finally {
//     await driver.quit();
//   }
// }

// captureDashboardPage();

// const { Builder } = require("selenium-webdriver");
// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");

// async function captureDashboardPage() {
//   const driver = await new Builder().forBrowser("chrome").build();
//   try {
//     // Navigate to the dashboard page
//     await driver.get("https://hlhs.edupro.com.ng/dashboard/admin");

//     // Wait for the dashboard page to fully load
//     await driver.sleep(5000);

//     // Capture the HTML content of the dashboard page
//     const dashboardHtml = await driver.getPageSource();

//     // Save the HTML content to a local file
//     fs.writeFileSync("dashboard.html", dashboardHtml);

//     // Extract CSS URLs from the HTML content
//     const cssUrls = dashboardHtml
//       .match(/href="([^"]+\.css)"/g)
//       .map((match) => match.slice(6, -1));

//     // Download CSS files and save them locally
//     for (const cssUrl of cssUrls) {
//       try {
//         const cssFileName = path.basename(cssUrl);
//         const cssResponse = await axios.get(cssUrl, {
//           responseType: "arraybuffer",
//         });
//         fs.writeFileSync(cssFileName, Buffer.from(cssResponse.data));
//         console.log(`Downloaded ${cssFileName}`);
//       } catch (error) {
//         console.error(`Failed to download CSS file: ${cssUrl}`);
//         console.error(error.message);
//       }
//     }

//     console.log(
//       "Dashboard page captured with styling and saved as dashboard.html"
//     );
//   } finally {
//     await driver.quit();
//   }
// }

// captureDashboardPage();

// const { Builder, By, until } = require("selenium-webdriver");
// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");

// async function captureDashboardPage() {
//   const driver = await new Builder().forBrowser("chrome").build();
//   try {
//     // Navigate to the login page
//     await driver.get("https://osmosapp.com/auth/sign-in");

//     // Wait for the login page to fully load
//     // await driver.wait(
//     //   until.elementLocated(By.xpath("//input[@id='username']")),
//     //   10000
//     // );
//     // Wait for the login page to fully load and the username input field to be visible
//     await driver.wait(
//       until.elementIsVisible(
//         driver.findElement(By.xpath("//input[@id='olaniyihoppee@gmail.com']"))
//       ),
//       10000
//     );
//     await driver.wait(until.elementLocated(By.xpath("//input[@id='email']")), 10000);

//     // Perform login (replace 'username' and 'password' with actual credentials)
//     await driver
//       .findElement(By.id("email"))
//       .sendKeys("olaniyihoppee@gmail.com");
//     await driver.findElement(By.id("password")).sendKeys("Take100%");
//     await driver.findElement(By.id("submit3")).click();
//     // // Perform login (replace 'username' and 'password' with actual credentials)
//     // await driver.findElement(By.id("username")).sendKeys("your_username");
//     // await driver.findElement(By.id("password")).sendKeys("your_password");
//     // await driver.findElement(By.id("submit3")).click();

//     // Wait for the dashboard page to load after login
//     await driver.wait(async () => {
//       const currentUrl = await driver.getCurrentUrl();
//       return currentUrl === "https://osmosapp.com/dash/home";
//     }, 10000);

//     // Capture the HTML content of the dashboard page
//     const dashboardHtml = await driver.getPageSource();

//     // Save the HTML content to a local file
//     fs.writeFileSync("dashboard.html", dashboardHtml);

//     // Extract CSS URLs from the HTML content
//     const cssUrls = dashboardHtml
//       .match(/href="([^"]+\.css)"/g)
//       .map((match) => match.slice(6, -1));

//     // Download CSS files and save them locally
//     for (const cssUrl of cssUrls) {
//       try {
//         const cssFileName = path.basename(cssUrl);
//         const cssResponse = await axios.get(cssUrl, {
//           responseType: "arraybuffer",
//         });
//         fs.writeFileSync(cssFileName, Buffer.from(cssResponse.data));
//         console.log(`Downloaded ${cssFileName}`);
//       } catch (error) {
//         console.error(`Failed to download CSS file: ${cssUrl}`);
//         console.error(error.message);
//       }
//     }

//     console.log(
//       "Dashboard page captured with styling and saved as dashboard.html"
//     );
//   } finally {
//     await driver.quit();
//   }
// }

// // captureDashboardPage();const { Builder, By, until } = require("selenium-webdriver");
// const { Builder, By, Key, until } = require("selenium-webdriver");

// async function login() {
//   const driver = await new Builder().forBrowser("chrome").build();
//   try {
//     await driver.get("https://osmosapp.com/auth/sign-in");

//     // Wait for the email input field to be located
//     const emailInput = await driver.wait(
//       until.elementLocated(By.css("input[id='email']")),
//       30000
//     );

//     // Enter your email
//     await emailInput.sendKeys("olaniyihoppee@gmail.com", Key.RETURN);

//     // Wait for the password input field to be located
//     const passwordInput = await driver.wait(
//       until.elementLocated(By.id("password")),
//       10000
//     );

//     // Enter your password
//     await passwordInput.sendKeys("Take100%", Key.RETURN);

//     // Wait for the dashboard page to load
//     await driver.wait(until.urlIs("https://osmosapp.com/dash/home"), 10000);

//     console.log("Login successful!");
//   } catch (error) {
//     console.error("Login failed:", error);
//   } finally {
//     await driver.quit();
//   }
// }

// login();

// const puppeteer = require("puppeteer");

// async function login() {
//   const browser = await puppeteer.launch({ headless: false }); // Launch a browser instance
//   const page = await browser.newPage(); // Open a new page

//   try {
//     await page.goto("https://osmosapp.com/auth/sign-in"); // Navigate to the login page

//     // Wait for the email input field to be visible and then type your email
//     await page.waitForSelector('input[id="email"]', { timeout: 60000 });
//     await page.type('input[id="email"]', "olaniyihoppee@gmail.com");

//     // Wait for the password input field to be visible and then type your password
//     await page.waitForSelector('input[id="password"]', { timeout: 60000 });
//     await page.type('input[id="password"]', "Take100%");

//     // Click the login button
//     await page.click('button[type="submit"]');

//     // Wait for navigation to the dashboard page
//     // await page.waitForNavigation({ waitUntil: "networkidle2" });

//     await page.waitForNavigation({ timeout: 60000, waitUntil: "networkidle2" });

//     await page.waitForSelector("your_login_success_element_selector", {
//       timeout: 60000,
//     });

//     // Wait for the dashboard page to load after login
//     await page.waitForFunction(() =>
//       window.location.href.includes("https://osmosapp.com/dash/home")
//     );

//     console.log("Login successful! Dashboard page loaded.");
//   } catch (error) {
//     console.error("Login failed:", error);
//   } finally {
//     await browser.close(); // Close the browser
//   }
// }

// login();

const { chromium } = require("playwright");

async function loginAndCopyPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the login page
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        await page.goto("https://osmosapp.com/auth/sign-in", {
          timeout: 60000,
        });
        break; // If successful, break out of the loop
      } catch (error) {
        console.error("Error during navigation:", error);
        retries++;
      }
    }

    while (retries < maxRetries) {
      try {
        await page.fill('input[id="email"]', "olaniyihoppee@gmail.com");
        break; // If successful, break out of the loop
      } catch (error) {
        console.error("Error during filling email input:", error);
        retries++;
      }
    }

    await page.fill('input[id="password"]', "Take100%");
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForNavigation();

    // Navigate to the dashboard page
    await page.goto("https://osmosapp.com/dash/home");

    // Wait for the dashboard content to load
    await page.waitForSelector("your_dashboard_element_selector");

    // Save the page content or take a screenshot
    // Example: await page.screenshot({ path: 'dashboard.png' });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

loginAndCopyPages();
