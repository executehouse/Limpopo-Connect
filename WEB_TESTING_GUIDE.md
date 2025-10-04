# 🌐 Web-Based Authentication Testing Guide
## Complete Dummy Instructions for Non-Technical Users

This guide provides **step-by-step instructions with screenshots descriptions** for testing the Limpopo Connect authentication system through your web browser. No coding or terminal commands required!

---

## ⚠️ Important Notice

Before you can test via the web interface, a developer must complete the initial setup:
1. Install and configure PostgreSQL database
2. Run database migrations
3. Start the backend servers (auth and business APIs)
4. Start the frontend development server

**If these are not done yet**, share the `AUTHENTICATION_TESTING_GUIDE.md` file with your developer first.

---

## 🚦 Prerequisites Check

Before starting, verify these services are running:

### ✅ Checklist
- [ ] PostgreSQL database is running
- [ ] Auth server is running on port 3001
- [ ] Business server is running on port 3002  
- [ ] Frontend is running on port 5173
- [ ] You have a web browser (Chrome, Firefox, Edge, or Safari)

**How to verify**: Ask your developer or open `http://localhost:5173` in your browser. If you see the Limpopo Connect homepage, you're ready!

---

## 📝 Test Scenario 1: Register as a Citizen

### Step 1: Open the Registration Page
1. Open your web browser
2. Type in the address bar: `http://localhost:5173/register`
3. Press Enter

**What you should see:**
- Page title: "Limpopo Connect"
- Green icon with "MapPin"
- Heading: "Join our community"
- Text: "Create your account to get started"
- Registration form with multiple fields

### Step 2: Select User Role
1. Look for dropdown menu labeled "I am a"
2. Click on the dropdown
3. Select **"Citizen"** from the options
   - Options available: Citizen, Business Owner, Visitor

### Step 3: Fill in Personal Information

**First Name field:**
- Click in the box that says "First name"
- Type: `John`

**Last Name field:**
- Click in the box that says "Last name"
- Type: `Doe`

**Email field:**
- Click in the box with the envelope icon
- Type: `john.doe@example.com`
- ⚠️ Make sure it's a valid email format with @ symbol

**Phone field:**
- Click in the box with the phone icon
- Type: `+27123456789`
- (This field is optional, but recommended)

### Step 4: Set Password

**Password field:**
- Click in the box with the lock icon
- Type: `CitizenPass123!`
- ⚠️ Password must have:
  - At least 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Optional: special characters like ! @ # $

**Confirm Password field:**
- Click in the second password box
- Type the EXACT same password: `CitizenPass123!`
- ⚠️ Must match the first password exactly

**Show/Hide Password:**
- You can click the eye icon (👁) to see your password
- Click again to hide it

### Step 5: Accept Terms

- Find the checkbox next to "I agree to the Terms of Service"
- Click the checkbox to check it ✓
- The checkbox must be checked to proceed

### Step 6: Submit Registration

- Find the blue button at the bottom that says **"Create account"**
- Click the button
- Wait a moment (button will say "Creating account...")

**Expected Result:**
- ✅ You are redirected to the login page (`/login`)
- ✅ You see a green success message: "Registration successful! Please log in."
- ✅ Your email is saved in the database

**If you see an error:**
- Red error box appears with message
- Common errors:
  - "A user with this email already exists" → Use a different email
  - "Passwords do not match" → Re-enter your passwords
  - "Validation failed" → Check all required fields are filled

---

## 📝 Test Scenario 2: Login as a Citizen

### Step 1: Navigate to Login Page

If you're not already on the login page:
1. Open browser
2. Go to: `http://localhost:5173/login`
3. Press Enter

**What you should see:**
- Page title: "Limpopo Connect"
- Heading: "Welcome back"
- Text: "Sign in to your account to continue"
- Email and password input fields

### Step 2: Enter Login Credentials

**Email field:**
- Click in the email box (has envelope icon)
- Type: `john.doe@example.com`
- (Same email you used for registration)

**Password field:**
- Click in the password box (has lock icon)  
- Type: `CitizenPass123!`
- (Same password you used for registration)

**Remember Me (optional):**
- You can check "Remember me" to save your email
- This is optional and doesn't affect login

### Step 3: Sign In

- Click the blue **"Sign in"** button
- Wait a moment (button will say "Signing in...")

**Expected Result:**
- ✅ You are redirected to the homepage (`/`)
- ✅ You are now logged in as John Doe (Citizen)
- ✅ Navigation bar shows your account info

**If login fails:**
- Red error box appears
- Message: "Invalid credentials"
- **Double-check:**
  - Email is correct (no typos)
  - Password is correct (case-sensitive!)
  - Account was successfully created

### Step 4: Verify You're Logged In

**Check in browser:**
1. Press `F12` on your keyboard (opens Developer Tools)
2. Click "Console" tab at the top
3. Type: `localStorage.getItem('token')`
4. Press Enter
5. You should see a long string starting with "eyJ..."
6. This is your authentication token - you're logged in! ✅

**Or simply:**
- Look for your name or profile icon in the navigation bar
- Try accessing pages that require login
- If you can see restricted content, you're logged in!

---

## 📝 Test Scenario 3: Register as a Business Owner

### Step 1: Logout (if logged in)
1. Click your profile icon or "Logout" button
2. Or open a new Incognito/Private browser window

### Step 2: Go to Registration Page
- Navigate to: `http://localhost:5173/register`

### Step 3: Fill Registration Form

**Select Role:**
- In "I am a" dropdown, select **"Business Owner"**

**Personal Details:**
- First Name: `Jane`
- Last Name: `Smith`
- Email: `jane.smith@business.com`
- Phone: `+27987654321`

**Password:**
- Password: `BusinessPass123!`
- Confirm Password: `BusinessPass123!`

**Accept Terms:**
- Check the terms checkbox ✓

**Submit:**
- Click "Create account"

**Expected Result:**
- ✅ Success message on login page
- ✅ Business Owner account created

### Step 4: Login as Business Owner
- Email: `jane.smith@business.com`
- Password: `BusinessPass123!`
- Click "Sign in"

**Expected Result:**
- ✅ Logged in as Jane Smith (Business Owner)
- ✅ You may see additional menu options for managing businesses

---

## 📝 Test Scenario 4: Register as a Visitor

### Step 1: Start Fresh
- Logout or use Incognito window
- Go to: `http://localhost:5173/register`

### Step 2: Create Visitor Account

**Select Role:**
- "I am a" → Select **"Visitor"**

**Personal Details:**
- First Name: `Bob`
- Last Name: `Wilson`
- Email: `bob.wilson@visitor.com`
- Phone: `+27555123456`

**Password:**
- Password: `VisitorPass123!`
- Confirm Password: `VisitorPass123!`

**Terms:**
- Check the agreement ✓

**Submit:**
- Click "Create account"

**Expected Result:**
- ✅ Account created successfully
- ✅ Redirected to login

### Step 3: Login as Visitor
- Email: `bob.wilson@visitor.com`
- Password: `VisitorPass123!`
- Click "Sign in"

**Expected Result:**
- ✅ Logged in as Bob Wilson (Visitor)

---

## 📝 Test Scenario 5: Test Error Handling

### Test 5.1: Duplicate Email Registration
1. Try to register again with `john.doe@example.com`
2. Fill all fields correctly
3. Click "Create account"

**Expected Result:**
- ❌ Error message: "A user with this email already exists."
- Registration is blocked
- You must use a different email

### Test 5.2: Password Mismatch
1. Go to registration page
2. Fill in new email: `test@example.com`
3. Password: `TestPass123!`
4. Confirm Password: `DifferentPass123!` (different!)
5. Click "Create account"

**Expected Result:**
- ❌ Error message: "Passwords do not match."
- Form is not submitted

### Test 5.3: Invalid Login
1. Go to login page
2. Email: `john.doe@example.com`
3. Password: `WrongPassword123!` (incorrect password)
4. Click "Sign in"

**Expected Result:**
- ❌ Error message: "Invalid credentials."
- Login fails
- Remains on login page

### Test 5.4: Empty Fields
1. Go to registration page
2. Leave some required fields empty
3. Try to click "Create account"

**Expected Result:**
- Browser validation prevents submission
- Fields highlight in red
- Message: "Please fill out this field"

---

## ✅ Success Checklist

Mark each item as you complete it:

### Registration Tests
- [ ] Successfully registered as Citizen
- [ ] Successfully registered as Business Owner
- [ ] Successfully registered as Visitor
- [ ] Duplicate email was properly rejected
- [ ] Password mismatch was detected

### Login Tests
- [ ] Successfully logged in as Citizen
- [ ] Successfully logged in as Business Owner
- [ ] Successfully logged in as Visitor
- [ ] Invalid password was rejected
- [ ] JWT token stored in browser

### User Experience
- [ ] Success messages displayed correctly
- [ ] Error messages are clear and helpful
- [ ] Form validation works
- [ ] Password visibility toggle works
- [ ] Remember Me option works (optional)
- [ ] Navigation after login works

---

## 🎨 Visual Checklist (What to Look For)

### ✅ Registration Page Should Have:
- Green Limpopo Connect logo with map pin icon
- "Join our community" heading
- Dropdown for role selection (Citizen/Business Owner/Visitor)
- Two name input boxes side by side (First Name, Last Name)
- Email input with envelope icon
- Phone input with phone icon
- Two password inputs with lock icons
- Eye icons to show/hide passwords
- Terms of Service checkbox
- Blue "Create account" button
- "Already have an account? Sign in here" link at bottom

### ✅ Login Page Should Have:
- "Welcome back" heading
- Email input with envelope icon
- Password input with lock icon
- Eye icon to show/hide password
- "Remember me" checkbox
- "Forgot password?" link
- Blue "Sign in" button
- "Don't have an account? Sign up here" link

### ✅ Success Indicators:
- Green message boxes (success)
- Redirect to different page after action
- Your name appears in navigation bar
- Can access protected pages
- Token exists in localStorage

### ✅ Error Indicators:
- Red message boxes (errors)
- Stay on same page
- Clear error message describing problem
- Form fields highlighted in red

---

## 🔄 Testing Different Browsers

Repeat the tests in different browsers to ensure compatibility:

- [ ] Google Chrome
- [ ] Mozilla Firefox
- [ ] Microsoft Edge
- [ ] Safari (Mac only)

Each browser should behave identically.

---

## 📸 Expected Screenshots

*If you're documenting for someone else, take screenshots at these points:*

1. **Registration page** - Empty form
2. **Registration page** - Filled form (Citizen)
3. **Registration success** - Green success message on login page
4. **Login page** - Empty form
5. **Login page** - Filled with credentials
6. **Homepage** - Logged in state
7. **Developer Console** - Showing token in localStorage
8. **Error state** - Duplicate email error
9. **Error state** - Invalid credentials error
10. **Role selection** - Showing all three role options

---

## 🆘 Common Problems and Solutions

### Problem: Page won't load (localhost:5173)
**Solution:**
- Ask developer to start the frontend server
- Check if you're using the correct URL
- Try refreshing the page (F5)

### Problem: "Network Error" when submitting
**Solution:**
- Auth server (port 3001) might not be running
- Ask developer to check backend servers
- Check browser console (F12) for error details

### Problem: Can't click "Create account" button
**Solution:**
- Check all required fields are filled
- Check the Terms of Service box is checked
- Ensure passwords match
- Try typing in each field again

### Problem: Registration succeeds but can't login
**Solution:**
- Double-check email is exact match (no spaces)
- Password is case-sensitive - check Caps Lock
- Wait a few seconds and try again
- Ask developer to check database

### Problem: Page redirects but nothing changes
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Close and reopen browser
- Try Incognito/Private mode
- Check browser console for JavaScript errors

---

## 📋 Testing Report Template

Use this template to report your testing results:

```
LIMPOPO CONNECT AUTHENTICATION TEST REPORT
Date: ___________
Tester: ___________
Browser: ___________

TEST 1: CITIZEN REGISTRATION
Status: [ ] Pass  [ ] Fail
Notes: _____________________

TEST 2: CITIZEN LOGIN
Status: [ ] Pass  [ ] Fail
Notes: _____________________

TEST 3: BUSINESS OWNER REGISTRATION
Status: [ ] Pass  [ ] Fail
Notes: _____________________

TEST 4: BUSINESS OWNER LOGIN
Status: [ ] Pass  [ ] Fail
Notes: _____________________

TEST 5: VISITOR REGISTRATION
Status: [ ] Pass  [ ] Fail
Notes: _____________________

TEST 6: VISITOR LOGIN
Status: [ ] Pass  [ ] Fail
Notes: _____________________

TEST 7: ERROR HANDLING
Status: [ ] Pass  [ ] Fail
Notes: _____________________

OVERALL RESULT: [ ] All Tests Passed  [ ] Some Tests Failed

ISSUES FOUND:
1. _____________________
2. _____________________
3. _____________________
```

---

## 🎉 Congratulations!

If you've completed all the tests successfully, the authentication system is working perfectly! Users can now:

✅ Register as any role type  
✅ Login with their credentials  
✅ Receive secure authentication tokens  
✅ Access role-based features

The Limpopo Connect authentication is ready for use!

---

## 📞 Need Help?

If you encounter issues:
1. Check the "Common Problems" section above
2. Review the `AUTHENTICATION_TESTING_GUIDE.md` for technical details
3. Contact your developer with:
   - Browser console errors (F12 → Console tab)
   - Steps to reproduce the issue
   - Screenshots of error messages

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**For**: Limpopo Connect Authentication System  
**Tested User Roles**: Citizen, Business Owner, Visitor  
**Status**: ✅ All tests should pass
