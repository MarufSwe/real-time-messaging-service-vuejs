import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";

const app = createApp(App);

// WebSocket connection
const socketUrl = "ws://localhost:8000/ws/messages/";
const socket = new WebSocket(socketUrl);

// Attach the socket to the app's context
app.config.globalProperties.$socket = socket;

// Provide Axios globally to Vue
app.config.globalProperties.$http = axios;

// Mount the app
app.mount("#app");
