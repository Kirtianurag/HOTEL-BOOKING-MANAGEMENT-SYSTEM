export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'StayEase Hotel Booking Management API',
    version: '1.0.0',
    description: 'Production-ready REST API for StayEase Hotel Booking Management System. Provides complete room catalog, availability search, concurrency-safe inventory holds, multi-day reservation workflows, staff desk operations, admin metrics, and immutable audit logs.',
    contact: {
      name: 'StayEase Engineering Support'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Authentication', description: 'User registration, login, and profile access' },
    { name: 'Availability & Search', description: 'Date-range availability search and temporary room hold locks' },
    { name: 'Reservations', description: 'Guest booking lifecycle (Hold, Confirm, View, Cancel)' },
    { name: 'Rooms & Catalog', description: 'Room inventory and room type management' },
    { name: 'Staff Operations', description: 'Front desk check-in and check-out workflows' },
    { name: 'Admin & Reports', description: 'Executive analytics, occupancy metrics, and revenue charts' },
    { name: 'Audit Trail', description: 'Immutable log of material business transactions' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new guest account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Rahul Sharma' },
                  email: { type: 'string', example: 'rahul@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  phone: { type: 'string', example: '+91 98765 43210' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Registration successful, returns user object and JWT token' },
          400: { description: 'Validation error or email already in use' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@stayease.demo' },
                  password: { type: 'string', example: 'Admin@123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful, returns JWT token in cookie and payload' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: 'Current user profile details' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/availability/search': {
      get: {
        tags: ['Availability & Search'],
        summary: 'Search available rooms by date range and guest capacity',
        parameters: [
          { name: 'checkIn', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2026-11-10' } },
          { name: 'checkOut', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2026-11-12' } },
          { name: 'guests', in: 'query', schema: { type: 'integer', example: 2 } },
          { name: 'roomType', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of available physical rooms with calculated nightly prices' },
          400: { description: 'Invalid date format or checkOut earlier than checkIn' }
        }
      }
    },
    '/availability/hold': {
      post: {
        tags: ['Availability & Search'],
        summary: 'Place a temporary concurrency hold on a room for checkout',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomId', 'checkIn', 'checkOut'],
                properties: {
                  roomId: { type: 'string', example: '65f1234567890abcdef12345' },
                  checkIn: { type: 'string', example: '2026-11-10' },
                  checkOut: { type: 'string', example: '2026-11-12' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Hold acquired successfully (valid for 10 minutes)' },
          409: { description: 'Room already locked or booked for the selected dates' }
        }
      }
    },
    '/reservations': {
      post: {
        tags: ['Reservations'],
        summary: 'Create a pending reservation (initiates temporary lock)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomId', 'checkIn', 'checkOut', 'guestDetails'],
                properties: {
                  roomId: { type: 'string' },
                  checkIn: { type: 'string', example: '2026-11-10' },
                  checkOut: { type: 'string', example: '2026-11-12' },
                  guestDetails: {
                    type: 'object',
                    properties: {
                      fullName: { type: 'string', example: 'Rahul Sharma' },
                      email: { type: 'string', example: 'rahul@example.com' },
                      phone: { type: 'string', example: '+91 98765 43210' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Reservation created in HOLD state' },
          409: { description: 'Room conflict or overlapping booking' }
        }
      }
    },
    '/reservations/{id}/confirm': {
      post: {
        tags: ['Reservations'],
        summary: 'Confirm reservation and process simulated payment',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  paymentMethod: { type: 'string', example: 'upi' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Reservation confirmed with booking reference BK-XXXX' },
          400: { description: 'Invalid reservation transition or expired hold' }
        }
      }
    },
    '/reservations/my-bookings': {
      get: {
        tags: ['Reservations'],
        summary: 'Get all reservations of the logged-in guest',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Array of reservations with pricing and status' }
        }
      }
    },
    '/reservations/{id}/cancel': {
      post: {
        tags: ['Reservations'],
        summary: 'Cancel a reservation and release room inventory locks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Reservation cancelled, inventory returned to available pool' },
          403: { description: 'Not authorized to cancel this booking' }
        }
      }
    },
    '/rooms': {
      get: {
        tags: ['Rooms & Catalog'],
        summary: 'Get catalog of rooms with optional filters',
        responses: {
          200: { description: 'List of rooms' }
        }
      },
      post: {
        tags: ['Rooms & Catalog'],
        summary: 'Create a new physical room (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomNumber', 'roomType'],
                properties: {
                  roomNumber: { type: 'string', example: '101' },
                  roomType: { type: 'string', example: 'Deluxe Suite' },
                  status: { type: 'string', enum: ['available', 'occupied', 'maintenance'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Room created' }
        }
      }
    },
    '/room-types': {
      get: {
        tags: ['Rooms & Catalog'],
        summary: 'Get all room types with base rates and amenities',
        responses: {
          200: { description: 'List of room types' }
        }
      }
    },
    '/staff/reservations': {
      get: {
        tags: ['Staff Operations'],
        summary: 'Fetch guest reservations for front desk check-in/out (Staff & Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Front desk reservation list' }
        }
      }
    },
    '/staff/check-in/{id}': {
      patch: {
        tags: ['Staff Operations'],
        summary: 'Check in a guest upon arrival',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Guest checked in successfully' }
        }
      }
    },
    '/staff/check-out/{id}': {
      patch: {
        tags: ['Staff Operations'],
        summary: 'Check out a guest upon departure and free room',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Guest checked out successfully' }
        }
      }
    },
    '/reports/occupancy': {
      get: {
        tags: ['Admin & Reports'],
        summary: 'Get occupancy rates and statistics (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Occupancy statistics' }
        }
      }
    },
    '/reports/revenue': {
      get: {
        tags: ['Admin & Reports'],
        summary: 'Get revenue totals and time-series metrics for selected date range',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: { description: 'Revenue metrics' }
        }
      }
    },
    '/audit': {
      get: {
        tags: ['Audit Trail'],
        summary: 'Retrieve immutable system audit logs (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Paginated audit logs of all actions' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token in Authorization header as Bearer <token>'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'HttpOnly authentication cookie'
      }
    }
  }
};

