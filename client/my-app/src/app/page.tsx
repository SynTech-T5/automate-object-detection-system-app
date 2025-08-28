"use client";
import React, { useState } from 'react'; // Import React and useState hook for managing component stat

interface ModalProps { // Define the props for the Modal component
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // Children to be rendered inside the modal
}

const sampleCameraData = {
  id: "CAM001",
  name: "Front Ass Camera",
  location: "Main Entrance",
  type: "PTZ",
  ipAddressOption: "IP",
  ipAddress: "192.168.1.100",
  resolution: "1920x1080",
  status: true,
  lastMaintenance: "15-05-2025 at 10:08:19 PM"
};

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
        width: '40%',
        maxWidth: '1200px',
        height: '80vh',
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
            top: 35,
            right: 35,
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
  const [cameraData, setCameraData] = useState(sampleCameraData);
  const [formData, setFormData] = useState(sampleCameraData);

  // Location options
  const locationOptions = [
    "Main Entrance",
    "Libary - Floor 1",
    "Cafeteria",
    "Parking Lot A",
    "Domitory",
    "Science Building",
    "Admin building",
    "Gymnasium"
  ];

  // Camera type options
  const cameraTypeOptions = [
    "Fixed Camera",
    "PTZ",
    "Panoramic",
    "Thermal"
  ];

  // Resolution options
  const resolutionOptions = [
    "720p",
    "1080p",
    "4k"
  ];

  const IPOption =[
    "IP",
    "URL"
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    setCameraData(formData);
    setModalOpen(false);
    // Here you would typically send the data to your backend
    console.log('Saving camera data:', formData);
  };

  const handleCancel = () => {
    setFormData(cameraData); // Reset to original data
    setModalOpen(false);
  };

  const openModal = () => {
    setFormData(cameraData); // Initialize form with current data
    setModalOpen(true);
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333'
  };

  const fieldContainerStyle = {
    marginBottom: '20px'
  };


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

        ⓘ Edit
      </button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
          <h3 style={{
            fontWeight: '600',
            color: '#0070f3',
            marginBottom: '10px',
            marginTop: '5px'
          }}>
            Edit Camera: {cameraData.name}
          </h3>

          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px'
          }}>
            Last Maintenance Date: {cameraData.lastMaintenance}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            flex: 1
          }}>
            {/* Camera ID */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333',
                fontSize: '16px'
              }}>
                Camera ID
              </label>
              <input
                type="text"
                value={formData.id}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Camera Name */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333',
                fontSize: '16px'
              }}>
                Camera Name<span style ={{color: '#cf0000ff'}}>*</span> 
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="{camera_name}"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Location */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333',
                fontSize: '16px'
              }}>
                Location<span style ={{color: '#cf0000ff'}}>*</span> 
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                {locationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Camera Type */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333',
                fontSize: '16px'
              }}>
                Camera Type<span style ={{color: '#cf0000ff'}}>*</span> 
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                {cameraTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* IP Address */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333',
                fontSize: '16px'
              }}>
                IP Address<span style ={{color: '#cf0000ff'}}>*</span> 
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}>
               <select
                value={formData.ipAddressOption}
                onChange={(e) => handleInputChange('ipAddressOption', e.target.value)}
                style={{
                   padding: '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '60px'
                }}
              >
                {IPOption.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
                <div style={{
                  width: '1px',
                  height: '20px',
                  backgroundColor: '#ddd',
                  margin: '0 8px'
                }}></div>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    border: 'none',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333',
                fontSize: '16px'
              }}>
                Resolution<span style ={{color: '#cf0000ff'}}>*</span> 
              </label>
              <select
                value={formData.resolution}
                onChange={(e) => handleInputChange('resolution', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                {resolutionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginTop: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontWeight: '500',
              color: '#333',
              fontSize: '16px'
            }}>
              Status
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                position: 'relative',
                width: '50px',
                height: '24px',
                backgroundColor: formData.status ? '#4CAF50' : '#ccc',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
                onClick={() => handleInputChange('status', !formData.status)}>
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: formData.status ? '26px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
              </div>
              <span style={{ color: '#333', fontSize: '14px' }}>
                {formData.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '30px',
            paddingTop: '20px'         
          }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              style={{
                padding: '10px 20px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CameraDetail; 