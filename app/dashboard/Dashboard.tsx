"use client"
import React, { useState, useEffect } from 'react';
import { UserButton } from "@clerk/nextjs";
import { 
  User, Calendar, MessageSquare, Settings, Search, 
  PlusCircle, Edit2, Save, X, Phone, Mail, Heart,
  ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import './styles.css';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const response = await fetch('/api/connections');
    const data = await response.json();
    setConnections(data);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
  };

  const renderSidebar = () => (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={toggleSidebar}><X size={24} /></button>
      <h2>Navigation</h2>
      <ul>
        <li onClick={() => setActiveView('connections')}>Connections</li>
        <li onClick={() => setActiveView('settings')}>Settings</li>
        {/* Add more navigation items as needed */}
      </ul>
    </div>
  );

  const addConnection = async () => {
    const newConnection = {
      name: 'New Connection',
      relationship: '',
      lastContact: '',
      nextContact: '',
      notes: '',
      importance: 'medium',
      lastConversation: '',
      ctos: "",
      futureTalkingPoints: []
    };
    const response = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConnection),
    });
    const data = await response.json();
    setConnections([...connections, { ...newConnection, _id: data.insertedId }]);
    setSelectedConnection({ ...newConnection, _id: data.insertedId });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (selectedConnection) {
      await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedConnection),
      });
      setConnections(connections.map(conn => 
        conn._id === selectedConnection._id ? selectedConnection : conn
      ));
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (selectedConnection) {
      console.log('Attempting to delete connection with ID:', selectedConnection._id);
      try {
        const response = await fetch(`/api/connections?id=${selectedConnection._id}`, { 
          method: 'DELETE'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Connection deleted successfully', data);
          setConnections(connections.filter(conn => conn._id !== selectedConnection._id));
          setSelectedConnection(null);
        } else {
          const errorData = await response.json();
          console.error('Failed to delete the connection:', errorData.error);
        }
      } catch (error) {
        console.error('Error deleting connection:', error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const closeDetailedView = () => {
    setSelectedConnection(null);
    setIsEditing(false);
  };

  const openDetailedView = (connection) => {
    setSelectedConnection(connection);
    setIsEditing(false);
  };

  const addField = (fieldType) => {
    if (fieldType === 'ctos') {
      setSelectedConnection({
        ...selectedConnection,
        ctos: [...selectedConnection.ctos, ''], // Add an empty string for a new CTO
      });
    } else if (fieldType === 'futureTalkingPoints') {
      setSelectedConnection({
        ...selectedConnection,
        futureTalkingPoints: [...selectedConnection.futureTalkingPoints, ''], // Add an empty string for a new talking point
      });
    }
  };

  const removeField = (fieldType, index) => {
    if (fieldType === 'ctos') {
      const newCtos = selectedConnection.ctos.filter((_, i) => i !== index);
      setSelectedConnection({ ...selectedConnection, ctos: newCtos });
    } else if (fieldType === 'futureTalkingPoints') {
      const newPoints = selectedConnection.futureTalkingPoints.filter((_, i) => i !== index);
      setSelectedConnection({ ...selectedConnection, futureTalkingPoints: newPoints });
    }
  };

  const getAiSuggestion = async (connection) => {
    const context = `Name: ${connection.name}, Relationship: ${connection.relationship}, Last Contact: ${connection.lastContact}, Notes: ${connection.notes}`;
    
    try {
      const response = await fetch('/api/ai-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(prev => ({ ...prev, [connection._id]: data.suggestion }));
      } else {
        console.error('Failed to get AI suggestion');
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    }
  };

  const renderConnections = () => {
    const filteredConnections = connections.filter(connection =>
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.relationship.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="connections-list">
        {filteredConnections.map(connection => (
          <div key={connection._id} className={`connection-card ${connection.importance}`} onClick={() => openDetailedView(connection)}>
            <div className="connection-header">
              <img src={`https://i.pravatar.cc/48?u=${connection._id}`} alt={connection.name} className="avatar" />
              <div className="connection-info">
                <h3>{connection.name}</h3>
                <p>{connection.relationship}</p>
              </div>
            </div>
            <div className="connection-body">
              <div className="icon-info">
                <div className="last-talked-about">
                  <p><strong>Last Talked About:</strong> {connection.lastTalkedAbout}</p>
                </div>
                <div className="date-icon">
                  <Phone size={16} />
                  <span>{connection.nextTalkDate}</span>
                </div>
                <div className="date-icon">
                  <Mail size={16} />
                  <span>{connection.lastTalkedDate}</span>
                </div>
              </div>
            </div>
            <div className="connection-footer">
              <Heart size={16} className={`importance ${connection.importance}`} />
              <span>{connection.lastConversation}</span>
            </div>
            <div className="ai-suggestion">
              <h4>AI Suggestion:</h4>
              {aiSuggestions[connection._id] ? (
                <p>{aiSuggestions[connection._id]}</p>
              ) : (
                <button onClick={(e) => {
                  e.stopPropagation();
                  getAiSuggestion(connection);
                }}>Get AI Suggestion</button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailedView = () => {
    if (!selectedConnection) return null;

    const ctos = Array.isArray(selectedConnection.ctos) ? selectedConnection.ctos : [];
    const futureTalkingPoints = Array.isArray(selectedConnection.futureTalkingPoints) ? selectedConnection.futureTalkingPoints : [];

    return (
        <div className="detailed-view-overlay" onClick={() => setSelectedConnection(null)}>
            <div className="detailed-view" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setSelectedConnection(null)}><X size={24} /></button>
                <h2>
                    <label>Name:</label>
                    {isEditing ? 
                        <input 
                            type="text" 
                            value={selectedConnection.name} 
                            onChange={(e) => setSelectedConnection({...selectedConnection, name: e.target.value})}
                            className="edit-input"
                        /> : 
                        selectedConnection.name
                    }
                </h2>
                <p>
                    <label>Relationship:</label>
                    {isEditing ? 
                        <input 
                            type="text" 
                            value={selectedConnection.relationship} 
                            onChange={(e) => setSelectedConnection({...selectedConnection, relationship: e.target.value})}
                            className="edit-input"
                        /> : 
                        selectedConnection.relationship
                    }
                </p>
                <h3>CTOs</h3>
                {ctos.map((cto, index) => (
                    <div key={index}>
                        {isEditing ? 
                            <input 
                                type="text" 
                                value={cto} 
                                onChange={(e) => {
                                    const newCtos = [...ctos];
                                    newCtos[index] = e.target.value;
                                    setSelectedConnection({...selectedConnection, ctos: newCtos});
                                }}
                                className="edit-input"
                            /> : 
                            <p>{cto}</p>
                        }
                    </div>
                ))}
                {isEditing && <button onClick={() => addField('ctos')}>Add CTO</button>}

                <h3>Future Talking Points</h3>
                {futureTalkingPoints.map((point, index) => (
                    <div key={index}>
                        {isEditing ? 
                            <input 
                                type="text" 
                                value={point} 
                                onChange={(e) => {
                                    const newPoints = [...futureTalkingPoints];
                                    newPoints[index] = e.target.value;
                                    setSelectedConnection({...selectedConnection, futureTalkingPoints: newPoints});
                                }}
                                className="edit-input"
                            /> : 
                            <p>{point}</p>
                        }
                    </div>
                ))}
                {isEditing && <button onClick={() => addField('futureTalkingPoints')}>Add Future Talking Point</button>}

                <h3>Notes</h3>
                {isEditing ? 
                    <textarea 
                        value={selectedConnection.notes} 
                        onChange={(e) => setSelectedConnection({...selectedConnection, notes: e.target.value})}
                        className="edit-textarea"
                    /> : 
                    <p>{selectedConnection.notes}</p>
                }

                <h3>Last Talked About</h3>
                {isEditing ? 
                    <input 
                        type="text" 
                        value={selectedConnection.lastTalkedAbout} 
                        onChange={(e) => setSelectedConnection({...selectedConnection, lastTalkedAbout: e.target.value})}
                        className="edit-input"
                    /> : 
                    <p>{selectedConnection.lastTalkedAbout}</p>
                }

                <h3>Last Talked Date</h3>
                <div className="date-icon">
                    {isEditing ? 
                        <input 
                            type="date" 
                            value={selectedConnection.lastTalkedDate} 
                            onChange={(e) => setSelectedConnection({...selectedConnection, lastTalkedDate: e.target.value})}
                            className="edit-input"
                        /> : 
                        <p>{selectedConnection.lastTalkedDate}</p>
                    }
                    <Phone size={16} />
                </div>

                <h3>Next Talk Date</h3>
                <div className="date-icon">
                    {isEditing ? 
                        <input 
                            type="date" 
                            value={selectedConnection.nextTalkDate} 
                            onChange={(e) => setSelectedConnection({...selectedConnection, nextTalkDate: e.target.value})}
                            className="edit-input"
                        /> : 
                        <p>{selectedConnection.nextTalkDate}</p>
                    }
                    <Mail size={16} />
                </div>

                <div className="action-buttons">
                    {isEditing ? 
                        <button className="save-btn" onClick={handleSave}><Save size={20} /> Save</button> :
                        <button className="edit-btn" onClick={handleEdit}><Edit2 size={20} /> Edit</button>
                    }
                    <button className="delete-btn" onClick={handleDelete}><Trash2 size={20} /> Delete</button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-left">
          <button onClick={toggleSidebar}>☰</button> 
          <img 
            src="https://avo.blob.core.windows.net/testcontainer/logo.png" 
            alt="Logo" 
            style={{ width: '50px', height: 'auto', marginRight: '8px' }}
          />
          <span>gurugen</span>
        </div>
        <div className="nav-center">
          <div className="search-bar">
            <Search size={24} className="search-icon" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search connections"
              className="search-input"
            />
          </div>
        </div>
        <div className="nav-right">
          <button className="new-connection-btn" onClick={addConnection}>
            <PlusCircle size={20} />
            New Connection
          </button>
          <UserButton />
        </div>
      </nav>
      {renderSidebar()} {/* Render the sidebar */}
      <div className="main-content">
        <div className="content">
          {renderConnections()}
          {renderDetailedView()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;