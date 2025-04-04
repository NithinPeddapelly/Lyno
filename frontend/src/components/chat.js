import React from 'react';
import PropTypes from 'prop-types';
import '../styles/chat.css';

// Chat component handles the display of messages and sending new messages
const Chat = ({ messages, sendMessage, newMessages, setNewMessages, username }) => {
  // State to manage the current input message
  const [message, setMessage] = React.useState('');

  // Function to handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (message.trim()) { // Ensure the message is not empty or just whitespace
      sendMessage(message); // Call the sendMessage function passed as a prop
      setMessage(''); // Clear the input field
      setNewMessages(0); // Reset the new message count
    }
  };

  return (
    <div className="chatRoom">
      <div className="chatContainer">
        <h1>Chat</h1>
        {/* Display the list of messages */}
        <div className="chattingDisplay">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                {/* Display the sender's name */}
                <p style={{ fontWeight: 'bold' }}>{msg.sender}</p>
                {/* Display the message content */}
                <p>{msg.data}</p>
              </div>
            ))
          ) : (
            // Show a placeholder if there are no messages
            <p>No messages yet</p>
          )}
        </div>
        {/* Input area for typing and sending messages */}
        <form onSubmit={handleSendMessage} className="chattingArea">
          <input
            type="text"
            value={message} // Bind input value to the message state
            onChange={(e) => setMessage(e.target.value)} // Update state on input change
            placeholder="Type a message" // Placeholder text for the input
            required // Make the input field required
          />
          <button type="submit">Send</button> {/* Button to send the message */}
        </form>
      </div>
    </div>
  );
};

// Define the expected prop types for the Chat component
Chat.propTypes = {
  messages: PropTypes.array.isRequired, // Array of message objects
  sendMessage: PropTypes.func.isRequired, // Function to send a message
  newMessages: PropTypes.number.isRequired, // Number of new messages
  setNewMessages: PropTypes.func.isRequired, // Function to reset new message count
  username: PropTypes.string.isRequired, // Username of the current user
};

export default Chat; // Export the Chat component