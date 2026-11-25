import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Wrench, Users } from 'lucide-react';
import api from '../services/api';

export default function ServiceCentres() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/service-centres')
      .then((res) => {
        if (res.data) setCentres(res.data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <h3>Workshop Network & Branch Facilities</h3>
          <p>Multi-location service network across major Indian metropolitan hubs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {centres.map((c) => (
          <div
            key={c._id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              backgroundColor: '#fff',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="badge badge-blue">{c.city}</span>
              <code>{c.code}</code>
            </div>
            <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>{c.name}</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--primary)" />
                <span>{c.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="var(--primary)" />
                <span>{c.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="var(--primary)" />
                <span>{c.email}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service Bays</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{c.capacityBays}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mechanics</div>
                <div style={{ fontSize: '18px', fontWeight: '800' }}>{c.activeMechanics}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
