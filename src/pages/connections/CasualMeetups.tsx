/* Casual Meetups page - facilitating relaxed social gatherings and connections
 * Content based on community meetup best practices and local South African social culture
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowLeft, MapPin, Clock, Users, MessageCircle, Sun } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const CasualMeetups: React.FC = () => {
  const meetupSpots = [
    {
      name: "Savannah Café",
      location: "Polokwane CBD",
      type: "Coffee Shop",
      icon: "☕",
      description: "Cozy atmosphere perfect for small group meetups"
    },
    {
      name: "Mall of the North Food Court",
      location: "Polokwane",
      type: "Shopping Center",
      icon: "🍽️",
      description: "Convenient central location with diverse dining options"
    },
    {
      name: "Tzaneen Brew",
      location: "Tzaneen",
      type: "Coffee & Craft Beer",
      icon: "🍺",
      description: "Relaxed venue with indoor and outdoor seating"
    },
    {
      name: "Park by the Mall",
      location: "Various Locations",
      type: "Outdoor Spaces",
      icon: "🌳",
      description: "Public parks ideal for casual outdoor gatherings"
    }
  ];

  const upcomingMeetups = [
    {
      title: "Sunday Morning Coffee",
      time: "This Sunday, 10:00 AM",
      location: "Polokwane",
      attendees: 8,
      maxAttendees: 12,
      description: "Relaxed morning coffee chat for professionals and students"
    },
    {
      title: "Weekday Lunch Meetup",
      time: "Wednesday, 12:30 PM",
      location: "Tzaneen",
      attendees: 6,
      maxAttendees: 10,
      description: "Midday break to meet new people over lunch"
    },
    {
      title: "Evening Tea & Chat",
      time: "Friday, 5:00 PM",
      location: "Mokopane",
      attendees: 5,
      maxAttendees: 8,
      description: "Unwind after work with friendly conversation"
    }
  ];

  const meetupTypes = [
    {
      title: "Coffee Chats",
      description: "Morning or afternoon coffee meetups for casual conversation",
      icon: "☕",
      frequency: "2-3 times per week"
    },
    {
      title: "Lunch Groups",
      description: "Midday meals with friendly faces in your area",
      icon: "🍴",
      frequency: "Weekly"
    },
    {
      title: "Evening Socials",
      description: "After-work gatherings at local spots",
      icon: "🌆",
      frequency: "Weekends & Fridays"
    },
    {
      title: "Weekend Brunches",
      description: "Leisurely weekend brunches and casual hangouts",
      icon: "🥞",
      frequency: "Saturdays & Sundays"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Casual Meetups - Limpopo Connect"
        description="Join relaxed social gatherings and casual meetups across Limpopo. Meet new people over coffee, lunch, or evening socials in a comfortable, low-pressure environment."
        keywords="casual meetups, coffee meetups limpopo, social gatherings, meet new people, polokwane meetups, tzaneen social events"
        canonicalUrl="https://limpopoconnect.site/connections/casual-meetups"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Connections', path: '/connections' },
          { label: 'Casual Meetups' }
        ]} />

        {/* Back Link */}
        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-8">
            <Coffee className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Casual Meetups
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Join relaxed social gatherings and meet new people in comfortable, low-pressure settings across Limpopo Province.
          </p>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Whether it's a coffee chat, lunch meetup, or evening social, connect with friendly faces in your community. 
            No commitments, just genuine conversations and new friendships.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-amber-600 mb-2">320+</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-blue mb-2">45</div>
            <div className="text-sm text-gray-600">Monthly Meetups</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-green mb-2">12</div>
            <div className="text-sm text-gray-600">Popular Venues</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-gold mb-2">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* Upcoming Meetups */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Upcoming Meetups</h2>
          <p className="text-gray-600 mb-8">Join these casual gatherings happening soon in your area</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingMeetups.map((meetup, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{meetup.title}</h3>
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-600" />
                    {meetup.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-limpopo-green" />
                    {meetup.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-limpopo-blue" />
                    {meetup.attendees}/{meetup.maxAttendees} attending
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{meetup.description}</p>
                <button className="btn-primary w-full text-sm">Join Meetup</button>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Meetup Spots */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Meetup Spots</h2>
          <p className="text-gray-600 mb-8">
            Welcoming venues across Limpopo where our community gathers
            {/* Source: Common public gathering spots in Limpopo's main towns - representative examples */}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {meetupSpots.map((spot, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{spot.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{spot.name}</h3>
                <p className="text-sm text-limpopo-blue mb-2">{spot.type}</p>
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  {spot.location}
                </div>
                <p className="text-sm text-gray-600">{spot.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Meetup Types */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of Casual Meetups</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {meetupTypes.map((type, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{type.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                <p className="text-xs text-limpopo-blue font-medium">{type.frequency}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Casual Meetups Work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Browse & Join</h3>
              <p className="text-sm text-gray-600">
                Find meetups that fit your schedule and location. Join with a single click - no applications required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Show Up & Connect</h3>
              <p className="text-sm text-gray-600">
                Arrive at the venue and look for the group. Our hosts create a welcoming environment for everyone.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enjoy & Repeat</h3>
              <p className="text-sm text-gray-600">
                Have great conversations, make new friends, and come back for more meetups whenever you like.
              </p>
            </div>
          </div>
        </section>

        {/* Tips for First-Time Attendees */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">First Time? Here Are Some Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Sun className="h-5 w-5 mr-2 text-amber-600" />
                Before the Meetup
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• RSVP so the host knows to expect you</li>
                <li>• Check the venue location and parking options</li>
                <li>• Arrive on time - or let the host know if you'll be late</li>
                <li>• Come with an open mind and friendly attitude</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-limpopo-green" />
                During the Meetup
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Introduce yourself to others in the group</li>
                <li>• Ask open-ended questions to start conversations</li>
                <li>• Be respectful of everyone's time and opinions</li>
                <li>• Exchange contact info if you'd like to stay in touch</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Your First Meetup?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start making connections today in a relaxed, welcoming environment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-amber-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition duration-300">
              Get Started
            </Link>
            <Link to="/events" className="bg-limpopo-blue hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-300">
              View All Events
            </Link>
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore More Connection Options</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/connections/friendship-partners" className="text-limpopo-blue hover:underline">
              Friendship Partners
            </Link>
            <Link to="/connections/shared-interests" className="text-limpopo-blue hover:underline">
              Shared Interests
            </Link>
            <Link to="/connections/community-stories" className="text-limpopo-blue hover:underline">
              Community Stories
            </Link>
            <Link to="/connections" className="text-limpopo-blue hover:underline">
              All Connections
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CasualMeetups;