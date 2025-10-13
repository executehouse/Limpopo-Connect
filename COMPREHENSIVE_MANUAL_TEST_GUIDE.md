# Comprehensive Manual Test Guide

**Last Updated**: October 13, 2025

This guide provides a structured approach to manually test the key features of the Limpopo Connect platform, ensuring all API integrations and recent fixes are working correctly.

## 1. Deployment Fix Verification

**Objective**: Verify that the DNS has been correctly updated to point to Vercel's recommended IP address.

**Instructions**:

1.  Open a terminal or command prompt.
2.  Run the command: `nslookup limpopoconnect.site`
3.  **Expected Result**: The output should show `Address: 76.76.21.21`.
4.  Visit `https://limpopoconnect.site` (the root domain).
5.  **Expected Result**: The site should load correctly without any redirects, and the SSL certificate should be valid (check for the padlock icon in the browser's address bar).

## 2. API Integration Testing

### 2.1. Hero Image Banner (Unsplash API)

**Objective**: Ensure the hero banner on the homepage dynamically loads an image from Unsplash.

**Instructions**:

1.  Navigate to the **Homepage**.
2.  **Expected Result**: The hero section at the top of the page should display a high-quality photograph related to "limpopo community nature."
3.  Refresh the page several times.
4.  **Expected Result**: A new, different image should load with each hard refresh, demonstrating that the API is fetching new images.
5.  Check the bottom-right corner of the banner.
6.  **Expected Result**: There should be a "Photo by..." attribution link, which is a requirement of the Unsplash API.

### 2.2. Weather Widget (OpenWeatherMap API)

**Objective**: Verify that the weather widget displays current weather information.

**Instructions**:

1.  Navigate to the **Homepage** and scroll down to the "Discover Limpopo" section.
2.  **Expected Result**: A "Weather in..." widget should be visible, displaying the current temperature, weather conditions (e.g., "Clear sky"), and an icon. It should default to Polokwane if location detection fails.
3.  Navigate to the **Visitor Dashboard**.
4.  **Expected Result**: The same weather widget should be present and functional.

### 2.3. News Feed (NewsData.io API)

**Objective**: Confirm that the news feed loads recent articles.

**Instructions**:

1.  Navigate to the **Homepage** and scroll down to the "Discover Limpopo" section.
2.  **Expected Result**: The news feed component should display at least one recent news article with a title, a short description, and a source. If the API fails, it should display mock data.

### 2.4. Holiday Calendar (Nager.Date API)

**Objective**: Ensure the holiday calendar shows upcoming South African public holidays.

**Instructions**:

1.  Navigate to the **Homepage** and find the holiday calendar widget.
2.  **Expected Result**: The component should list upcoming public holidays with their dates and names.

### 2.5. Currency Converter (ExchangeRate.host API)

**Objective**: Test the functionality of the currency converter.

**Instructions**:

1.  Navigate to the **Visitor Dashboard**.
2.  Locate the **Currency Converter** widget.
3.  Enter a value (e.g., `100`) into the ZAR field.
4.  **Expected Result**: The USD, EUR, and GBP fields should update with the converted amounts.
5.  Change the value in the USD field.
6.  **Expected Result**: The other currency fields should update accordingly.

### 2.6. Map View (Google Maps/Mapbox API)

**Objective**: Verify that the map component displays the correct location.

**Instructions**:

1.  Navigate to the **Visitor Dashboard**.
2.  Scroll to the bottom of the page.
3.  **Expected Result**: An embedded map should be visible, centered on Polokwane, Limpopo.

### 2.7. Contact Form (Formspree API)

**Objective**: Test the submission of the contact form.

**Instructions**:

1.  Navigate to the new **Contact** page using the link in the header.
2.  Fill out the form with a valid name, email address, and a test message.
3.  Click the "Send Message" button.
4.  **Expected Result**: A success message should be displayed, confirming that the form was submitted.
5.  Check the email inbox associated with the Formspree account to ensure the message was received.

## 3. General Site Sanity Checks

**Objective**: Perform a quick review of the site to ensure no regressions have been introduced.

**Instructions**:

1.  Click through all the main navigation links in the header:
    *   Home
    *   Business Directory
    *   Events
    *   Tourism
    *   News
    *   Contact
2.  **Expected Result**: All pages should load without any visible errors or layout issues.
3.  On the homepage, check that the "Featured Businesses" and "Upcoming Events" sections are populated with content.
4.  Resize your browser to a mobile width.
5.  **Expected Result**: The site should remain responsive and usable on a smaller screen. The mobile navigation menu should be functional.
