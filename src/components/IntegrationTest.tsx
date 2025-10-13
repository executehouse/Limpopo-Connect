// Integration test to verify components work together
import { ContactForm } from '@/components/ContactForm';
import { MapView } from '@/components/MapView';

// Simple integration test component
export function IntegrationTest() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-900">
        Limpopo Connect Integrations Test
      </h1>
      
      {/* Contact Form Integration */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Contact Form (Formspree + Supabase Fallback)
        </h2>
        <ContactForm 
          onSuccess={(result) => {
            console.log('Contact form success:', result);
            alert('Message sent successfully!');
          }}
          onError={(error) => {
            console.error('Contact form error:', error);
            alert('Error: ' + error.message);
          }}
        />
      </section>

      {/* Map Integration */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Interactive Map (Mapbox + OSM Fallback)
        </h2>
        <MapView
          lat={-23.9}
          lng={29.45}
          title="Polokwane, Limpopo"
          height="400px"
          showDirections={true}
          interactive={true}
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Static Map Fallback
        </h2>
        <MapView
          lat={-24.7}
          lng={28.3}
          title="Mokopane, Limpopo"
          height="300px"
          showDirections={true}
          interactive={false}
        />
      </section>
    </div>
  );
}

export default IntegrationTest;