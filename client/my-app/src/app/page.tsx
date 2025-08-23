"use client";
import React, { useState } from 'react'; // Import React and useState hook for managing component stat

interface ModalProps { // Define the props for the Modal component
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // Children to be rendered inside the modal
}
const alr_id = "Your mom"; // Example alert ID, replace with actual data
const severityStyles = {
  Critical: {
    color: '#FF0000',
    border: '1px solid #FF0000',
    borderRadius: '4px',
    background: '#FFEBEB',
  },
  High: {
    color: '#FFCC00',
    border: '1px solid #FFCC00',
    borderRadius: '4px',
    background: '#FFFAE5',
  },
  Medium: {
    color: '#007BFF',
    border: '1px solid #007BFF',
    borderRadius: '5px',
    background: '#E6F0FF',
  },
  Low: {
    color: '#28A745',
    border: '1px solid #28A745',
    borderRadius: '5px',
    background: '#E6FAEE',
  },
};

const statusStyles = {
  Active: {
    color: '#FF0000',
    border: '1px solid #FF0000',
    borderRadius: '5px',
    background: '#FFEBEB',
  },
  Resolved: {
    color: '#28A745',
    border: '1px solid #28A745',
    borderRadius: '5px',
    background: '#E6FAEE',
  },
  Dismissed: {
    color: '#888',
    border: '1px solid #888',
    borderRadius: '5px',
    background: '#F2F2F2',
  },
};
const Severity = "High"; // Example severity, replace with actual data
const Status = "Active"; // Example status, replace with actual data
const TimeStamp = "2023-10-01 12:00:00"; // Example time, replace with actual data
const Location = "Main Entrance Camera"; // Example location, replace with actual data
const Camera = "Main Entrance"; // Example camera, replace with actual data

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => { // Modal component to display content in a popup
  // If the modal is not open, return null to render nothing
  if (!isOpen) return null;
  return (
    <div style={{  // Styles for the modal overlay
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 10,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', //Wowza
      zIndex: 1000
    }}>
      <div style={{ // Styles for the modal content
        background: '#fff',
        width: '50%',
        maxWidth: '1200px',
        height: '90vh',
        padding: 24,
        borderRadius: 8,
        minWidth: 300,
        position: 'relative',
        fontSize: '18px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#333',
        overflow: 'hidden',
        paddingBottom: '45px' // Ensure enough space for the close button
      }}>

        <button // Button to close the modal
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 18,
            width: 22,
            height: 22,
            color: '#fff',
            background: '#a7a7a7ff',
            borderRadius: '50%',
            fontSize: 15,
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          aria-label="Close" // Accessibility label for screen readers
        >
          ×
        </button>
        <button // Button to close the modal
          onClick={onClose}
          style={{
            position: 'absolute',
            paddingBottom: '5px',
            top: 630,
            right: 18,
            width: 60,
            height: 25,
            color: '#000000ff',
            background: 'transparent',
            border: '1.5px solid #ccc',
            borderRadius: '4px',
            fontSize: 15,
            alignItems: 'center',
            cursor: 'pointer'
          }}
          aria-label="Close" // Accessibility label for screen readers
        >
          Close
        </button>
        {children}
      </div>
    </div>

  );
};

const CameraDetail: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
  const [activeTab, setActiveTab] = useState('Event Timeline');

  const tabs = ['Event Timeline', 'Related Alerts', 'Notes & Comments'];

  return (
    <div>
      <h2 style={{ fontFamily: 'poppins, sans-serif' }}>Camera Detail</h2>

      <button style={{ // Styles for the button to open the modal
        padding: '10px 20px',
        margin: '20px auto',
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        color: '#fff',
        border: '2px solid #0070f3',
        borderRadius: '40px',
        cursor: 'pointer',
        gap: '10px',
      }}

        onClick={() => setModalOpen(true)}>
        {/* <img
          src="/Detail.png"
          alt="DetailCamera"
          style={{ width: '25px', height: '25px' }}
        /> */}
        👁 View
      </button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontWeight: '600',
            color: '#0070f3',
            marginBottom: '5px',
            // marginLeft: '20px',
          }}>
            Alert Details: {alr_id}
          </h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ position: 'relative', width: '250px', height: '210px' }}>
              <img
                src="/via.png"
                alt="VII"
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              <button
                style={{
                  position: 'absolute',
                  height: '30px',
                  bottom: '10px',
                  right: '10px',
                  padding: '0px 16px',
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Gett good')}>
                👁 View
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                color: '#0077FF',
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 15,
                marginLeft: 15

              }}>
                Alert Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr ', rowGap: 18, columnGap: 2, marginLeft: 15 }}>
                <div style={{ color: '#bbb', fontSize: 13 }}>Event Type</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'left', gap: 6, marginLeft: 5, marginTop: 10 }}>
                <img
                  src="Access.png"
                  alt="Access Icon"
                  style={{ width: 25, height: 20, marginTop: -5 }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#000', marginTop: -5 }}>Unauthorized Access</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', rowGap: 10, columnGap: 2, marginLeft: 15, marginTop: 10, marginBottom: 15 }}>
                <div style={{ color: '#bbb', fontSize: 13 }}>Severity</div>
                <div style={{ color: '#bbb', fontSize: 13 }}>Status</div>
                <div style={{ fontSize: 11, fontWeight: 500, width: '60%', display: 'inline-block', padding: '1px 1px', textAlign: 'center', ...severityStyles[Severity] }}>{Severity}</div>
                <div style={{ fontSize: 11, fontWeight: 500, width: '60%', display: 'inline-block', padding: '1px 1px', textAlign: 'center', ...statusStyles[Status] }}>{Status}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr ', rowGap: 13, columnGap: 2, marginLeft: 15, marginTop: 5 }}>
                <div style={{ color: '#bbb', fontSize: 13 }}>Timestamp</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'left', gap: 6, marginLeft: 5, marginTop: 5 }}>
                <img
                  src="Time.png"
                  alt="O'Clock"
                  style={{ width: 20, height: 20, marginLeft: 7 }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>{TimeStamp}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.37fr', marginTop: 5, rowGap: 15, columnGap: 1 }}>
            <div style={{ color: '#bbb', fontSize: 13 }}>Installation Date</div>
            <div style={{ color: '#bbb', fontSize: 13 }}>Last Maintenance</div>
            <div style={{ display: 'flex', alignItems: 'left', gap: 6, marginLeft: -5, marginTop: 5 }}>
              <img
                src="Cam.png"
                alt="O'Clock"
                style={{ width: 25, height: 19, marginTop: -8 }}
              />
              <span style={{ fontWeight: 600, fontSize: 13, marginTop: '-10px' }}>{Location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'left', gap: 6, marginLeft: -5, marginTop: 5 }}>
              <img
                src="Location.png"
                alt="O'Clock"
                style={{ width: 25, height: 19, marginTop: -8 }}
              />
              <span style={{ fontWeight: 600, fontSize: 13, marginTop: '-10px' }}>{Camera}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr ', rowGap: 5, columnGap: 2, marginTop: 15 }}>
            <div style={{ color: '#0077FF', fontSize: 16, fontWeight: 600 }}>Alert Description</div>
            <div style={{ fontSize: 13, color: '#bbb' }}>Unauthorized individual attempting to access restricted area</div>
          </div>

          <div style={{ marginTop: 15, borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', gap: '0' }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 10px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab ? '1px solid #0077FF' : '2px solid transparent',
                    color: activeTab === tab ? '#0077FF' : '#8C8686',
                    fontWeight: activeTab === tab ? '600' : '400',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
            {activeTab === 'Event Timeline' && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>

              </div>
            )}

            {activeTab === 'Related Alerts' && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>

              </div>
            )}

            {activeTab === 'Notes & Comments' && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>

              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CameraDetail; 