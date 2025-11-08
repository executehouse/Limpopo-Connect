import React from 'react';
import { ContactForm } from '../components/ContactForm';
import { Mail, Phone } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600">
              We'd love to hear from you. Whether you have a question about our platform, a suggestion, or just want to say hello, please reach out.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start space-x-4">
                <div className="bg-limpopo-green/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-limpopo-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Email</h3>
                  <p className="text-gray-600">
                    For general inquiries, please email us.
                  </p>
                  <a href="mailto:info@limpopoconnect.site" className="text-limpopo-blue hover:underline">
                    info@limpopoconnect.site
                  </a>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-start space-x-4">
                <div className="bg-limpopo-blue/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-limpopo-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Phone</h3>
                  <p className="text-gray-600">
                    You can also reach us by phone during business hours.
                  </p>
                  <a href="tel:+27152902000" className="text-limpopo-blue hover:underline">
                    +27 (15) 290 2000
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
