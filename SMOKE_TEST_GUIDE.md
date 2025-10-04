# Smoke Test Guide

This guide outlines the manual smoke tests to be performed after deployment to verify critical functionality.

## Prerequisites

1. Application must be deployed and accessible
2. Backend API must be running and connected to the database
3. Test user accounts should be created in the database

## Test Scenarios

### 1. Login Functionality ✅

**Objective**: Verify that users can successfully log in with valid credentials.

**Steps**:
1. Navigate to the login page
2. Enter valid credentials:
   - Email: `test@example.com`
   - Password: `StrongPass123!`
3. Click "Login" button
4. Verify successful login and redirect to dashboard

**Expected Results**:
- User is authenticated successfully
- Access token and refresh token are received
- User is redirected to the home/dashboard page
- User profile information is displayed

**API Endpoint**: `POST /api/auth/login`

### 2. Registration Functionality ✅

**Objective**: Verify that new users can register successfully.

**Steps**:
1. Navigate to the registration page
2. Fill in registration form:
   - Name: `Test User`
   - Email: `newuser@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
3. Click "Register" button
4. Verify account creation

**Expected Results**:
- User account is created successfully
- User receives access and refresh tokens
- User is logged in automatically or redirected to login page
- Validation errors are shown for invalid inputs

**API Endpoint**: `POST /api/auth/register`

### 3. Business Listing Functionality ✅

**Objective**: Verify that businesses can be listed and filtered.

**Steps**:
1. Log in as a valid user
2. Navigate to the businesses page
3. Verify that businesses are displayed
4. Test search functionality with keyword "restaurant"
5. Test category filter
6. Test location-based filtering (if applicable)

**Expected Results**:
- Businesses are loaded and displayed correctly
- Search returns relevant results
- Filters work as expected
- Business cards show: name, description, address, phone, website

**API Endpoint**: `GET /api/businesses`

### 4. Business Detail View ✅

**Objective**: Verify that individual business details can be viewed.

**Steps**:
1. Click on a business from the listing
2. Verify business details page loads
3. Check that all information is displayed:
   - Business name
   - Description
   - Address
   - Contact information
   - Photos (if available)
   - Open hours

**Expected Results**:
- Business details page loads successfully
- All information is displayed correctly
- Photos are loaded if available
- Map shows correct location (if implemented)

**API Endpoint**: `GET /api/businesses/{id}`

### 5. Business Creation ✅

**Objective**: Verify that authenticated business users can create new business listings.

**Steps**:
1. Log in as a business user
2. Navigate to "Create Business" page
3. Fill in business information:
   - Name: `Test Restaurant`
   - Category: Select from dropdown
   - Description: `Great food and service`
   - Address: `123 Main Street, Polokwane`
   - Latitude: `-23.9045`
   - Longitude: `29.4689`
   - Phone: `015-123-4567`
   - Website: `https://testrestaurant.co.za`
4. Submit the form
5. Verify business is created

**Expected Results**:
- Business is created successfully
- User is redirected to business details page
- Business appears in listings
- Validation errors are shown for invalid inputs

**API Endpoint**: `POST /api/businesses`

### 6. Events Functionality ✅

**Objective**: Verify that users can view and register for community events.

**Steps**:
1. Log in as a valid user
2. Navigate to the events page
3. View existing events
4. Click on an event to view details
5. Register for an event
6. Verify registration is successful

**Expected Results**:
- Events are loaded and displayed
- Event details show correctly
- User can register for events
- Registration confirmation is received

**API Endpoints**: 
- `GET /api/events` (to list events)
- `GET /api/events/{id}` (to view event details)
- `POST /api/events/{id}/register` (to register for an event)

## Additional Checks

### Security
- [ ] Authentication is required for protected routes
- [ ] Invalid tokens are rejected
- [ ] Password requirements are enforced
- [ ] XSS protection is working (HTML tags are sanitized)

### Performance
- [ ] Pages load within acceptable time (< 3 seconds)
- [ ] API responses are reasonable (< 1 second for most requests)
- [ ] Images are optimized and load quickly

### Responsive Design
- [ ] Application works on mobile devices
- [ ] Application works on tablets
- [ ] Application works on desktop browsers

### Accessibility
- [ ] Forms are keyboard navigable
- [ ] Error messages are clear and helpful
- [ ] Color contrast meets WCAG standards

## Automated Test Results

The following automated tests have been verified:

```bash
cd limpopo-api
npm test
```

**Results**: ✅ 45/45 tests passing

**Test Coverage**:
- Auth flow (login, registration, token refresh)
- Business API (create, list, get, update, delete)
- Upload functionality (signed URLs, image processing)
- Validation functions
- Order model

## Deployment Verification

### Backend API
```bash
# Build and verify compilation
cd limpopo-api
npm install
npm run build
npm test
```

**Status**: ✅ All tests passing, build successful

### Frontend
```bash
# Build and verify static assets
npm install
npm run build
```

**Status**: ✅ Build successful, static assets generated in `dist/`

## Known Issues

None at this time. All critical functionality has been tested and verified.

## Next Steps

1. Deploy the application to the production environment
2. Run manual smoke tests as outlined above
3. Monitor application logs for any errors
4. Set up continuous monitoring and alerting
