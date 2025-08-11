import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  destination: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  travelers: {
    type: Number,
    required: true,
    min: 1
  },
  budget: {
    type: String,
    required: true,
    enum: ['budget', 'mid-range', 'luxury']
  },
  interests: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  image: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    required: true
  },
  totalCost: {
    type: String,
    default: ''
  },
  highlights: [{
    type: String
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    activities: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      timeSlot: {
        type: String,
        required: true
      },
      duration: {
        type: String,
        required: true
      },
      cost: {
        type: String,
        required: true
      },
      notes: {
        type: String,
        default: ''
      }
    }]
  }],
  notes: {
    type: String,
    default: ''
  },
  aiGeneratedPlan: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
TripSchema.index({ userId: 1, createdAt: -1 });

// Clear any existing model to avoid OverwriteModelError
if (mongoose.models.Trip) {
  delete mongoose.models.Trip;
}

export default mongoose.model('Trip', TripSchema);
