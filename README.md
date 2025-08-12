# 🌍 GlobeTrotter

**GlobeTrotter** is a comprehensive travel planning and community platform built with Next.js 15. It combines AI-powered itinerary generation, real-time trip management, and a vibrant travel community to help users plan, share, and discover amazing travel experiences.

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)

**Demo Video Link**: https://drive.google.com/file/d/1o4OzuvVNy5OrMIcahUU6BsvqL5rQFrPX/view?usp=sharing

## ✨ Features

### 🤖 AI-Powered Trip Planning
- **Smart Itinerary Generation**: AI creates personalized day-wise itineraries using Google Gemini
- **Customizable Plans**: Drag-and-drop interface to rearrange activities
- **Budget Planning**: Intelligent budget allocation and tracking
- **Activity Recommendations**: AI suggests activities based on preferences and location

### 🗓️ Trip Management
- **Calendar View**: Visualize all trips in an interactive calendar
- **Trip Details**: Comprehensive trip information with Google Places API images
- **Status Tracking**: Track trips as upcoming, ongoing, or completed
- **Duration & Budget Management**: Flexible trip planning tools

### 🏙️ Destination Discovery
- **City Information**: Detailed city pages with attractions and local insights
- **Image Integration**: Beautiful destination imagery from Google Places API
- **Search Functionality**: Advanced search for destinations and activities

### 👥 Community Features
- **User Profiles**: Customizable profiles with avatar selection
- **Trip Sharing**: Share travel experiences with the community
- **Social Interaction**: Connect with fellow travelers

### 🔐 Authentication & Security
- **Secure Registration**: Email verification with OTP
- **Password Recovery**: Forgot password functionality
- **JWT Authentication**: Secure token-based authentication
- **Profile Management**: Complete user profile customization

### 📱 User Experience
- **Responsive Design**: Mobile-first responsive interface
- **Modern UI**: Clean, intuitive design with Tailwind CSS
- **Loading States**: Smooth user experience with proper loading indicators
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations
- **Chart.js & React-ChartJS-2** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email services

### AI & External APIs
- **Google Gemini AI** - AI-powered itinerary generation
- **Google Places API** - Location data and images
- **googleapis** - Google services integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google Cloud Platform account (for Gemini AI and Places API)
- Email service (for OTP verification)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShreyMehta09/globetrotter.git
   cd globetrotter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   
   # Google APIs
   GOOGLE_API_KEY=your_google_api_key
   GEMINI_API_KEY=your_gemini_api_key
   
   # Email Configuration
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   
   # Next.js
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
globetrotter/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── trips/                # Trip management APIs
│   │   ├── places-image/         # Google Places API integration
│   │   └── community/            # Community features
│   ├── calendar/                 # Calendar view page
│   ├── city/                     # City information pages
│   ├── community/                # Community features
│   ├── login/                    # Authentication pages
│   ├── my-trips/                 # User trips management
│   ├── plan-trip/                # AI trip planning
│   ├── profile/                  # User profile pages
│   ├── trip-details/             # Detailed trip views
│   └── verify-otp/               # Email verification
├── components/                   # Reusable React components
├── lib/                         # Utility functions and configurations
├── models/                      # MongoDB schemas
├── public/                      # Static assets
└── Indian-Tourism-API/          # Tourism data integration
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/forgot-password` - Password recovery

### Trips
- `GET /api/trips` - Get user trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/[id]` - Get trip details
- `PUT /api/trips/[id]` - Update trip
- `DELETE /api/trips/[id]` - Delete trip

### External APIs
- `GET /api/places-image` - Fetch Google Places images
- `GET /api/cities` - Get city information
- `POST /api/calendar/generate-itinerary` - AI itinerary generation

## 🌟 Key Features Walkthrough

### 1. AI Trip Planning
The heart of GlobeTrotter is its AI-powered trip planning system:

```typescript
// AI generates comprehensive itineraries
const generateItinerary = async (destination, preferences, budget) => {
  const response = await fetch('/api/calendar/generate-itinerary', {
    method: 'POST',
    body: JSON.stringify({
      destination,
      preferences,
      budget,
      duration
    })
  });
  return response.json();
};
```

### 2. Google Places Integration
Beautiful destination imagery enhances the user experience:

```typescript
// Fetch destination images
const fetchDestinationImage = async (destination, state) => {
  const searchQuery = `${destination} ${state} tourism India`;
  const response = await fetch(`/api/places-image?place=${encodeURIComponent(searchQuery)}`);
  return response.json();
};
```

### 3. Real-time Trip Management
Users can manage their trips with a modern, responsive interface:
- Calendar view with trip visualization
- Drag-and-drop itinerary customization
- Status tracking and updates
- Budget monitoring

## 🎨 UI Components

GlobeTrotter features a modern, responsive design with:
- **Custom avatars** with selection modal
- **Interactive calendars** for trip visualization
- **Image galleries** for destinations
- **Loading states** and error handling
- **Mobile-responsive** design
- **Dark/Light theme** support

## 📊 Database Schema

### User Model
- Profile information and preferences
- Authentication credentials
- Trip history and favorites

### Trip Model
- Destination and itinerary details
- Budget and duration tracking
- Status and progress monitoring
- User associations

### Community Model
- Posts and interactions
- User connections
- Shared experiences

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password hashing** using bcryptjs
- **Input validation** and sanitization
- **Rate limiting** on API endpoints
- **Email verification** for account security
- **Secure password recovery** process

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment.

### Recommended Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS**
- **Digital Ocean**

## 🤝 Contributing

We welcome contributions to GlobeTrotter! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write comprehensive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent itinerary generation
- **Google Places API** for location data and imagery
- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide React** for beautiful icons

## 📞 Support

For support, email shreymehta09@example.com or join our community discussions.

## 🗺️ Roadmap

- [ ] Mobile app development
- [ ] Advanced AI recommendations
- [ ] Social features expansion
- [ ] Offline functionality
- [ ] Multi-language support
- [ ] Integration with booking platforms

---

**Happy Traveling! 🌍✈️**

Made with ❤️ by [Shrey Mehta](https://github.com/ShreyMehta09)
