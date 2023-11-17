<template>
  <div class="chat-container">
    <!-- User Chat -->
    <div class="user-chat">
      <div class="chat-header">Your Chat</div>
      <div class="chat-messages">
        <div v-for="message in userMessages" :key="message.id" class="message">
          <span class="username">{{ message.sender }}:</span>
          <span class="text">{{ message.text }}</span>
        </div>
      </div>
      <div class="message-input">
        <input
          v-model="newUserMessage"
          @keyup.enter="sendMessage('user')"
          placeholder="Type a message..."
        />
        <button @click="sendMessage('user')" class="send-button">Send</button>
      </div>
    </div>

    <!-- Partner Chat -->
    <div class="partner-chat">
      <div class="chat-header">Partner's Chat</div>
      <div class="chat-messages">
        <div
          v-for="message in partnerMessages"
          :key="message.id"
          class="message"
        >
          <span class="username">{{ message.sender }}:</span>
          <span class="text">{{ message.text }}</span>
        </div>
      </div>
      <div class="message-input">
        <input
          v-model="newPartnerMessage"
          @keyup.enter="sendMessage('partner')"
          placeholder="Type a message..."
        />
        <button @click="sendMessage('partner')" class="send-button">
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      userMessages: [],
      partnerMessages: [],
      newUserMessage: "",
      newPartnerMessage: "",
    };
  },
  mounted() {
    // Setup WebSocket connection
    this.$socket = new WebSocket("ws://localhost:8000/");

    // WebSocket event listeners
    this.$socket.onopen = (event) => {
      console.log("WebSocket connection opened:", event);
    };

    this.$socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.recipient === "user") {
        this.userMessages.push(message);
      } else if (message.recipient === "partner") {
        this.partnerMessages.push(message);
      }
    };

    this.$socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    this.$socket.onerror = (event) => {
      console.error("WebSocket error:", event);
    };

    // Fetch existing messages
    this.fetchUserMessages();
    this.fetchPartnerMessages();
  },
  methods: {
    async fetchUserMessages() {
      try {
        const response = await axios.get("http://localhost:8000/api/messages/");
        this.userMessages = response.data.filter(
          (message) => message.recipient === "user"
        );
      } catch (error) {
        console.error("Error fetching user messages:", error);
      }
    },

    async fetchPartnerMessages() {
      try {
        const response = await axios.get("http://localhost:8000/api/messages/");
        this.partnerMessages = response.data.filter(
          (message) => message.recipient === "partner"
        );
      } catch (error) {
        console.error("Error fetching partner messages:", error);
      }
    },

    async sendMessage(recipient) {
      try {
        let messageText =
          recipient === "user" ? this.newUserMessage : this.newPartnerMessage;

        if (!messageText.trim()) {
          return; // Prevent sending empty messages
        }

        await axios.post("http://localhost:8000/api/messages/", {
          text: messageText,
          recipient,
        });

        if (recipient === "user") {
          this.newUserMessage = ""; // Clear the input field
        } else if (recipient === "partner") {
          this.newPartnerMessage = ""; // Clear the input field
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  justify-content: space-around;
  padding: 20px;
}

.user-chat,
.partner-chat {
  border: 1px solid #ccc;
  padding: 10px;
  width: 45%;
}

.chat-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.chat-messages {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.message {
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
  margin-right: 4px;
}

.message-input {
  display: flex;
  align-items: center;
}

.message-input input {
  flex: 1;
  padding: 8px;
  margin-right: 8px;
}

.send-button {
  padding: 8px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
