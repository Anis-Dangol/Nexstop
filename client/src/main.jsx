import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "./components/ui/toaster";
import map from "./map/map";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={map}>
      <App />
      <Toaster />
    </Provider>
  </BrowserRouter>
);
