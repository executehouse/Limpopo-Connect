import { app, HttpResponseInit, InvocationContext } from "@azure/functions";
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { createBusiness } from '../models/business';
import { findCategoryById } from '../models/businessCategory';
import { validateBusinessName, validateCoordinates, validateUrl, validatePhone, sanitizeInput } from '../lib/validation';

// Removed legacy Azure Function handler businessesCreate.
export {};