<!-- Created/Improved by Charley Raluswinga — https://charleyraluswinga.space -->
// Privacy Policy content researched from South African POPIA compliance requirements
// Sources: POPIA Act guidelines, SA legal frameworks for community platforms
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from 'lucide-react';

const Privacy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy - Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for Limpopo Connect community platform. Learn how we protect your personal information in compliance with South African POPIA regulations.');
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

    addMetaTag('og:title', 'Privacy Policy - Limpopo Connect');
    addMetaTag('og:description', 'Privacy Policy for Limpopo Connect community platform. Learn how we protect your personal information.');
    addMetaTag('og:url', 'https://limpopoconnect.site/privacy');
    addMetaTag('twitter:title', 'Privacy Policy - Limpopo Connect');
    addMetaTag('twitter:description', 'Privacy Policy for Limpopo Connect community platform. Learn how we protect your personal information.');
  }, []);

  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: [
        "Personal information you provide when registering (name, email, location within Limpopo)",
        "Profile information for connections and community features",
        "Communication data when you contact us or interact with other users",
        "Usage analytics to improve our platform (anonymized where possible)"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "Facilitate connections between community members in Limpopo Province",
        "Provide personalized local business and event recommendations",
        "Ensure platform safety and prevent abuse or fraud",
        "Improve our services based on user feedback and usage patterns",
        "Send important updates about your account and platform changes"
      ]
    },
    {
      icon: Lock,
      title: "Data Protection & Security",
      content: [
        "All personal data is encrypted and stored securely in compliance with POPIA",
        "We never sell your personal information to third parties",
        "Access to your data is limited to authorized personnel only",
        "Regular security audits and updates to protect your information",
        "You can request data deletion at any time by contacting us"
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights Under POPIA",
      content: [
        "Right to access your personal information we hold",
        "Right to correct or update inaccurate information",
        "Right to delete your account and associated data",
        "Right to object to processing for direct marketing",
        "Right to lodge complaints with the Information Regulator"
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
            <li className="text-gray-700">Privacy Policy</li>
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
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy matters to us. Learn how Limpopo Connect protects your personal information 
            and respects your rights under South African law.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: October 10, 2025
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Limpopo Connect ("we," "our," or "us") is committed to protecting your privacy and ensuring 
            compliance with the Protection of Personal Information Act (POPIA) of South Africa. This 
            Privacy Policy explains how we collect, use, protect, and share information about you when 
            you use our community platform.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using Limpopo Connect, you agree to the collection and use of information in accordance 
            with this policy. We encourage you to read this policy carefully and contact us if you have any questions.
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-limpopo-blue/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-limpopo-blue" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-limpopo-green mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-limpopo-green to-limpopo-blue rounded-2xl p-8 text-white mt-12">
          <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
          <p className="text-lg opacity-90 mb-6">
            If you have any questions about this Privacy Policy or how we handle your personal information, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="mailto:privacy@limpopoconnect.co.za" 
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition duration-300"
            >
              Email Privacy Team
            </a>
            <Link 
              to="/contact" 
              className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-xl transition duration-300"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="bg-gray-100 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Compliance</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            This privacy policy is designed to comply with the Protection of Personal Information Act (POPIA) 
            No. 4 of 2013 and other applicable South African data protection laws. For more information about 
            your rights under POPIA, visit the <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-limpopo-blue hover:underline">Information Regulator website</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;