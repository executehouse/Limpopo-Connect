<!-- Created/Improved by Charley Raluswinga — https://charleyraluswinga.space -->
// Terms of Service content based on South African consumer protection and platform regulations
// Sources: Consumer Protection Act, Electronic Communications Act, community platform best practices
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle } from 'lucide-react';

const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service - Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms of Service for Limpopo Connect community platform. Understand your rights and responsibilities when using our Limpopo Province community services.');
    }

    // Add Open Graph and Twitter Card meta tags
    const addMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', property);
        }
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };

    addMetaTag('og:title', 'Terms of Service - Limpopo Connect');
    addMetaTag('og:description', 'Terms of Service for Limpopo Connect community platform. Understand your rights and responsibilities.');
    addMetaTag('og:url', 'https://limpopoconnect.site/terms');
    addMetaTag('twitter:title', 'Terms of Service - Limpopo Connect');
    addMetaTag('twitter:description', 'Terms of Service for Limpopo Connect community platform. Understand your rights and responsibilities.');
  }, []);

  const sections = [
    {
      icon: FileText,
      title: "Platform Usage",
      content: [
        "You must be at least 18 years old to create an account on Limpopo Connect",
        "Provide accurate and truthful information when registering and creating your profile",
        "Use the platform respectfully and in accordance with South African laws",
        "Do not create multiple accounts or impersonate others",
        "You are responsible for maintaining the security of your account credentials"
      ]
    },
    {
      icon: Users,
      title: "Community Guidelines",
      content: [
        "Treat all community members with respect and dignity",
        "No harassment, discrimination, or hate speech based on race, gender, religion, or any other characteristic",
        "Do not share illegal, harmful, or inappropriate content",
        "Respect cultural diversity and traditions within the Limpopo community",
        "Report inappropriate behavior or content to our moderation team immediately"
      ]
    },
    {
      icon: Shield,
      title: "Safety & Security",
      content: [
        "Meet new connections in public places and inform friends or family of your plans",
        "Never share personal financial information or send money to other users",
        "Report suspicious activity or users who violate community guidelines",
        "We reserve the right to investigate and take action against rule violations",
        "Maintain your own safety when participating in events or meetups"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: [
        "Commercial spam, unauthorized advertising, or pyramid schemes",
        "Sharing of illegal content, including pirated material or unlawful services",
        "Attempting to hack, exploit, or disrupt the platform's functionality",
        "Using the platform for any illegal activities or to solicit illegal services",
        "Creating fake profiles, businesses, or events"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-limpopo-blue hover:text-limpopo-green">Home</Link></li>
            <li className="text-gray-500">•</li>
            <li className="text-gray-700">Terms of Service</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These terms govern your use of Limpopo Connect and outline the rights and responsibilities 
            of our community members across Limpopo Province.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: October 10, 2025
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Limpopo Connect</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            By accessing or using Limpopo Connect ("the Platform"), you agree to be bound by these Terms 
            of Service ("Terms"). These Terms constitute a legally binding agreement between you and Limpopo 
            Connect under South African law.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our platform is designed to connect communities across Limpopo Province, facilitate local business 
            discovery, and foster meaningful relationships. We are committed to maintaining a safe, inclusive, 
            and respectful environment for all users.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If you do not agree to these Terms, please do not use the Platform. We may update these Terms 
            from time to time, and continued use of the Platform constitutes acceptance of any changes.
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-limpopo-green/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-limpopo-green" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-limpopo-blue mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Additional Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Intellectual Property</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              The Limpopo Connect platform, including its design, functionality, and content, is protected 
              by intellectual property laws. Users retain ownership of their submitted content but grant 
              us a license to display and use it within the platform.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Limitation of Liability</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Limpopo Connect facilitates connections but is not responsible for interactions between users. 
              Users engage with others at their own discretion and assume responsibility for their safety 
              and any agreements made through the platform.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dispute Resolution</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Any disputes arising from use of the platform will be resolved under South African law. 
              We encourage users to first attempt resolution through our support team before pursuing 
              legal action.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Termination</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these Terms. Users may 
              also delete their accounts at any time. Upon termination, access to the platform and 
              associated data will be removed.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-limpopo-blue to-limpopo-green rounded-2xl p-8 text-white mt-12">
          <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
          <p className="text-lg opacity-90 mb-6">
            If you have any questions about these Terms of Service or need clarification on any policies, 
            our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="mailto:legal@limpopoconnect.co.za" 
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition duration-300"
            >
              Contact Legal Team
            </a>
            <Link 
              to="/contact" 
              className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-xl transition duration-300"
            >
              General Support
            </Link>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="bg-gray-100 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Governing Law</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            These Terms of Service are governed by the laws of the Republic of South Africa. Any legal 
            proceedings related to these Terms will be subject to the jurisdiction of South African courts. 
            This platform complies with the Electronic Communications and Transactions Act No. 25 of 2002 
            and the Consumer Protection Act No. 68 of 2008.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;