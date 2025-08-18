"use client";
import React, { useState } from 'react'; // Import React and useState hook for managing component stat

interface ModalProps { // Define the props for the Modal component
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // Children to be rendered inside the modal
}
const cam_name = "CAM001";
const cam_status = "Active";
const cam_location = "Main Entrance";
const cam_type = "PTZ";
const cam_ip = "192.168.1.101";
const cam_resolution = "1080p";
const install_date = "2025-05-15 at 10:08:19 PM";
const last_maintenance = "2025-05-15 at 10:08:19 PM";

const healthPercentage = "90%"; // Example health percentage for the camera
const Uptime = "99.7%"; // Example uptime percentage
const VideoQuality = "94%"; // Example video quality percentage 
const NetworkLatency = "24 ms"; // Example network latency


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
      justifyContent: 'center',
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
  const [activeTab, setActiveTab] = useState('Health Status');
  const [timeRange, setTimeRange] = useState('7 Day');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sensitiveData, setSensitiveData] = useState('Low');
  const [editTool, setEditTool] = useState(false);

  const tabs = ['Health Status', 'Event Detection', 'Access Control', 'Maintenance'];
  const timeOptions = ['7 Day', '1 Month', '3 Month', '6 Month', '1 Year'];
  const sensitiveOptions = ['Low', 'Medium', 'High'];
  const editTools = ['Edit', 'Delete'];

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
        <img
          src="/Detail.png"
          alt="DetailCamera"
          style={{ width: '25px', height: '25px' }}
        />
        Detail
      </button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontWeight: '600',
            color: '#0070f3',
            marginBottom: '10px',
          }}>
            Camera Details: cam_name
          </h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ position: 'relative', width: '300px', height: '250px' }}>
              <img
                src="Via.png"
                alt="JustJoke"
                style={{ width: '300px', height: '250px', display: 'block'  }}
              />
              <button
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '20px',
                  padding: '6px 16px',
                  background: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                }}
                onClick={() => alert('LOL')}>
                👁 View
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                color: '#0077FF',
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 15,
                marginLeft: 15

              }}>
                Camera Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 18, columnGap: 2, marginLeft: 15 }}>
                <div style={{ color: '#bbb', fontSize: 14 }}>Camera ID</div>
                <div style={{ color: '#bbb', fontSize: 14 }}>Status</div>
                <div style={{ fontWeight: 550, fontSize: 14, marginTop: '-10px' }}>{cam_name}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: '-10px' }}>{cam_status}</div>
                <div style={{ color: '#bbb', fontSize: 14 }}>Location</div>
                <div style={{ color: '#bbb', fontSize: 14 }}>Type</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: '-10px' }}>{cam_location}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: '-10px' }}>{cam_type}</div>
                <div style={{ color: '#bbb', fontSize: 14 }}>IP Address</div>
                <div style={{ color: '#bbb', fontSize: 14 }}>Resolution</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: '-10px' }}>{cam_ip}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: '-10px' }}>{cam_resolution}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.02fr', marginTop: 5, rowGap: 18, columnGap: 1 }}>
            <div style={{ color: '#bbb', fontSize: 14 }}>Installation Date</div>
            <div style={{ color: '#bbb', fontSize: 14 }}>Last Maintenance</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: '-10px' }}>{install_date}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: '-10px' }}>{last_maintenance}</div>
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
          {/* Tab Content */}
          <div style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
            {activeTab === 'Health Status' && (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '5px',
                    color: '#333'
                  }}>
                    Overall Health
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: healthPercentage, // health percentage*****
                      height: '100%',
                      background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                      borderRadius: '4px'
                    }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '5px' }}>
                  {/* Uptime Card */}
                  <div style={{
                    flex: 1,
                    padding: '24px',
                    border: '1.5px solid #4CAF50',
                    borderRadius: '12px',
                    background: '#f9fff9'
                  }}>
                    <div style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>Uptime</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>🛜</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#4CAF50' }}>{Uptime}</div>
                    </div>
                  </div>

                  {/* Video Quality Card */}
                  <div style={{
                    flex: 1,
                    padding: '24px',
                    border: '1.5px solid #2196F3',
                    borderRadius: '12px',
                    background: '#f8fcff'
                  }}>
                    <div style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>Video Quality</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>📹</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#2196F3' }}>{VideoQuality}</div>
                    </div>
                  </div>

                  {/* Network Latency Card */}
                  <div style={{
                    flex: 1,
                    padding: '24px',
                    border: '1.5px solid #FF9800',
                    borderRadius: '12px',
                    background: '#fffaf5'
                  }}>
                    <div style={{ fontSize: '16px', color: '#666', marginBottom: '12px' }}>Network Latency</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '20px' }}>🌐</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#FF9800' }}>{NetworkLatency}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px',
                    marginTop: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#333',
                      margin: 0
                    }}>
                      Health Metrics (Last {timeRange})
                    </h3>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#333'
                        }}
                      >
                        ⋯
                      </button>

                      {dropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '4px',
                          background: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          zIndex: 1000,
                          minWidth: '120px'
                        }}>
                          {timeOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setTimeRange(option);
                                setDropdownOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: timeRange === option ? '#f0f8ff' : '#fff',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: timeRange === option ? '#0077FF' : '#333',
                                borderRadius: option === timeOptions[0] ? '8px 8px 0 0' :
                                  option === timeOptions[timeOptions.length - 1] ? '0 0 8px 8px' : '0'
                              }}
                              onMouseEnter={(e) => {
                                if (timeRange !== option) {
                                  e.currentTarget.style.background = '#f5f5f5';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (timeRange !== option) {
                                  e.currentTarget.style.background = '#fff';
                                }
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '300px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '16px'
                  }}>

                    <br />
                    <small style={{ marginTop: '8px', display: 'block' }}>
                      Chart n'wah
                    </small>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'Event Detection' && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>

              </div>
            )}

            {activeTab === 'Access Control' && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>

              </div>
            )}

            {activeTab === 'Maintenance' && (
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